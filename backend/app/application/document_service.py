from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, BinaryIO, Protocol
from uuid import uuid4

from backend.app.domain.document_search import chunk_page_text, rank_chunks


class DocumentError(Exception):
    """Base class for document-corpus errors safe to show at the HTTP edge."""


class UnsupportedDocumentError(DocumentError):
    """Raised when an upload is not a PDF document."""


class DocumentTooLargeError(DocumentError):
    """Raised when an upload exceeds the configured byte limit."""


class DocumentLimitError(DocumentError):
    """Raised when document extraction crosses a configured safety limit."""


class DocumentCapacityError(DocumentError):
    """Raised when the local MVP corpus is already full."""


class DocumentExtractionError(DocumentError):
    """Raised when a PDF cannot be read safely."""


class DocumentTextUnavailableError(DocumentError):
    """Raised for scans or documents without extractable embedded text."""


class DocumentNotFoundError(DocumentError):
    """Raised when an opaque document identifier is unknown."""


@dataclass(frozen=True)
class DocumentLimits:
    max_upload_bytes: int
    max_documents: int
    max_pages: int
    max_extracted_chars: int
    chunk_chars: int
    chunk_overlap_chars: int
    max_page_content_bytes: int


@dataclass(frozen=True)
class StagedDocument:
    document_id: str
    path: Path
    size_bytes: int
    sha256: str


@dataclass(frozen=True)
class ExtractedPdf:
    page_count: int
    pages: list[tuple[int, str]]


class DocumentRepository(Protocol):
    def ensure_capacity(self, *, max_documents: int) -> None: ...

    def stage_upload(
        self,
        *,
        document_id: str,
        source: BinaryIO,
        max_upload_bytes: int,
    ) -> StagedDocument: ...

    def discard_staged(self, staged: StagedDocument) -> None: ...

    def commit(
        self,
        *,
        staged: StagedDocument,
        document: dict[str, Any],
        chunks: list[dict[str, Any]],
        max_documents: int,
    ) -> None: ...

    def list_documents(self) -> list[dict[str, Any]]: ...

    def get_document(self, document_id: str) -> dict[str, Any] | None: ...

    def delete_document(self, document_id: str) -> dict[str, Any] | None: ...

    def list_chunks(self, document_ids: set[str] | None = None) -> list[dict[str, Any]]: ...

    def file_path(self, document_id: str) -> Path | None: ...


class PdfTextExtractor(Protocol):
    def extract(
        self,
        path: Path,
        *,
        max_pages: int,
        max_extracted_chars: int,
        max_page_content_bytes: int,
    ) -> ExtractedPdf: ...


class DocumentService:
    """Coordinates local upload, text extraction and transparent retrieval."""

    def __init__(
        self,
        repository: DocumentRepository,
        extractor: PdfTextExtractor,
        limits: DocumentLimits,
    ) -> None:
        if limits.chunk_overlap_chars >= limits.chunk_chars:
            raise ValueError("Перекрытие фрагментов должно быть меньше размера фрагмента.")
        self._repository = repository
        self._extractor = extractor
        self._limits = limits

    def upload(
        self,
        *,
        filename: str | None,
        content_type: str | None,
        source: BinaryIO,
    ) -> dict[str, Any]:
        del content_type  # MIME is advisory; the repository checks PDF bytes.
        display_name = self._safe_pdf_filename(filename)
        document_id = f"DOC-{uuid4().hex[:12].upper()}"
        staged: StagedDocument | None = None
        committed = False

        try:
            self._repository.ensure_capacity(
                max_documents=self._limits.max_documents,
            )
            staged = self._repository.stage_upload(
                document_id=document_id,
                source=source,
                max_upload_bytes=self._limits.max_upload_bytes,
            )
            extracted = self._extractor.extract(
                staged.path,
                max_pages=self._limits.max_pages,
                max_extracted_chars=self._limits.max_extracted_chars,
                max_page_content_bytes=self._limits.max_page_content_bytes,
            )
            chunks = [
                chunk
                for page, text in extracted.pages
                for chunk in chunk_page_text(
                    document_id=document_id,
                    page=page,
                    text=text,
                    chunk_chars=self._limits.chunk_chars,
                    overlap_chars=self._limits.chunk_overlap_chars,
                )
            ]
            if not chunks:
                raise DocumentTextUnavailableError(
                    "В PDF не найден извлекаемый текст. Для сканированных документов потребуется OCR."
                )

            now = datetime.now(timezone.utc).isoformat()
            document = {
                "id": document_id,
                "filename": display_name,
                "stored_filename": f"{document_id}.pdf",
                "uploaded_at": now,
                "sha256": staged.sha256,
                "size_bytes": staged.size_bytes,
                "page_count": extracted.page_count,
                "text_page_count": len(extracted.pages),
                "chunk_count": len(chunks),
                "status": "ready",
            }
            self._repository.commit(
                staged=staged,
                document=document,
                chunks=chunks,
                max_documents=self._limits.max_documents,
            )
            committed = True
            return self._public_document(document)
        finally:
            if staged is not None and not committed:
                self._repository.discard_staged(staged)

    def list_documents(self) -> dict[str, Any]:
        documents = [self._public_document(item) for item in self._repository.list_documents()]
        return {"items": documents, "total": len(documents)}

    def delete_document(self, document_id: str) -> dict[str, Any]:
        document = self._repository.delete_document(document_id)
        if document is None:
            raise DocumentNotFoundError("Документ не найден.")
        return self._public_document(document)

    def search(
        self,
        *,
        query: str,
        document_ids: list[str],
        limit: int,
    ) -> dict[str, Any]:
        selected_ids = set(document_ids) if document_ids else None
        documents = {item["id"]: item for item in self._repository.list_documents()}
        if selected_ids is not None and not selected_ids.issubset(documents):
            raise DocumentNotFoundError("Один или несколько выбранных документов не найдены.")
        chunks = self._repository.list_chunks(selected_ids)
        enriched_chunks = [
            {**chunk, "document_name": documents.get(chunk["document_id"], {}).get("filename", "Документ")}
            for chunk in chunks
            if chunk.get("document_id") in documents
        ]
        results = rank_chunks(query, enriched_chunks, limit=limit)
        items = [
            {
                "document_id": item["document_id"],
                "document_name": item["document_name"],
                "page": item["page"],
                "chunk_id": item["id"],
                "excerpt": item["excerpt"],
                "score": item["score"],
                "citation": {
                    "document": item["document_name"],
                    "location": f"стр. {item['page']}",
                    "url": f"/api/documents/{item['document_id']}/file#page={item['page']}",
                },
            }
            for item in results
        ]
        return {"query": query, "items": items, "total": len(items)}

    def open_file(self, document_id: str) -> dict[str, Any]:
        document = self._repository.get_document(document_id)
        file_path = self._repository.file_path(document_id)
        if document is None or file_path is None:
            raise DocumentNotFoundError("Документ не найден.")
        return {"path": file_path, "filename": str(document["filename"])}

    @staticmethod
    def _safe_pdf_filename(filename: str | None) -> str:
        value = (filename or "").replace("\\", "/").split("/")[-1].strip()
        value = "".join(char for char in value if char.isprintable())[:240]
        if not value or not value.casefold().endswith(".pdf"):
            raise UnsupportedDocumentError("Можно загрузить только PDF-файл.")
        return value

    @staticmethod
    def _public_document(document: dict[str, Any]) -> dict[str, Any]:
        return {
            key: document[key]
            for key in (
                "id",
                "filename",
                "uploaded_at",
                "sha256",
                "size_bytes",
                "page_count",
                "text_page_count",
                "chunk_count",
                "status",
            )
        }

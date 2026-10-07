from __future__ import annotations

import asyncio

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.presentation.api import document_upload_content_length_exceeds_limit, router

app = FastAPI(title="Навигатор доказательств по ПАВ API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router)


@app.middleware("http")
async def reject_oversized_document_upload(request: Request, call_next):
    if (
        request.method == "POST"
        and request.url.path == "/api/documents"
        and document_upload_content_length_exceeds_limit(request.headers.get("content-length"))
    ):
        return JSONResponse(
            status_code=413,
            content={"detail": "Размер запроса превышает допустимый лимит загрузки документа."},
        )
    return await call_next(request)


async def _serve() -> None:
    import uvicorn

    config = settings()
    await uvicorn.Server(uvicorn.Config(app, host=config.host, port=config.port, log_level="info")).serve()


if __name__ == "__main__":
    asyncio.run(_serve())

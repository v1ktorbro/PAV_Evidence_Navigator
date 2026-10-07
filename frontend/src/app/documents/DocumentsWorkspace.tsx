import scss from "./documentsWorkspace.module.scss";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import {
  getDocumentFile,
  getDocuments,
  searchDocuments,
  uploadDocument,
} from "../../api/documents";
import type {
  DocumentCitation,
  DocumentMetadata,
  DocumentSearchResponse,
} from "../../assets/types/documents";
import Button from "../../components/ui/Button/Button";
import Field from "../../components/ui/Field/Field";
import Input from "../../components/ui/Input/Input";
import Loader from "../../components/ui/Loader/Loader";
import Textarea from "../../components/ui/Textarea/Textarea";

const SEARCH_LIMIT = 10;
const MAX_SELECTED_DOCUMENTS = 50;

const formatFileSize = (sizeBytes: number) => {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} КБ`;
  }

  return `${(sizeBytes / (1024 * 1024)).toLocaleString("ru-RU", {
    maximumFractionDigits: 1,
  })} МБ`;
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatDocumentStatus = (status: DocumentMetadata["status"]) => {
  if (status === "ready") return "Готов к поиску";

  return status;
};

const DocumentsWorkspace = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentsRef = useRef<DocumentMetadata[]>([]);
  const [documents, setDocuments] = useState<DocumentMetadata[]>();
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [accessToken, setAccessToken] = useState("");
  const [question, setQuestion] = useState("");
  const [searchResult, setSearchResult] = useState<DocumentSearchResponse>();
  const [documentsError, setDocumentsError] = useState<string>();
  const [uploadError, setUploadError] = useState<string>();
  const [uploadSuccess, setUploadSuccess] = useState<string>();
  const [questionError, setQuestionError] = useState<string>();
  const [selectionError, setSelectionError] = useState<string>();
  const [searchError, setSearchError] = useState<string>();
  const [sourceError, setSourceError] = useState<string>();
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpeningSource, setIsOpeningSource] = useState(false);

  const loadDocuments = useCallback(async (nextAccessToken?: string) => {
    setIsDocumentsLoading(true);
    setDocumentsError(undefined);

    try {
      const loadedDocuments = await getDocuments(nextAccessToken);
      const documentsById = new Map(
        documentsRef.current.map((document) => [document.id, document]),
      );

      loadedDocuments.forEach((document) => {
        documentsById.set(document.id, document);
      });

      const nextDocuments = Array.from(documentsById.values()).sort(
        (left, right) => right.uploadedAt.localeCompare(left.uploadedAt),
      );

      documentsRef.current = nextDocuments;
      setDocuments(nextDocuments);
      setSelectedDocumentIds((current) => {
        if (current.length) {
          return current.filter((documentId) =>
            nextDocuments.some((document) => document.id === documentId),
          );
        }

        return nextDocuments
          .slice(0, MAX_SELECTED_DOCUMENTS)
          .map((document) => document.id);
      });
    } catch (error) {
      setDocumentsError(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить корпус документов.",
      );
    } finally {
      setIsDocumentsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDocuments();
  }, [loadDocuments]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0]);
    setUploadError(undefined);
    setUploadSuccess(undefined);
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadError(undefined);
    setUploadSuccess(undefined);

    if (!selectedFile) {
      setUploadError("Выберите PDF-файл для загрузки.");
      return;
    }

    setIsUploading(true);

    try {
      const uploadedDocument = await uploadDocument(selectedFile, accessToken);
      const nextDocuments = [
        uploadedDocument,
        ...documentsRef.current.filter(
          (document) => document.id !== uploadedDocument.id,
        ),
      ];

      documentsRef.current = nextDocuments;
      setDocuments(nextDocuments);
      setSelectedDocumentIds((current) =>
        current.length < MAX_SELECTED_DOCUMENTS
          ? [...new Set([...current, uploadedDocument.id])]
          : current,
      );
      setSelectedFile(undefined);
      setUploadSuccess(
        `Файл «${uploadedDocument.filename}» добавлен в корпус.`,
      );

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить PDF-файл.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentSelectionChange = (
    documentId: string,
    isSelected: boolean,
  ) => {
    setSelectionError(undefined);
    setSelectedDocumentIds((current) => {
      if (!isSelected) {
        return current.filter((currentId) => currentId !== documentId);
      }

      if (current.includes(documentId)) return current;

      if (current.length >= MAX_SELECTED_DOCUMENTS) {
        setSelectionError(
          `Для одного поиска можно выбрать не более ${MAX_SELECTED_DOCUMENTS} документов.`,
        );
        return current;
      }

      return [...current, documentId];
    });
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedQuestion = question.trim();
    setQuestionError(undefined);
    setSearchError(undefined);

    if (normalizedQuestion.length < 3) {
      setQuestionError("Сформулируйте вопрос минимум из трёх символов.");
      return;
    }

    if (!documents?.length) {
      setSearchError("Сначала загрузите хотя бы один PDF-файл.");
      return;
    }

    if (!selectedDocumentIds.length) {
      setSearchError("Выберите хотя бы один документ для поиска.");
      return;
    }

    setIsSearching(true);

    try {
      const response = await searchDocuments(
        {
          query: normalizedQuestion,
          documentIds: selectedDocumentIds,
          limit: SEARCH_LIMIT,
        },
        accessToken,
      );
      setSearchResult(response);
      setQuestion("");
    } catch (error) {
      setSearchError(
        error instanceof Error
          ? error.message
          : "Не удалось выполнить поиск по документам.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleAccessSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadDocuments(accessToken);
  };

  const handleOpenSource = async (citation: DocumentCitation) => {
    setSourceError(undefined);
    const sourceWindow = window.open("", "_blank");

    setIsOpeningSource(true);
    try {
      const file = await getDocumentFile(citation.url, accessToken);
      const fileUrl = URL.createObjectURL(file);

      if (sourceWindow) {
        sourceWindow.opener = null;
        sourceWindow.location.replace(fileUrl);
      } else {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = citation.document;
        document.body.append(link);
        link.click();
        link.remove();
      }

      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60_000);
    } catch (error) {
      sourceWindow?.close();
      setSourceError(
        error instanceof Error
          ? error.message
          : "Не удалось открыть исходный PDF-файл.",
      );
    } finally {
      setIsOpeningSource(false);
    }
  };

  if (isDocumentsLoading && !documents) {
    return (
      <main className={scss.root}>
        <Loader variant="page" label="Загружаем корпус документов…" />
      </main>
    );
  }

  if (documentsError && !documents) {
    return (
      <main className={scss.root}>
        <section className={scss.panel} aria-labelledby="documents-load-error">
          <p className={scss.eyebrow}>Корпус документов</p>
          <h1 id="documents-load-error">Документы пока недоступны</h1>
          <p className={scss.muted}>{documentsError}</p>
          <form className={scss.accessForm} onSubmit={handleAccessSubmit}>
            <Field
              label="Код доступа команды"
              htmlFor="document-access-token"
              hint="Нужен только в защищённом развёртывании. Локально поле можно оставить пустым."
            >
              <Input
                id="document-access-token"
                type="password"
                value={accessToken}
                onChange={(event) => setAccessToken(event.target.value)}
                autoComplete="off"
              />
            </Field>
            <Button
              type="submit"
              variant="secondary"
              disabled={isDocumentsLoading}
            >
              Открыть корпус
            </Button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className={scss.root}>
      <header className={scss.header}>
        <h1>Работа с документами</h1>
        <p className={scss.lead}>
          Загрузите научные статьи и отчёты, задайте вопрос и найдите фрагменты
          первоисточников для последующей экспертной проверки.
        </p>
      </header>

      {documentsError && (
        <section className={scss.errorBanner} role="alert">
          <p>{documentsError}</p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadDocuments(accessToken)}
            disabled={isDocumentsLoading || isUploading}
          >
            Повторить
          </Button>
        </section>
      )}

      <section className={scss.workspace} aria-label="Корпус документов">
        <article className={scss.panel}>
          <div className={scss.sectionHeading}>
            <div>
              <p className={scss.eyebrow}>Шаг 1</p>
              <h2>Добавьте PDF-файл</h2>
            </div>
          </div>
          <form className={scss.uploadForm} onSubmit={handleUpload}>
            <Field
              label="Научная статья или отчёт"
              htmlFor="document-upload"
              hint="Поддерживаются PDF-файлы. После загрузки текст будет доступен для поиска."
              error={uploadError}
              required
            >
              <input
                ref={fileInputRef}
                id="document-upload"
                className={scss.fileInput}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                disabled={isUploading || isDocumentsLoading}
              />
            </Field>
            <div className={scss.uploadActions}>
              <Button
                type="submit"
                disabled={isUploading || isDocumentsLoading}
              >
                {isUploading ? "Добавляем документ…" : "Загрузить PDF"}
              </Button>
              {selectedFile && <span>{selectedFile.name}</span>}
            </div>
            {uploadSuccess && (
              <p className={scss.successMessage} role="status">
                {uploadSuccess}
              </p>
            )}
          </form>
        </article>

        <article className={scss.panel}>
          <div className={scss.sectionHeading}>
            <div>
              <p className={scss.eyebrow}>Корпус</p>
              <h2>Документы для поиска</h2>
            </div>
            <span className={scss.count}>
              {documents?.length ?? 0}{" "}
              {documents?.length === 1 ? "файл" : "файлов"}
            </span>
          </div>

          {documents?.length ? (
            <fieldset className={scss.documentSelection}>
              <legend>
                Выбрано {selectedDocumentIds.length} из {documents.length}
              </legend>
              <p className={scss.muted}>
                В поиск попадут отмеченные документы. За один запрос можно
                выбрать до {MAX_SELECTED_DOCUMENTS} файлов.
              </p>
              {selectionError && (
                <p className={scss.selectionError} role="alert">
                  {selectionError}
                </p>
              )}
              <ul className={scss.documentList}>
                {documents.map((document) => {
                  const checkboxId = `document-${document.id}`;
                  const isSelected = selectedDocumentIds.includes(document.id);

                  return (
                    <li key={document.id} className={scss.documentItem}>
                      <input
                        id={checkboxId}
                        className={scss.documentCheckbox}
                        type="checkbox"
                        checked={isSelected}
                        onChange={(event) =>
                          handleDocumentSelectionChange(
                            document.id,
                            event.target.checked,
                          )
                        }
                      />
                      <label
                        className={scss.documentLabel}
                        htmlFor={checkboxId}
                      >
                        <span className={scss.documentTopLine}>
                          <strong>{document.filename}</strong>
                          <span className={scss.status}>
                            {formatDocumentStatus(document.status)}
                          </span>
                        </span>
                        <span className={scss.documentMeta}>
                          <span>{formatFileSize(document.sizeBytes)}</span>
                          <span>{document.pageCount} стр.</span>
                          <span>{document.textPageCount} с текстом</span>
                          <span>{document.chunkCount} фрагментов</span>
                        </span>
                        <span className={scss.documentDate}>
                          Добавлен: {formatDate(document.uploadedAt)}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ) : (
            <div className={scss.emptyState}>
              <h3>Корпус пока пуст</h3>
              <p>
                Добавьте PDF со статьёй, отчётом или технической документацией,
                чтобы начать поиск.
              </p>
            </div>
          )}
        </article>
      </section>

      <section className={`${scss.panel} ${scss.searchPanel}`}>
        <div className={scss.sectionHeading}>
          <div>
            <p className={scss.eyebrow}>Шаг 2</p>
            <h2>Задайте исследовательский вопрос</h2>
          </div>
        </div>
        <form className={scss.questionForm} onSubmit={handleSearch}>
          <Field
            label="Вопрос к выбранным документам"
            htmlFor="document-question"
            hint="Например: «Какие ПАВ показали устойчивость эмульсии при pH 5–7?»"
            error={questionError}
            required
          >
            <Textarea
              id="document-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Сформулируйте вопрос, на который нужно найти подтверждение в документах"
              rows={4}
              disabled={isSearching}
            />
          </Field>
          {searchError && (
            <p className={scss.selectionError} role="alert">
              {searchError}
            </p>
          )}
          <div className={scss.questionActions}>
            <Button
              type="submit"
              disabled={
                isSearching || !documents?.length || !selectedDocumentIds.length
              }
            >
              {isSearching ? "Ищем фрагменты…" : "Найти доказательства"}
            </Button>
            <span>
              Будет показано до {SEARCH_LIMIT} наиболее релевантных фрагментов.
            </span>
          </div>
        </form>
      </section>

      {isSearching && (
        <section className={scss.searchLoading} aria-live="polite">
          <Loader
            variant="inline"
            label="Ищем фрагменты в выбранных документах…"
          />
        </section>
      )}

      {searchResult && !isSearching && (
        <section className={scss.searchResults} aria-live="polite">
          <div className={scss.resultsHeading}>
            <div>
              <p className={scss.eyebrow}>Кандидаты на доказательства</p>
              <h2>Фрагменты по вопросу</h2>
              <p className={scss.muted}>«{searchResult.query}»</p>
            </div>
            <span className={scss.count}>
              {searchResult.total}{" "}
              {searchResult.total === 1 ? "результат" : "результатов"}
            </span>
          </div>

          {searchResult.items.length ? (
            <ol className={scss.resultList}>
              {searchResult.items.map((item) => (
                <li key={item.chunkId} className={scss.resultItem}>
                  <article>
                    <div className={scss.citationHeading}>
                      <div>
                        <p className={scss.citationDocument}>
                          {item.documentName}
                        </p>
                        <p className={scss.citationLocation}>
                          {item.citation.location}
                        </p>
                      </div>
                      <button
                        type="button"
                        className={scss.sourceLink}
                        aria-label={`Открыть источник: ${item.citation.document}, ${item.citation.location}`}
                        onClick={() => void handleOpenSource(item.citation)}
                        disabled={isOpeningSource}
                      >
                        {isOpeningSource ? "Открываем…" : "Открыть источник"}
                      </button>
                    </div>
                    <blockquote>{item.excerpt}</blockquote>
                    <p className={scss.relevance}>
                      Соответствие запросу:{" "}
                      {item.score.toLocaleString("ru-RU", {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </article>
                </li>
              ))}
            </ol>
          ) : (
            <div className={scss.emptyState}>
              <h3>Подтверждающих фрагментов не найдено</h3>
              <p>
                Попробуйте уточнить термины, условия эксперимента или выбрать
                другие документы.
              </p>
            </div>
          )}
          <aside className={scss.retrievalNotice}>
            <strong>Это этап поиска, а не готовый научный вывод.</strong>
            <p>
              Найденные фрагменты нужно сверить с методикой и условиями опыта, а
              затем подтвердить как факты в <a href="/">доказательной базе</a>.
            </p>
          </aside>
          {sourceError && (
            <p className={scss.sourceError} role="alert">
              {sourceError}
            </p>
          )}
        </section>
      )}
    </main>
  );
};

export default DocumentsWorkspace;

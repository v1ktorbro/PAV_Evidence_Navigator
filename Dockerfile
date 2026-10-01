FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PYTHONIOENCODING=utf-8
WORKDIR /service

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend ./backend
COPY .env.example ./.env.example
COPY pytest.ini ./pytest.ini

RUN useradd --create-home appuser && chown -R appuser /service
USER appuser

EXPOSE 8091
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8091/api/health', timeout=4)"
CMD ["python", "-m", "backend.app.main"]

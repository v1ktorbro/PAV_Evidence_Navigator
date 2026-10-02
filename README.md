# Навигатор доказательств по ПАВ

Монорепозиторий с независимыми frontend и backend для работы с демонстрационным корпусом лабораторных опытов ПАВ. Данные синтетические: приложение помогает сопоставить источники и ограничения, но не выбирает рецептуру для промышленного внедрения.

## Структура

```text
backend/   FastAPI API, Clean Architecture и корпус данных
frontend/  React 18 + TypeScript + Vite + SCSS Modules
.agents/   локальные skills и соглашения для дальнейшей разработки
```

Backend сохраняет REST-контракт на `/api`: `health`, `evidence`, `analysis` и интеграцию с Synapse. Frontend обращается к нему через Vite proxy в разработке либо через `VITE_API_BASE_URL` в другом окружении.

## Запуск

1. Запустите backend: `docker compose up --build backend`.
2. В отдельном терминале перейдите в `frontend`, выполните `npm install`, затем `npm run dev`.
3. Откройте `http://localhost:5173`.

Для Synapse скопируйте `.env.example` в `.env` и заполните параметры. Секреты не добавляйте в репозиторий.

## Проверки

- Frontend: `cd frontend && npm run lint && npm run build`
- Backend: `pytest backend/tests` в настроенном Python-окружении или проверка API внутри контейнера.

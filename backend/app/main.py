from __future__ import annotations

import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import settings
from backend.app.presentation.api import router

app = FastAPI(title="Навигатор доказательств по ПАВ API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router)


async def _serve() -> None:
    import uvicorn

    config = settings()
    await uvicorn.Server(uvicorn.Config(app, host=config.host, port=config.port, log_level="info")).serve()


if __name__ == "__main__":
    asyncio.run(_serve())

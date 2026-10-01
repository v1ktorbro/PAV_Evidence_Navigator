from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.config import ROOT, settings
from app.evidence import brief_for_synapse, explain_selection, filter_evidence, load_evidence
from app.synapse import SynapseClient, SynapseError, public_project

STATIC_DIR = ROOT / "app" / "static"
app = FastAPI(title="ПАВ Evidence Navigator", version="0.1.0")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


class AnalysisBody(BaseModel):
    question: str = Field(min_length=5, max_length=1200)
    experiment_ids: list[str] = Field(default_factory=list, max_length=30)


def selected_rows(ids: list[str]) -> list[dict[str, Any]]:
    rows = load_evidence()
    if not ids:
        return rows
    wanted = set(ids)
    selected = [row for row in rows if row["id"] in wanted]
    if not selected:
        raise HTTPException(status_code=404, detail="Не найдены выбранные опыты.")
    return selected


@app.get("/")
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/api/health")
def health() -> dict[str, Any]:
    config = settings()
    return {"ok": True, "evidence_records": len(load_evidence()), "synapse_configured": config.synapse_configured}


@app.get("/api/evidence")
def evidence(
    min_temperature: float | None = None,
    max_temperature: float | None = None,
    max_salinity: float | None = None,
    rock_type: str | None = None,
    comparable_only: bool = False,
) -> dict[str, Any]:
    rows = filter_evidence(
        load_evidence(),
        min_temperature=min_temperature,
        max_temperature=max_temperature,
        max_salinity=max_salinity,
        rock_type=rock_type,
        comparable_only=comparable_only,
    )
    return {"items": rows, "summary": explain_selection(rows)}


@app.post("/api/analysis")
def analysis(body: AnalysisBody) -> dict[str, Any]:
    rows = selected_rows(body.experiment_ids)
    return {
        "question": body.question,
        "items": rows,
        "summary": explain_selection(rows),
        "synapse_prompt": brief_for_synapse(body.question, rows),
    }


@app.get("/api/synapse/config")
def synapse_config() -> dict[str, Any]:
    config = settings()
    return {"configured": config.synapse_configured, "approval_mode": config.synapse_approval_mode}


@app.post("/api/synapse/projects")
def start_synapse_research(body: AnalysisBody) -> dict[str, Any]:
    rows = selected_rows(body.experiment_ids)
    client = SynapseClient(settings())
    try:
        project = client.create_project(brief_for_synapse(body.question, rows))
    except SynapseError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return public_project(project, client)


@app.get("/api/synapse/projects/{project_id}")
def synapse_project(project_id: str) -> dict[str, Any]:
    client = SynapseClient(settings())
    try:
        project = client.get_project(project_id)
    except SynapseError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return public_project(project, client)


async def _serve() -> None:
    import uvicorn

    config = settings()
    server = uvicorn.Server(uvicorn.Config(app, host=config.host, port=config.port, log_level="info"))
    await server.serve()


if __name__ == "__main__":
    asyncio.run(_serve())

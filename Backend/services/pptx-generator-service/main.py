import logging
import os
import time
from typing import Any

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pythonjsonlogger import jsonlogger
from pydantic import BaseModel

from slide_merger import (
    build_presentation,
    get_available_slides,
)

_handler = logging.StreamHandler()
_handler.setFormatter(jsonlogger.JsonFormatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
logging.basicConfig(level=logging.INFO, handlers=[_handler])
logger = logging.getLogger("pptx_generator")

app = FastAPI(title="Playpiso Proposal Generator")

_cors_origins_raw = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
_cors_origins = [o.strip() for o in _cors_origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    t0 = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - t0) * 1000, 1)
    logger.info(
        "request",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
        },
    )
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(
        "unhandled_exception",
        extra={"method": request.method, "path": request.url.path},
        exc_info=exc,
    )
    return JSONResponse(status_code=500, content={"error": "internal_server_error"})


class ProductGroupRequest(BaseModel):
    productId: str
    quantity: int
    variantId: str
    values: dict[str, Any]
    sumarioText: str
    investimentoRows: list[str]


class SlideEntryRequest(BaseModel):
    slideId: str
    templateFile: str
    dynamic: str | None = None
    groupIndex: int | None = None


class GenerateRequest(BaseModel):
    slides: list[SlideEntryRequest] | None = None   # novo formato
    slideIds: list[str] | None = None               # legado
    globalValues: dict[str, Any]
    productGroups: list[ProductGroupRequest]


@app.get("/slides-disponiveis", response_model=list[str])
def slides_disponiveis() -> list[str]:
    return get_available_slides()


@app.post("/gerar-proposta")
def gerar_proposta(req: GenerateRequest) -> Response:
    use_rich = req.slides is not None
    logger.info(
        "generate_request",
        extra={
            "slide_count": len(req.slides) if use_rich else len(req.slideIds or []),
            "format": "rich" if use_rich else "legacy",
        },
    )

    pptx_bytes = build_presentation(req)

    logger.info("generate_response", extra={"size_bytes": len(pptx_bytes)})
    return Response(
        content=pptx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": 'attachment; filename="proposta.pptx"'},
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

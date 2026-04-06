"""
Dependências compartilhadas: autenticação de workflow e rate limiting por cliente/token.
"""
from __future__ import annotations

import hashlib
import logging
import os
import time
from collections import defaultdict

from fastapi import Header, HTTPException, Request

logger = logging.getLogger(__name__)

# ─── Auth ───────────────────────────────────────────────────────────────────

# WORKFLOW_API_TOKEN: segredo compartilhado com o proxy Next.js (app/api/backend), nunca no browser.
# Sem token: só aceito com WORKFLOW_AUTH_ALLOW_MISSING=1 (desenvolvimento local explícito).


def _workflow_auth_allow_missing() -> bool:
    return os.getenv("WORKFLOW_AUTH_ALLOW_MISSING", "").strip().lower() in ("1", "true", "yes")


def _is_production() -> bool:
    return (
        os.getenv("ENVIRONMENT", "").strip().lower() == "production"
        or os.getenv("RAILWAY_ENVIRONMENT", "").strip().lower() == "production"
    )


def verify_workflow_token(
    authorization: str | None = Header(None),
    x_workflow_token: str | None = Header(None, alias="X-Workflow-Token"),
) -> bool:
    expected = os.getenv("WORKFLOW_API_TOKEN", "").strip()
    if not expected:
        if _workflow_auth_allow_missing():
            if _is_production():
                raise HTTPException(
                    status_code=503,
                    detail="WORKFLOW_AUTH_ALLOW_MISSING não é permitido em produção. Defina WORKFLOW_API_TOKEN.",
                )
            logger.warning(
                "WORKFLOW_API_TOKEN não definido — endpoints de workflow sem autenticação "
                "(WORKFLOW_AUTH_ALLOW_MISSING=1; apenas desenvolvimento)."
            )
            return True
        raise HTTPException(
            status_code=503,
            detail=(
                "Autenticação de workflow não configurada: defina WORKFLOW_API_TOKEN "
                "ou WORKFLOW_AUTH_ALLOW_MISSING=1 apenas em desenvolvimento local."
            ),
        )
    token: str | None = None
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    elif x_workflow_token:
        token = x_workflow_token.strip()
    if not token or token != expected:
        raise HTTPException(
            status_code=401,
            detail="Credenciais de workflow inválidas ou ausentes.",
        )
    return True


# ─── Rate limiting (memória, por token/IP) ────────────────────────────────────

_create_buckets: dict[str, list[float]] = defaultdict(list)
_stream_buckets: dict[str, list[float]] = defaultdict(list)


def _bucket_key(request: Request, authorization: str | None) -> str:
    if authorization:
        return hashlib.sha256(authorization.encode()).hexdigest()[:24]
    host = request.client.host if request.client else "unknown"
    return f"ip:{host}"


def _trim_and_check(bucket: list[float], now: float, window_sec: float, max_events: int) -> None:
    bucket[:] = [t for t in bucket if now - t < window_sec]
    if len(bucket) >= max_events:
        raise HTTPException(
            status_code=429,
            detail="Limite de requisições excedido. Tente novamente em instantes.",
        )


def check_workflow_create_rate_limit(
    request: Request,
    authorization: str | None = Header(None),
) -> None:
    """Limita criação de runs (abuse / quota)."""
    key = _bucket_key(request, authorization)
    now = time.time()
    window = 60.0
    max_creates = int(os.getenv("WORKFLOW_RATE_LIMIT_CREATE_PER_MIN", "20"))
    _trim_and_check(_create_buckets[key], now, window, max_creates)
    _create_buckets[key].append(now)


def check_workflow_stream_rate_limit(
    request: Request,
    authorization: str | None = Header(None),
) -> None:
    """Limita aberturas de stream SSE por minuto."""
    key = _bucket_key(request, authorization)
    now = time.time()
    window = 60.0
    max_streams = int(os.getenv("WORKFLOW_RATE_LIMIT_STREAM_PER_MIN", "60"))
    _trim_and_check(_stream_buckets[key], now, window, max_streams)
    _stream_buckets[key].append(now)

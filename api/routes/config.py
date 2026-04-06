import os
from pathlib import Path
from typing import Optional

from dotenv import set_key
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/config", tags=["config"])

ALLOWED_MODELS = frozenset({
    "claude-sonnet-4-6",
    "claude-opus-4-6",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
})
ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"

_DEFAULT_MODEL = "claude-sonnet-4-6"
_DEFAULT_MAX_TOKENS = 8096
MAX_TOKENS_MIN = 1
MAX_TOKENS_MAX = 128_000


class ConfigResponse(BaseModel):
    model: str
    max_tokens: int


class ConfigUpdate(BaseModel):
    model: Optional[str] = None
    max_tokens: Optional[int] = None


def _parse_max_tokens_env() -> int:
    raw = os.getenv("MAX_TOKENS", str(_DEFAULT_MAX_TOKENS))
    try:
        v = int(raw)
    except ValueError:
        return _DEFAULT_MAX_TOKENS
    if v < MAX_TOKENS_MIN or v > MAX_TOKENS_MAX:
        return _DEFAULT_MAX_TOKENS
    return v


def _current_config() -> ConfigResponse:
    model = os.getenv("MODEL", _DEFAULT_MODEL)
    if model not in ALLOWED_MODELS:
        model = _DEFAULT_MODEL
    max_tokens = _parse_max_tokens_env()
    return ConfigResponse(model=model, max_tokens=max_tokens)


@router.get("")
async def get_config() -> ConfigResponse:
    return _current_config()


@router.post("")
async def update_config(body: ConfigUpdate) -> ConfigResponse:
    if body.model is not None:
        if body.model not in ALLOWED_MODELS:
            raise HTTPException(status_code=400, detail="Unknown model")
        set_key(str(ENV_PATH), "MODEL", body.model)
        os.environ["MODEL"] = body.model
    if body.max_tokens is not None:
        if body.max_tokens < MAX_TOKENS_MIN or body.max_tokens > MAX_TOKENS_MAX:
            raise HTTPException(
                status_code=400,
                detail=f"max_tokens must be between {MAX_TOKENS_MIN} and {MAX_TOKENS_MAX}",
            )
        set_key(str(ENV_PATH), "MAX_TOKENS", str(body.max_tokens))
        os.environ["MAX_TOKENS"] = str(body.max_tokens)
    return _current_config()

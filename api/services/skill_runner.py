"""
Executa skills usando Anthropic ou Google Gemini como LLM.
Detecção de provedor pelo prefixo do model name:
  - "gemini-*" → Google Gemini (google-genai SDK)
  - demais     → Anthropic
"""
import os
import json
from pathlib import Path
import anthropic
import google.genai
import google.genai.types

SKILLS_DIR = Path(__file__).parent.parent.parent / "skills"

_DEFAULT_MODEL = "claude-sonnet-4-6"
_DEFAULT_MAX_TOKENS = 8096
_MAX_TOKENS_CAP = 128_000


def _resolve_model(explicit: str | None) -> str:
    if explicit:
        return explicit
    return os.getenv("MODEL", _DEFAULT_MODEL)


def _resolve_max_tokens(explicit: int | None) -> int:
    if explicit is not None:
        return explicit
    raw = os.getenv("MAX_TOKENS", str(_DEFAULT_MAX_TOKENS))
    try:
        v = int(raw)
    except ValueError:
        return _DEFAULT_MAX_TOKENS
    if v < 1 or v > _MAX_TOKENS_CAP:
        return _DEFAULT_MAX_TOKENS
    return v


def _client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def _google_client() -> google.genai.Client:
    return google.genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))


def _is_google_model(model: str) -> bool:
    return model.startswith("gemini-")


def load_skill(skill_name: str) -> str:
    """Carrega o SKILL.md como system prompt"""
    skill_path = SKILLS_DIR / skill_name / "SKILL.md"
    if not skill_path.exists():
        raise FileNotFoundError(f"Skill não encontrada: {skill_name}")
    return skill_path.read_text(encoding="utf-8")


def _trunc(text: str | None, max_chars: int) -> str | None:
    """Trunca texto mantendo o início + aviso de corte"""
    if not text or len(text) <= max_chars:
        return text
    return text[:max_chars] + f"\n\n[... documento truncado — {len(text) - max_chars} caracteres omitidos para caber no limite de tokens ...]"


def build_context_block(context: dict) -> str:
    """Constrói bloco de contexto do cliente para injetar no prompt.
    Limites conservadores para ficar bem abaixo do TPM de 30k tokens do gpt-4o tier 1.
    """
    parts = [f"## Contexto do Cliente: {context.get('client_name', '')}"]

    dcc = context.get("dcc")
    if dcc:
        parts.append(f"\n### DCC (Documento de Concepção de Copy)\n{_trunc(dcc, 12000)}")
    else:
        parts.append("\n### DCC (Documento de Concepção de Copy)\n**Status:** não disponível — conteúdo do documento não foi fornecido ao contexto.")

    ucm = context.get("ucm")
    if ucm:
        parts.append(f"\n### UCM (Use Case Map)\n{_trunc(ucm, 6000)}")
    else:
        parts.append("\n### UCM (Use Case Map)\n**Status:** não disponível — conteúdo do documento não foi fornecido ao contexto.")

    brand = context.get("brand", {})
    if brand.get("identidade"):
        parts.append(f"\n### Identidade Visual\n{_trunc(brand['identidade'], 3000)}")

    if brand.get("design_system"):
        parts.append(f"\n### Design System Social Media\n{_trunc(brand['design_system'], 3000)}")

    if brand.get("tokens"):
        tokens_str = json.dumps(brand['tokens'], ensure_ascii=False, indent=2)
        parts.append(f"\n### Design Tokens\n```json\n{_trunc(tokens_str, 1500)}\n```")

    return "\n".join(parts)


def run_skill(
    skill_name: str,
    prompt: str,
    client_context: dict | None = None,
    *,
    model: str | None = None,
    max_tokens: int | None = None,
) -> str:
    """Executa uma skill sincronamente e retorna o texto completo"""
    model = _resolve_model(model)
    max_tokens = _resolve_max_tokens(max_tokens)
    system_prompt = load_skill(skill_name)
    user_message = prompt
    if client_context:
        user_message = f"{build_context_block(client_context)}\n\n---\n\n{prompt}"

    if _is_google_model(model):
        client = _google_client()
        config = google.genai.types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=max_tokens,
        )
        response = client.models.generate_content(
            model=model,
            contents=user_message,
            config=config,
        )
        return response.text
    else:
        response = _client().messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )
        return response.content[0].text


def stream_skill(
    skill_name: str,
    prompt: str,
    client_context: dict | None = None,
    *,
    model: str | None = None,
    max_tokens: int | None = None,
):
    """Executa uma skill com streaming — yield chunks de texto"""
    model = _resolve_model(model)
    max_tokens = _resolve_max_tokens(max_tokens)
    system_prompt = load_skill(skill_name)
    user_message = prompt
    if client_context:
        user_message = f"{build_context_block(client_context)}\n\n---\n\n{prompt}"

    if _is_google_model(model):
        client = _google_client()
        config = google.genai.types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=max_tokens,
        )
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=user_message,
            config=config,
        ):
            if chunk.text:
                yield chunk.text
    else:
        with _client().messages.stream(
            model=model,
            max_tokens=max_tokens,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        ) as stream:
            for chunk in stream.text_stream:
                yield chunk

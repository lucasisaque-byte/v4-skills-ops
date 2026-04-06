import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn

from api.routes.clients import router as clients_router
from api.routes.config import router as config_router
from api.routes.generate import router as generate_router
from api.routes.outputs import router as outputs_router
from api.routes.workflow_runs import dispatch_planning_job, router as workflow_runs_router
from api.workflow import engine


def _is_production() -> bool:
    return (
        os.getenv("ENVIRONMENT", "").strip().lower() == "production"
        or os.getenv("RAILWAY_ENVIRONMENT", "").strip().lower() == "production"
    )


def _workflow_auth_allow_missing() -> bool:
    return os.getenv("WORKFLOW_AUTH_ALLOW_MISSING", "").strip().lower() in ("1", "true", "yes")


@asynccontextmanager
async def lifespan(app: FastAPI):
    token = os.getenv("WORKFLOW_API_TOKEN", "").strip()
    allow_missing = _workflow_auth_allow_missing()
    if _is_production():
        if allow_missing:
            raise RuntimeError(
                "WORKFLOW_AUTH_ALLOW_MISSING não é permitido em produção. Remova a variável e defina WORKFLOW_API_TOKEN."
            )
        if not token:
            raise RuntimeError(
                "WORKFLOW_API_TOKEN é obrigatório em produção. A API não pode iniciar sem autenticação de workflow."
            )
    elif not token and not allow_missing:
        raise RuntimeError(
            "WORKFLOW_API_TOKEN ausente. Em desenvolvimento, defina WORKFLOW_AUTH_ALLOW_MISSING=1 "
            "ou configure WORKFLOW_API_TOKEN."
        )
    await asyncio.to_thread(engine.reconcile_stale_planning_runs, dispatch_planning_job)
    interval = max(15, int(os.getenv("WORKFLOW_PLANNING_RECONCILE_INTERVAL_SEC", "45")))

    async def reconcile_loop() -> None:
        while True:
            await asyncio.sleep(interval)
            await asyncio.to_thread(engine.reconcile_stale_planning_runs, dispatch_planning_job)

    reconcile_task = asyncio.create_task(reconcile_loop())
    yield
    reconcile_task.cancel()
    try:
        await reconcile_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title="V4 Skills Platform API",
    description="API da plataforma de produção de marketing com IA",
    version="2.0.0",
    docs_url=None,
    redoc_url=None,
    lifespan=lifespan,
)


@app.get("/docs", include_in_schema=False)
async def custom_swagger():
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>V4 Marketing Agent API</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
    </head>
    <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
        SwaggerUIBundle({
            url: "/openapi.json",
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
            layout: "BaseLayout"
        })
    </script>
    </body>
    </html>
    """
    return HTMLResponse(html)

# Origens permitidas — configure CORS_ALLOWED_ORIGINS em produção (CSV).
# Sem a variável: em produção usa a URL padrão do Vercel + localhost; em dev usa "*".
_cors_raw = os.getenv("CORS_ALLOWED_ORIGINS", "").strip()
if _cors_raw:
    _cors_origins: list[str] = [o.strip() for o in _cors_raw.split(",") if o.strip()]
elif _is_production():
    _cors_origins = [
        "https://v4-skills-ops.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
else:
    _cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clients_router)
app.include_router(config_router)
app.include_router(generate_router)
app.include_router(outputs_router)
app.include_router(workflow_runs_router)


@app.get("/")
async def root():
    return {"status": "ok", "version": "2.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)

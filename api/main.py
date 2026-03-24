from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional
import uvicorn

from agent.orchestrator import Orchestrator

app = FastAPI(
    title="V4 Marketing Agent API",
    description="Agente autônomo que orquestra skills de Copywriting, Designer e Social Media para criar landing pages.",
    version="0.1.0",
    docs_url=None,  # desativa o /docs padrão (CDN externo)
    redoc_url=None,
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class LandingPageRequest(BaseModel):
    client_name: str
    dcc_content: str
    ucm_content: str
    target_audience: Optional[str] = None
    campaign_objective: Optional[str] = None


@app.get("/")
async def root():
    return {"status": "ok", "message": "V4 Marketing Agent rodando."}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/generate/landing-page")
async def generate_landing_page(request: LandingPageRequest):
    """
    Recebe DCC + UCM e retorna a landing page completa gerada pelo pipeline:
    Copywriting → Designer → Social Media
    """
    orchestrator = Orchestrator()
    try:
        result = await orchestrator.run(
            client_name=request.client_name,
            dcc_content=request.dcc_content,
            ucm_content=request.ucm_content,
            target_audience=request.target_audience,
            campaign_objective=request.campaign_objective,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate/copy-only")
async def generate_copy_only(request: LandingPageRequest):
    """Roda apenas a skill de Copywriting."""
    orchestrator = Orchestrator()
    try:
        result = await orchestrator.run_copywriting(
            client_name=request.client_name,
            dcc_content=request.dcc_content,
            ucm_content=request.ucm_content,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)

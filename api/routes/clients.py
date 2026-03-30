from fastapi import APIRouter, HTTPException
from api.services.client_context import list_clients, get_client, get_client_context

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("")
def get_clients():
    return {"clients": list_clients()}


@router.get("/{client_id}")
def get_client_detail(client_id: str):
    client = get_client(client_id)
    if not client:
        raise HTTPException(status_code=404, detail=f"Cliente '{client_id}' não encontrado")
    return client


@router.get("/{client_id}/context")
def get_context(client_id: str):
    ctx = get_client_context(client_id)
    if not ctx:
        raise HTTPException(status_code=404, detail=f"Cliente '{client_id}' não encontrado")
    return ctx

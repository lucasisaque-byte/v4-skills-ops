from fastapi import APIRouter, HTTPException
from api.services.output_store import list_outputs, get_output

router = APIRouter(prefix="/outputs", tags=["outputs"])


@router.get("")
def get_all_outputs(limit: int = 20):
    return {"outputs": list_outputs(limit=limit)}


@router.get("/client/{client_id}")
def get_client_outputs(client_id: str, limit: int = 20):
    return {"outputs": list_outputs(client_id=client_id, limit=limit)}


@router.get("/{entry_id}")
def get_output_detail(entry_id: str):
    entry = get_output(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entregável não encontrado")
    return entry

# Runbook — Exportar OpenAPI (contrato)

Objetivo: gerar um artefato estático do contrato OpenAPI para auditoria, diffs e (futuramente) geração de client tipado.

## Export (sem subir servidor)

O script abaixo importa o app FastAPI e escreve o JSON de OpenAPI:

```bash
python tooling/scripts/export_openapi.py
```

Saída padrão:

- `docs/contracts/openapi/openapi.json`

## Validação rápida

- Verifique que `/docs` continua funcionando ao rodar a API localmente.
- Compare diffs de `openapi.json` em PRs que mexem em rotas/modelos.


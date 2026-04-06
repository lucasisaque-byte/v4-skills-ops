# Rules — `platform/` (web)

Escopo: UI web (BC4).  
Objetivo: manter consumo de dados consistente com os contratos expostos pela API.

## Consumo de dados

- Preferir clients tipados/hook generators quando existirem.
- Quando consumir endpoints diretamente:
  - centralizar em uma camada de client (evitar `fetch` espalhado)
  - respeitar paginação/limites e padrões de erro

## Mapa de uso (UI ↔ entidade)

- Para cada entidade/“recurso” consumido, manter um mapa em `docs/templates/frontend/frontend-data-usage-map.md` (instanciado por domínio quando necessário).


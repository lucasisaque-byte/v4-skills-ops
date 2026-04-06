# Relationship Map (template)

## Objetivo

Mapear relações entre entidades/recursos (FKs, referências por id, dependências de leitura/escrita).

## Formato sugerido

- Entidade/Resource A → Entidade/Resource B (cardinalidade) — regra

Exemplo:

- `outputs.entry.client_id` → `clients.client_id` (N:1) — cada entry pertence a um cliente


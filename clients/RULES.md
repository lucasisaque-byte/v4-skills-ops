# Rules — `clients/` (Client Context)

Escopo: contexto por cliente (BC5).

## Princípios

- Contexto de cliente é **insumo** do agente e deve ser tratável (markdown, assets, referências).
- Evitar misturar código de produto e automações aqui.
- Arquivos devem ser fáceis de localizar e com nomes previsíveis por padrão do projeto.

## Hierarquia e conflitos

Prioridade em caso de conflito (ver ADR/arquitetura do agente):

1. Documento novo anexado na tarefa (mais específico)
2. Contexto salvo em `clients/<client>/`
3. Instrução do prompt do usuário (mais genérica)


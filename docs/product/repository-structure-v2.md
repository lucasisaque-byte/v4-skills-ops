# Repository Structure v2 — V4 Skills Ops Platform

> Vigente a partir de 2026-04-01  
> Resultado da reestruturação pós-auditoria

---

## Visão geral

```
v4-skills-ops/
├── api/                     ← Backend FastAPI (entrega HTTP)
├── platform/                ← Frontend Next.js 14 (entrega web)
├── skills/                  ← Knowledge base de skills especializadas
├── clients/                 ← Contexto operacional por cliente
├── docs/                    ← Documentação arquitetural e de produto
├── archive/                 ← Legado, protótipos e material pessoal
├── tooling/                 ← Scripts utilitários e automações
├── outputs/                 ← Output store legado (migrar para Supabase)
├── data/                    ← Runtime data de workflows (efêmero, não commitado)
├── Procfile                 ← Deploy Railway
├── requirements.txt         ← Dependências Python
├── runtime.txt              ← Versão Python
├── start.sh                 ← Script de dev local
└── .env.example             ← Template de variáveis de ambiente
```

---

## O que entra em cada pasta

### `api/`
**Responsabilidade:** Entrega HTTP da plataforma. Tudo relacionado a FastAPI, rotas, serialização e execução de skills via HTTP.

```
api/
├── main.py                  ← Entry point + registro de routers + CORS
├── routes/
│   ├── clients.py           ← GET /clients, /clients/{id}
│   ├── generate.py          ← POST /generate/* (legado, compatibilidade)
│   ├── outputs.py           ← GET /outputs (legado)
│   └── workflow_runs.py     ← POST/GET /workflow-runs/* (sistema principal)
├── services/
│   ├── client_context.py    ← Carrega DCC, UCM, brand de clients/
│   ├── orchestrator.py      ← Account Manager + RuntimePlan via OpenAI
│   ├── output_store.py      ← Persistência legada de outputs
│   └── skill_runner.py      ← Executa skills com streaming SSE
├── models/
│   └── workflow.py          ← WorkflowRun, RuntimePlan, StepRun, templates
└── workflow/
    ├── engine.py            ← State machine (create, advance, approve, rebrief)
    ├── registry.py          ← Carrega e valida templates
    ├── grammar.json         ← Gramática universal de templates
    └── templates/           ← 7 templates JSON
```

**Não entra aqui:** Conteúdo de skills (vai em `skills/`), dados de clientes (vai em `clients/`), documentação de produto.

---

### `platform/`
**Responsabilidade:** Frontend web da plataforma. Tudo relacionado a Next.js, componentes React, rotas e estado de UI.

```
platform/
├── app/(app)/               ← Rotas da aplicação (dashboard, workspace, producao)
├── components/              ← Componentes reutilizáveis
├── lib/                     ← api.ts, store.ts, hooks
└── ...configs Next.js
```

**Não entra aqui:** Lógica de negócio, dados de clientes, skills.

---

### `skills/`
**Responsabilidade:** Knowledge base de skills especializadas. Cada skill é uma pasta com `SKILL.md` usado como system prompt + arquivos de referência.

```
skills/
├── account-manager/         ← Orquestrador central (+ 17 refs)
├── copywriting/             ← Copy persuasiva (+ checklists + templates)
├── brand-intel/             ← Extração de identidade visual
├── brand-system-builder/    ← Construtor de design system
├── social-media-manager/    ← Orquestrador de social media
├── hook-engineer/
├── reels-script-architect/
├── social-media-designer/
├── editorial-calendar-builder/
├── editorial-pillar-planner/
├── carousel-structure-designer/
├── newsjacking-opportunity-finder/
├── stories-sequence-builder/
├── creative-brief-for-design/
├── social-content-performance-analyst/
├── winning-pattern-extractor/
├── social-media-briefing-diagnostic/
└── frontend-design/         ← Apache 2.0
```

**Regra crítica:** O nome da pasta é o identificador da skill usado em código (`load_skill(skill_name)`). **Nunca renomear pastas de skills sem atualizar todas as referências em código.**

**Não entra aqui:** Outputs gerados pelas skills (vão em `clients/{id}/output/` ou `data/`), documentação de produto.

---

### `clients/`
**Responsabilidade:** Contexto operacional de cada cliente. Contém os insumos estratégicos que alimentam os workflows.

```
clients/
├── _template/               ← Estrutura de referência para novos clientes
│   ├── dcc.md
│   └── ucm.md
├── kce/
│   ├── dcc.md               ← Documento de Concepção de Copy
│   ├── ucm.md               ← Use Case Map
│   ├── brand/               ← Identidade visual e design tokens
│   └── output/              ← Artefatos gerados para este cliente
├── via-journey/
│   ├── dcc.md
│   ├── ucm.md
│   ├── brand/
│   └── output/              ← Artefatos gerados (carrosseis, ads, lp-b2b/)
├── alan/
├── eduzz/
└── hs-prevent/
```

**Estrutura padrão por cliente:**
- `dcc.md` — Documento de Concepção de Copy (personas, dores, tom, diferenciais)
- `ucm.md` — Use Case Map (JTBD, forças de mudança, jornada)
- `brand/` — `identidade-visual.md`, `design-system-social-media.md`, `design-tokens.json`
- `output/` — Artefatos gerados para o cliente (não commitar automaticamente)

**Não entra aqui:** Arquivos de workspace pessoal (Obsidian, canvas, etc.), dados de runtime de workflows.

---

### `docs/`
**Responsabilidade:** Documentação arquitetural, de produto e operacional.

```
docs/
├── product/                 ← Documentação de produto e decisões
│   ├── platform-briefing.md ← Contexto completo da plataforma (antigo PLATFORM_BRIEFING.md)
│   ├── repository-audit.md  ← Auditoria estrutural
│   ├── repository-structure-v2.md ← Este documento
│   ├── restructure-plan.md  ← Plano de migração
│   ├── restructure-preflight.md ← Preflight da reestruturação
│   ├── migration-log.md     ← Log de mudanças
│   ├── repository-map.json  ← Mapeamento old→new
│   ├── pending-human-decisions.md ← Decisões pendentes
│   └── plano-execucao.docx  ← Planejamento estratégico
├── adr/                     ← Architecture Decision Records
│   ├── 001-agent-v0-architecture.md ← ADR da arquitetura v1 (histórico)
│   └── 0001-repository-structure.md ← ADR da reestruturação
└── runbooks/                ← Guias operacionais
```

**Não entra aqui:** Documentação de skills (vai dentro da skill), contexto de cliente.

---

### `archive/`
**Responsabilidade:** Material histórico, protótipos abandonados e workspace pessoal. Não deve ser evoluído.

```
archive/
├── personal-workspace/      ← Arquivos Obsidian e workspace pessoal
│   ├── .obsidian/
│   ├── Sem título.base
│   ├── Sem título.canvas
│   └── clients-Sem-titulo/  ← Diretório vazio de clients/
├── prototypes/
│   └── agent-v0/            ← Protótipo com Anthropic SDK (não integrado)
└── pending-review/
    └── kce-ucm-raw.json     ← UCM do KCE em formato JSON (dados extras para revisão)
```

**Não entra aqui:** Código ativo, skills em uso, contexto de clientes ativos.

---

### `tooling/`
**Responsabilidade:** Scripts utilitários, automações e ferramentas de suporte ao desenvolvimento.

```
tooling/
└── scripts/
    ├── export-slides.js     ← Script Puppeteer para exportar slides como PNG
    ├── package.json         ← Dependência puppeteer para o script
    └── package-lock.json
```

**Não entra aqui:** Código do produto, scripts de deploy (Procfile fica na raiz).

---

### `outputs/`
**Responsabilidade:** Output store legado — JSON com histórico de entregáveis por cliente. A ser migrado para Supabase.

**Status:** Em uso, mas a persistência em Railway é efêmera (some a cada redeploy). Migração para Supabase planejada.

---

### `data/`
**Responsabilidade:** Runtime data de WorkflowRuns — criado pelo `engine.py` em execução. Não está no git (`.gitignore`).

**Status:** Efêmero em produção (Railway filesystem). Migração para Supabase planejada.

---

## Regras de nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Pastas de produto | kebab-case | `workflow-engine/`, `skill-runner/` |
| Pastas de cliente | id do cliente em kebab-case | `via-journey/`, `hs-prevent/` |
| Skills | kebab-case, nome descritivo | `hook-engineer/`, `brand-system-builder/` |
| Documentos de produto | kebab-case `.md` | `platform-briefing.md` |
| Templates de workflow | `{entregavel}-v{N}.json` | `landing-page-v1.json` |
| Artefatos de cliente | descritivo, data opcional | `pack-meta-ads-leadgen.html` |

---

## Convenções operacionais

1. **Skills nunca são renomeadas** sem atualizar todas as referências em código
2. **DCC e UCM ficam na raiz do cliente** como `dcc.md` e `ucm.md` (não em subpastas)
3. **Outputs de cliente ficam em `clients/{id}/output/`** — não em `outputs/` do produto
4. **`data/` não é commitado** — runtime apenas
5. **`archive/` não é evoluído** — apenas recebe material histórico
6. **Arquivos Obsidian não entram no repositório** (coberto pelo `.gitignore`)
7. **Nenhum arquivo de cliente se mistura com código de produto**

# Plano de Reestruturação — V4 Skills Ops Platform

> Fase 2 do processo de auditoria arquitetural  
> Pré-requisito: leitura de `docs/product/repository-audit.md` e validação das decisões da Seção H

---

## Princípios deste plano

1. **Nunca quebrar o deploy** — Railway e Vercel devem continuar funcionando após cada etapa
2. **Nunca quebrar imports** — atualizar todos os `from ... import` antes de mover arquivos
3. **Nenhum arquivo de cliente deve ser deletado sem validação** — contexto pode estar em produção
4. **Resolver críticos antes de cosméticos** — nested repo e duplicidades antes de reorganização estética
5. **Cada fase é independente** — pode ser executada sem depender da próxima

---

## Fase 0 — Pré-requisitos obrigatórios

**Não avançar para nenhuma outra fase sem completar estes itens.**

### 0.1 — Resolver nested git repo em `outputs/via-journey/lp-b2b/`

**Verificar primeiro:**
```bash
git submodule status
# Se aparecer outputs/via-journey/lp-b2b/ — é um submodule implícito
# Se não aparecer — é apenas um diretório com .git perdido
```

**Opção A (recomendada)** — Preservar conteúdo, remover .git interno:
```bash
# 1. Salvar o conteúdo como arquivo estático
cp -r outputs/via-journey/lp-b2b/ /tmp/lp-b2b-backup/

# 2. Remover do tracking do git
git rm -r --cached outputs/via-journey/lp-b2b/

# 3. Remover fisicamente o .git interno
rm -rf outputs/via-journey/lp-b2b/.git

# 4. Re-adicionar como conteúdo normal
git add outputs/via-journey/lp-b2b/
git commit -m "fix: remove nested git repo from outputs/via-journey/lp-b2b"
```

**Opção B** — Remover completamente (conteúdo existe em `clients/via-journey/output/` e `index.html`):
```bash
git rm -r outputs/via-journey/lp-b2b/
git commit -m "fix: remove nested git repo — content exists in clients/via-journey/output/"
```

**Decisão necessária:** Confirmar qual opção com o responsável antes de executar.

### 0.2 — Garantir .gitignore cobre o necessário

Verificar e adicionar ao `.gitignore` se ausente:
```
# Workflow runtime data (efêmero)
data/

# Python cache
**/__pycache__/
**/*.pyc
**/*.pyo

# Obsidian (se alguém abrir clients/ com Obsidian novamente)
clients/.obsidian/
**/*.canvas
**/*.base

# Build artifacts
platform/tsconfig.tsbuildinfo
platform/.next/
```

**Checkpoint 0:** Commit limpo sem nested repo e .gitignore atualizado. Deploy Railway/Vercel deve continuar funcionando.

---

## Fase 1 — Limpeza sem risco de quebra

Nenhum arquivo de código é movido. Nenhum import é alterado. Apenas artefatos, docs e lixo.

### 1.1 — Remover arquivos Obsidian

```bash
git rm clients/.obsidian -r --cached
git rm "clients/Sem título.base"
git rm "clients/Sem título.canvas"
git rm "clients/via-journey/Sem título"
```

Adicionar ao `.gitignore`:
```
clients/.obsidian/
```

### 1.2 — Criar estrutura de docs

```bash
mkdir -p docs/product docs/adr docs/runbooks
```

### 1.3 — Mover PLATFORM_BRIEFING.md

```bash
mv PLATFORM_BRIEFING.md docs/product/platform-briefing.md
git add docs/product/platform-briefing.md
git rm PLATFORM_BRIEFING.md
```

**Atenção:** Se `.claude/launch.json` ou `.mcp.json` referenciam este arquivo, atualizar o caminho.

### 1.4 — Mover documentos soltos na raiz

```bash
mv plano-execucao-v4-skills-ops.docx docs/product/
mv proximos-passos-v4-skills-ops.html docs/product/
```

### 1.5 — Reorganizar docs/ existente

```bash
mv docs/arquitetura-agente-v4.txt docs/adr/001-agent-v0-architecture.md
mv docs/skill-brand-design-system.txt skills/brand-system-builder/references/design-system-guide.md
```

### 1.6 — Arquivar módulo `agent/`

```bash
mkdir -p archive/prototypes/agent-v0
mv agent/orchestrator.py archive/prototypes/agent-v0/
mv agent/config.py archive/prototypes/agent-v0/
mv agent/__init__.py archive/prototypes/agent-v0/
rm -rf agent/
```

Adicionar `archive/` ao `.gitignore` se não quiser que seja deployado:
```
# Não adicionar ao .gitignore — archive/ deve ser commitado como histórico
```

### 1.7 — Mover artefatos do cliente Via Journey da raiz

**Verificar primeiro:**
```bash
# Verificar se index.html está sendo servido pelo Vercel como static file
# Olhar vercel.json ou platform/next.config.mjs por redirects
```

Se confirmado que o Vercel serve a LP pelo `platform/` (Next.js) e não pelo `index.html` da raiz:
```bash
mkdir -p clients/via-journey/output/lp-b2b
mv index.html clients/via-journey/output/lp-b2b/
mv assets/ clients/via-journey/output/lp-b2b/assets/
```

Se o `index.html` da raiz for o site em produção:
- **Não mover** — criar tarefa separada para migrar para Next.js ou S3
- Apenas documentar a situação em `docs/product/platform-briefing.md`

### 1.8 — Mover export-slides.js

```bash
mkdir -p tooling/scripts
mv export-slides.js tooling/scripts/
```

Criar `tooling/scripts/README.md` documentando o script.

### 1.9 — Remover tsconfig.tsbuildinfo do tracking

```bash
git rm --cached platform/tsconfig.tsbuildinfo
echo "platform/tsconfig.tsbuildinfo" >> .gitignore
```

**Checkpoint 1:** Commit de limpeza. Verificar:
- `git status` mostra apenas mudanças intencionais
- `python3 -m uvicorn api.main:app` ainda sobe sem erros
- `cd platform && npm run dev` ainda funciona
- Nenhum arquivo de cliente foi perdido

---

## Fase 2 — Normalização de `clients/`

### 2.1 — Resolver duplicidade DCC do KCE

**Verificar conteúdo antes:**
```bash
diff clients/kce/dcc.md clients/kce/copywriting/kce-dcc.md
```

**Se forem iguais:**
```bash
git rm clients/kce/copywriting/kce-dcc.md
```

**Se forem diferentes (versões diferentes):**
- Identificar qual é mais recente
- Consolidar manualmente em `clients/kce/dcc.md`
- Remover `clients/kce/copywriting/kce-dcc.md`

### 2.2 — Normalizar UCM do KCE

```bash
ls clients/kce/copywriting/ucm-kce/
# Verificar se é um arquivo único ou pasta com vários arquivos
```

Se for um único arquivo `ucm.md`:
```bash
mv clients/kce/copywriting/ucm-kce/ucm.md clients/kce/ucm.md
```

Se for pasta com múltiplos arquivos:
- Concatenar ou escolher o principal
- Salvar como `clients/kce/ucm.md`

Após consolidar:
```bash
rm -rf clients/kce/copywriting/
# Se a pasta copywriting/ ficou vazia após mover os arquivos
```

### 2.3 — Padronizar nomenclatura de outputs do KCE

```bash
mv clients/kce/criativos/ clients/kce/output/
```

### 2.4 — Avaliar remoção do package.json raiz

**Verificar uso:**
- `export-slides.js` ainda é necessário de forma recorrente?
- Se uso pontual: remover `package.json` e `package-lock.json` da raiz. Documentar instalação de puppeteer no README do script.
- Se uso recorrente: criar `tooling/scripts/package.json` próprio e remover da raiz.

```bash
# Se decidir remover:
git rm package.json package-lock.json
rm -rf node_modules/
echo "node_modules/" >> .gitignore
```

**Checkpoint 2:** Commit de normalização. Verificar:
- `api/services/client_context.py` → `get_client_context("kce")` retorna DCC e UCM corretos
- Não há mais duplos retornos no `rglob`

---

## Fase 3 — Separação do Workflow Domain (opcional, médio risco)

**Pré-requisito:** Fase 1 e 2 concluídas. Nenhum deploy em andamento.

**Objetivo:** Extrair workflow engine e templates de dentro de `api/` para packages independentes.

### 3.1 — Criar estrutura de packages

```bash
mkdir -p packages/workflow-engine
mkdir -p packages/workflow-templates/templates
```

### 3.2 — Mover modelos de domínio

```bash
cp api/models/workflow.py packages/workflow-engine/models.py
```

### 3.3 — Mover workflow engine

```bash
cp api/workflow/engine.py packages/workflow-engine/engine.py
cp api/workflow/registry.py packages/workflow-templates/registry.py
cp api/workflow/grammar.json packages/workflow-templates/grammar.json
cp api/workflow/templates/*.json packages/workflow-templates/templates/
```

### 3.4 — Mover orchestrator

```bash
cp api/services/orchestrator.py packages/workflow-engine/orchestrator.py
```

### 3.5 — Criar __init__.py em cada package

```bash
touch packages/__init__.py
touch packages/workflow-engine/__init__.py
touch packages/workflow-templates/__init__.py
```

### 3.6 — Atualizar imports (crítico)

Arquivos que precisam de import atualizado:

| Arquivo | Import antigo | Import novo |
|---------|--------------|-------------|
| `api/routes/workflow_runs.py` | `from api.workflow import engine` | `from packages.workflow_engine import engine` |
| `api/routes/workflow_runs.py` | `from api.workflow.registry import list_templates` | `from packages.workflow_templates.registry import list_templates` |
| `api/routes/workflow_runs.py` | `from api.models.workflow import ...` | `from packages.workflow_engine.models import ...` |
| `api/routes/workflow_runs.py` | `from api.services.orchestrator import plan_workflow` | `from packages.workflow_engine.orchestrator import plan_workflow` |
| `api/routes/generate.py` | `from api.services.orchestrator import orchestrate_and_stream` | `from packages.workflow_engine.orchestrator import orchestrate_and_stream` |
| `api/workflow/engine.py` (novo) | `from api.models.workflow import ...` | `from packages.workflow_engine.models import ...` |

### 3.7 — Smoke test

```bash
python3 -m uvicorn api.main:app --reload
# Testar:
# GET /clients
# GET /workflow-runs/templates
# POST /workflow-runs com cliente e task_type válidos
```

### 3.8 — Remover arquivos originais após validação

```bash
# Só remover após confirmar que tudo funciona!
rm api/models/workflow.py
rm api/workflow/engine.py
rm api/workflow/registry.py
rm api/workflow/grammar.json
rm -rf api/workflow/templates/
rm api/services/orchestrator.py
```

**Checkpoint 3:** Commit de separação de domínio. Deploy completo no Railway. Testar criação de workflow run end-to-end.

---

## Fase 4 — Migração para `apps/` (opcional, alto risco)

**Só executar se:**
- Fases 0-3 concluídas e estáveis em produção
- Existe pelo menos um teste de integração cobrindo os endpoints principais
- Há tempo para rollback rápido se necessário

### 4.1 — Mover `api/` para `apps/api/`

```bash
mkdir -p apps
git mv api/ apps/api/
```

### 4.2 — Atualizar Procfile

```
web: python3 -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000
```

### 4.3 — Mover `platform/` para `apps/web/`

```bash
git mv platform/ apps/web/
```

### 4.4 — Atualizar configuração Vercel

No dashboard do Vercel:
- Root Directory: `apps/web` (ou configurar via `vercel.json`)

```json
// vercel.json na raiz
{
  "buildCommand": "cd apps/web && npm run build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "cd apps/web && npm install"
}
```

**Checkpoint 4:** Deploy completo no Railway e Vercel. Verificar todas as rotas do frontend.

---

## Dependências críticas entre arquivos (mapa de risco)

```
skill_runner.py
  └── depende de: SKILLS_DIR = skills/ (path relativo ao arquivo)
  └── risco: se skill_runner.py mover, SKILLS_DIR quebra
  └── fix: usar Path(__file__).parent.parent.parent.parent para compensar profundidade

client_context.py
  └── depende de: CLIENTS_DIR = clients/ (path relativo)
  └── risco: se client_context.py mover, CLIENTS_DIR quebra
  └── fix: mesmo padrão de path relativo

engine.py
  └── depende de: DATA_DIR = data/ (path relativo)
  └── ATUAL: data/ não existe — cria em runtime
  └── risco: se engine.py mover, DATA_DIR quebra
  └── fix: path relativo ou variável de ambiente

registry.py
  └── depende de: TEMPLATES_DIR = api/workflow/templates/
  └── risco: se registry.py mover sem os templates, quebra imediatamente
  └── fix: mover registry + templates + grammar juntos

orchestrator.py
  └── depende de: load_skill("account-manager") via skill_runner
  └── depende de: template_summary_for_prompt() via registry
  └── risco: se mover sem atualizar imports de skill_runner e registry, quebra
```

---

## O que só deve ser apagado após validação

| Item | Por que esperar |
|------|----------------|
| `api/models/workflow.py` (original) | Só após smoke test da Fase 3 completo |
| `api/workflow/engine.py` (original) | Idem |
| `clients/kce/copywriting/kce-dcc.md` | Só após diff e confirmação de que kce/dcc.md está mais atualizado |
| `package.json` raiz | Só após confirmar que export-slides.js não é usado em nenhum CI |
| `outputs/via-journey/lp-b2b/` | Só após Opção A ou B da Fase 0 ser executada e validada |

---

## O que arquivar em vez de deletar

| Item | Destino de arquivo |
|------|-------------------|
| `agent/` | `archive/prototypes/agent-v0/` |
| `docs/arquitetura-agente-v4.txt` | `docs/adr/001-agent-v0-architecture.md` |
| `plano-execucao-v4-skills-ops.docx` | `docs/product/` |
| `proximos-passos-v4-skills-ops.html` | `docs/product/` |

---

## Checkpoints de validação por fase

### Após Fase 0
- [ ] `git submodule status` não mostra entradas inesperadas
- [ ] `git log --oneline -5` mostra commit limpo de resolução do nested repo
- [ ] `python3 -m uvicorn api.main:app` sobe sem warnings de submodule

### Após Fase 1
- [ ] Nenhum arquivo de cliente `.obsidian` aparece no `git status`
- [ ] `PLATFORM_BRIEFING.md` não existe mais na raiz
- [ ] `docs/product/platform-briefing.md` existe e tem conteúdo
- [ ] `agent/` não existe mais na raiz
- [ ] `archive/prototypes/agent-v0/` existe com os arquivos
- [ ] `python3 -m uvicorn api.main:app` ainda sobe sem erros
- [ ] `cd platform && npm run dev` ainda funciona

### Após Fase 2
- [ ] `diff clients/kce/dcc.md clients/kce/copywriting/kce-dcc.md` → apenas um arquivo existe
- [ ] `clients/kce/ucm.md` existe (ao invés de `copywriting/ucm-kce/`)
- [ ] `curl http://localhost:8000/clients/kce/context` retorna DCC e UCM corretos
- [ ] `clients/kce/output/` existe (ao invés de `criativos/`)

### Após Fase 3
- [ ] `curl http://localhost:8000/workflow-runs/templates` retorna todos os 7 templates
- [ ] `POST /workflow-runs` com kce e task_type=hooks cria run com sucesso
- [ ] `GET /workflow-runs/{run_id}/steps/{step_id}/stream` faz streaming sem erro
- [ ] Nenhum `import` de `api.workflow` ou `api.models.workflow` permanece em `api/routes/`

### Após Fase 4
- [ ] Railway deploy bem-sucedido com novo Procfile
- [ ] Vercel deploy bem-sucedido com nova configuração
- [ ] Frontend conecta ao backend (testar seleção de cliente)
- [ ] Criar workflow run end-to-end via UI

---

## Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| index.html na raiz é o site de produção | Média | Alto | Verificar no Vercel antes de mover |
| DCC do KCE divergiu entre os dois arquivos | Média | Alto | Fazer diff antes de deletar |
| skill_runner.py perde referência para skills/ após move | Alta (se mover) | Alto | Atualizar DATA_DIR com path absoluto ou via env var |
| WorkflowRuns perdidos em produção (data/ efêmero) | Alta (já acontece) | Médio | Priorizar migração para Supabase — independente da reestruturação |
| Deploy Railway quebra após mudança de estrutura api/ | Média | Alto | Testar localmente antes; ter rollback preparado |
| Vercel não reconhece novo root do Next.js | Média | Alto | Configurar vercel.json antes de fazer push |

---

## Ordem recomendada de execução

```
Fase 0  →  Fase 1  →  Fase 2  →  [avaliar aqui se Fases 3 e 4 valem o risco]
   ↑                                          ↓
obrigatório                          opcional — só se o produto estiver
                                     maduro o suficiente para suportar
                                     refatoração sem quebrar fluxo de produção
```

**Recomendação:** Para o estágio atual do produto, executar Fases 0, 1 e 2. As fases 3 e 4 são arquitetura ideal mas trazem risco de quebra de deploy sem benefício funcional imediato. Priorizar evolução de produto sobre perfeição estrutural.

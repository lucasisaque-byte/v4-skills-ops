# Guia Operacional para um Agente de IA Padronizar e Criar a Documentação Completa de uma Base de Dados (Front + Back)

Este guia define um **protocolo executável** para um agente de IA produzir uma **documentação completa, consistente e auditável** de uma base de dados e sua integração **end-to-end** (backend + frontend) em um ambiente moderno (preferencialmente **monorepo**). O foco é: **padrões**, **rastreabilidade**, **contratos**, **regras**, **exemplos de saída**, e **processo** (RPI: Research → Plan → Implement).

> Princípios: (1) **Fonte da verdade** humana (Design Doc/RFC/ADR) + (2) **Progressive Disclosure** (contexto sob demanda) + (3) **Contratos fortes** (OpenAPI/Swagger, tipos, migrações) + (4) **Mudanças atômicas** (DB ↔ API ↔ Client ↔ UI) + (5) **Documentar padrões, não nomes de arquivos**.

---

## 0) Definições e escopo

### O que significa “documentar a base de dados inteira”

O agente deve produzir documentação que cubra, no mínimo:

1. **Modelo de dados**: entidades/tabelas, campos, tipos, constraints, índices, relacionamentos, chaves, enumerações.
2. **Governança**: convenções de nomenclatura, padrões de migração, versionamento, ambientes, seed, backups, retenção, auditoria.
3. **Acesso**: camadas do backend (repositories/services/use-cases), políticas de autorização, validações.
4. **Contratos de API**: endpoints que expõem ou consomem dados, payloads, paginação, filtros, ordenação.
5. **Contrato de Client**: geração de SDK/hooks tipados (ex.: “Cube” lendo Swagger/OpenAPI), mocks e fixtures.
6. **Uso no frontend**: telas/componentes que listam/criam/atualizam/deletam, regras de formulário, estados.
7. **Operação**: observabilidade (logs/trace), performance (índices/queries), e regras de consistência.

### Saídas obrigatórias

O agente deve entregar:

* **DB Overview** (visão geral, padrões e diagramas textuais)
* **Data Dictionary** (tabelas + colunas)
* **Relationship Map** (FKs e cardinalidades)
* **Index & Constraint Catalog**
* **Migration Playbook**
* **OpenAPI Contract Notes** (como os dados aparecem na API)
* **Client Generation Contract** (como o client é gerado e consumido)
* **Frontend Data Usage Map** (onde e como cada entidade aparece)
* **Change Management** (como evoluir schema sem quebrar)

> Se o projeto tiver múltiplos bancos (OLTP + warehouse), o agente deve separar por **domínio** e **finalidade**.

---

## 1) Estrutura de repositório e regras para contexto

### 1.1 Monorepo como padrão recomendado

O agente assume que o repositório contém, no mesmo código:

* API/backend
* Frontend(s)
* Client SDK/geração de código
* Infra (scripts de migração, CI)

**Motivo**: permite alterações atômicas e documentação consistente DB ↔ API ↔ UI.

### 1.2 Progressive Disclosure (documentação e regras distribuídas)

O agente deve operar com **regras por escopo**, carregando apenas o necessário:

1. **Raiz**: arquitetura, stack, convenções globais.
2. **Pacote** (ex.: api/dashboard): padrões do framework.
3. **Domínio** (ex.: modules/billing, modules/auth): regras de negócio e schema.
4. **Subdomínio** (ex.: database, events): padrões finos (migrações, índices, pub/sub).

> Regra: **nunca documentar nomes exatos de arquivos como referência principal**. Documentar padrões e “como encontrar”.

### 1.3 Padrão de “Rules/Instructions” (templates)

O agente deve manter e consultar arquivos de regras que respondam:

* Como criar/alterar schema (migração, rollback, seed)
* Como escolher índices
* Como versionar e validar
* Como expor dados via API (paginação/filtros)
* Como gerar client tipado (OpenAPI → SDK)
* Como criar mocks/faker
* Como testar (unit, integration)

---

## 2) Processo obrigatório do agente (RPI)

### 2.1 Research (Pesquisa)

**Objetivo**: entender o estado atual e identificar lacunas.

Checklist que o agente deve executar:

1. **Descobrir ORM/DB**: Postgres/MySQL/SQLite; Prisma/TypeORM/Knex/Drizzle; migrations.
2. **Encontrar a fonte de schema**:

   * migrations
   * schema ORM
   * dumps
   * docs existentes
3. **Encontrar camada de API**: controllers/routers, DTOs, validators.
4. **Confirmar existência de OpenAPI/Swagger** (ou equivalente).
5. **Confirmar client generator** (ex.: Cube) e mocks.
6. **Mapear domínios** (auth/billing/notifications etc.).
7. **Medir risco**: entidades críticas, volumes, dados sensíveis, constraints.

Saída do Research:

* “Mapa de verdade”: onde está cada fonte (schema, migrações, docs, swagger)
* “Lista de entidades”: conjunto completo de tabelas/collections
* “Lacunas”: o que falta para documentar ou inconsistências

### 2.2 Plan (Planejamento)

**Objetivo**: quebrar documentação em tarefas executáveis.

O plano deve:

* Ser organizado por **domínio**
* Ter saídas por seção (DB overview, data dictionary etc.)
* Incluir critérios de aceitação (como validar)
* Não depender de um único arquivo gigante

Exemplo de macro-tarefas:

1. Visão geral + padrões
2. Dicionário de dados por domínio
3. Relacionamentos e constraints
4. Índices e performance
5. Contratos de API + exemplos
6. Contratos do client gerado + exemplos
7. Uso no frontend (telas e fluxos)
8. Governança (migração, versionamento, rollout)

### 2.3 Implement (Execução)

**Regras de execução**:

* Implementar por **domínio** para reduzir contexto.
* A cada domínio, gerar: schema → API → client → frontend.
* Produzir exemplos mínimos (payloads) e regras (validação, paginação).
* Se contexto crescer demais, **reiniciar agente** e continuar do plano.

---

## 3) Padrões universais da documentação de DB

### 3.1 Convenções de nomenclatura

O agente deve declarar e respeitar:

* **Tabelas**: snake_case plural (ex.: `users`, `subscriptions`)
* **Colunas**: snake_case (ex.: `created_at`, `external_id`)
* **PK**: `id` (UUID ou bigint) + regra
* **FK**: `<entidade>_id`
* **Timestamps**: `created_at`, `updated_at`, `deleted_at` (soft delete se existir)
* **Enums**: `status`, `type` etc. com valores explícitos

> Se o projeto já usa outro padrão, o agente deve **detectar e aderir**.

### 3.2 Categorias de campos (documentar como regra)

Para cada entidade, o agente deve marcar campos como:

* **Identidade**: PK, chaves naturais, `external_id`
* **Relacionamento**: FKs
* **Domínio**: dados de negócio
* **Auditoria**: timestamps, `created_by`, `updated_by`
* **Segurança/PII**: email, phone, document, tokens
* **Operação**: flags, versionamento, hash, idempotency keys

### 3.3 Regras de integridade

Documentar:

* NOT NULL
* UNIQUE
* CHECK
* DEFAULT
* Cascade rules (ON DELETE/UPDATE)
* Soft delete vs hard delete
* Idempotência (chaves de idempotência em escrita)

### 3.4 Índices (catálogo)

Para cada índice, documentar:

* Nome lógico
* Colunas
* Tipo (btree/gin/gist/…)
* Motivo (query/endpoint que usa)
* Cardinalidade esperada (alta/média/baixa)

> Regra: o agente não cria índices “por intuição” sem relacionar a uma query real.

---

## 4) Template do Data Dictionary (obrigatório)

Para cada tabela/entidade, o agente deve produzir uma seção no formato:

### `<EntityName>` / `<table_name>`

**Finalidade**: (1–2 frases)

**Chave primária**:

* `id`: tipo, geração, observações

**Campos**:

* `field_name` (tipo) — descrição, regras, exemplos

**Relacionamentos**:

* `fk_field` → `other_table.id` (cardinalidade, regras)

**Constraints**:

* UNIQUE: …
* CHECK: …
* DEFAULT: …

**Índices**:

* `idx_...` — colunas, motivo

**Operações típicas**:

* Criação (quais campos obrigatórios)
* Atualização (quais são mutáveis)
* Exclusão (soft/hard)

**Exemplos de registros (redigidos/sem PII real)**:

```json
{
  "id": "...",
  "...": "..."
}
```

**Notas de API** (se aplicável):

* Endpoints que retornam ou alteram
* Campos filtráveis/ordenáveis

**Notas de UI** (se aplicável):

* Telas que consomem
* Regras de formulário

---

## 5) Contrato DB ↔ API ↔ Client (regra central)

### 5.1 OpenAPI/Swagger como contrato de integração

O agente deve:

* Confirmar que cada endpoint relevante está documentado em OpenAPI.
* Definir payloads (request/response) com exemplos.
* Definir paginação, filtros, ordenação.

**Paginação (padrão recomendado)**:

* `page` + `pageSize` ou `cursor` + `limit`
* Resposta sempre inclui metadados (`total`, `nextCursor`, etc.)

### 5.2 Geração automática de client

Se existir gerador (ex.: Cube):

* Documentar **como** é gerado (comando e regras)
* Definir que o frontend **não escreve fetch manual** para endpoints cobertos
* Descrever naming convention dos hooks e tipos

### 5.3 Mocks e Faker

O agente deve documentar:

* Como gerar mocks por rota
* Onde ficam fixtures
* Como rodar frontend “offline”

---

## 6) Mapa de uso no Frontend (obrigatório)

O agente deve produzir um “mapa de consumo” por entidade:

Para cada entidade:

* **Telas** (list/detail/create/edit)
* **Hook/Query** usada
* **Campos exibidos** (list vs detail)
* **Campos editáveis**
* **Validações client-side**
* **Estados** (loading, empty, error)
* **Permissões** (quem vê/edita)

Formato mínimo:

### Entidade: `contacts`

* Listagem: `ContactsListPage` → `useListContacts()`
* Detalhe: `ContactDetailPage` → `useGetContact()`
* Form: `ContactForm` → `useCreateContact()` / `useUpdateContact()`
* Campos: `name`, `email`, `phone`, `tags`
* Filtros: `q`, `tag`, `createdAtRange`

---

## 7) Playbook de migrações (obrigatório)

O agente deve criar uma seção com:

### 7.1 Regras de migração

* Migrações **sempre incrementais** (evitar squash em produção)
* Toda migração deve ter:

  * objetivo
  * impacto
  * reversão
  * verificação pós-deploy

### 7.2 Rollout seguro

* Expand/Contract (para mudanças breaking)
* Feature flags quando necessário
* Backfill para colunas novas

### 7.3 Checklist antes de merge

* Migração roda em ambiente limpo
* Migração roda em banco com dados
* Índices criados sem lock severo (quando aplicável)
* Queries críticas avaliadas

---

## 8) Regras de segurança e privacidade (obrigatório)

O agente deve documentar:

* Campos PII e como são protegidos
* Criptografia/hashing (senhas, tokens)
* Políticas de retenção
* Logs sem dados sensíveis
* Controle de acesso por endpoint e por entidade

---

## 9) Observabilidade e performance

O agente deve incluir:

* Métricas por endpoint (latência, erro)
* Logs de queries lentas
* Padrão de tracing (correlation id)
* Limites de paginação
* Guidelines de N+1 e eager loading

---

## 10) “Como o agente deve escrever” (padrão de redação)

* Linguagem objetiva
* Padrões acima de detalhes voláteis
* Exemplos curtos e úteis
* Sempre indicar critérios de validação
* Separar por domínio

---

## 11) Checklist final de completude

O agente só considera “documentação completa” quando:

* [ ] Todas as tabelas/entidades aparecem no Data Dictionary
* [ ] Todos os relacionamentos (FKs) estão mapeados
* [ ] Constraints e índices catalogados
* [ ] Existe playbook de migração e rollout
* [ ] Endpoints relevantes documentados (OpenAPI)
* [ ] Client gerado documentado + convenções
* [ ] Mocks/fixtures descritos
* [ ] Mapa de uso no frontend por entidade
* [ ] Segurança/PII coberta
* [ ] Observabilidade/performance coberta

---

## 12) Prompt-base para o agente executar este guia

Use este prompt como “entrada padrão” para o agente iniciar o trabalho:

> **Tarefa**: Documentar completamente a base de dados e sua integração full-stack (backend + frontend). Siga o Guia Operacional: aplique RPI, mantenha contexto baixo por domínio, produza DB Overview, Data Dictionary, Relationship Map, Index & Constraint Catalog, Migration Playbook, OpenAPI Contract Notes, Client Generation Contract e Frontend Data Usage Map. Documente padrões (não nomes específicos de arquivos). Para cada entidade: finalidade, campos com tipos e regras, relacionamentos, constraints, índices, operações típicas, exemplos JSON, notas de API e notas de UI. Ao detectar lacunas, registre-as e proponha decisões (sem implementar) até aprovação.

---

## 13) Exemplo de saída mínima (modelo de seção)

### `subscriptions`

**Finalidade**: controlar assinaturas e seu estado no sistema.

**Campos**:

* `id` (uuid) — PK.
* `user_id` (uuid) — FK → `users.id`.
* `provider` (text) — ex.: `stripe`.
* `provider_subscription_id` (text) — id externo.
* `status` (enum) — `trialing|active|past_due|canceled`.
* `trial_ends_at` (timestamp) — fim do trial.
* `created_at` / `updated_at`.

**Constraints/Índices**:

* UNIQUE(`provider`, `provider_subscription_id`).
* INDEX(`user_id`).

**Notas de API**:

* `GET /subscriptions` paginado.
* `POST /subscriptions/trial` cria trial.

**Notas de UI**:

* Tela de billing mostra status e trial.

---

## 14) Como manter este guia vivo

* Sempre que o agente errar por falta de contexto: **atualize as rules** do domínio.
* Quando um novo domínio for adicionado: crie um “pacote de documentação” do domínio.
* Evitar “mega arquivo”: preferir módulos.

---

Se você quiser, eu também posso transformar este guia em:

* **um conjunto de templates (.md) por domínio** (database/auth/billing/etc.), ou
* **um checklist operacional em formato de issues/tarefas** pronto para Jira/GitHub Projects.

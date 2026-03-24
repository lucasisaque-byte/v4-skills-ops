# Memória de Clientes — Leitura e Escrita

## Estrutura de pastas

```
clients/
├── nome-do-cliente-a/
│   ├── dcc.md
│   ├── ucm.md
│   ├── guia-de-marca.md
│   └── outros/
│       ├── briefing-campanha-q1.md
│       └── relatorio-midia-fev.md
└── nome-do-cliente-b/
    └── ...
```

A pasta raiz `clients/` fica dentro do diretório do projeto.
Cada cliente tem sua própria pasta com slug em kebab-case (minúsculas, hífens).

---

## Como identificar o cliente

1. Leia o prompt do usuário
2. Extraia o nome do cliente mencionado
3. Normalize para kebab-case: "HS Prevent" → `hs-prevent`
4. Verifique se a pasta `clients/hs-prevent/` existe

Se o nome não estiver claro no prompt → pergunte antes de continuar.

---

## Leitura de contexto salvo

Ao iniciar qualquer tarefa:

1. Verifique se a pasta do cliente existe
2. Liste todos os arquivos disponíveis
3. Priorize leitura: DCC → UCM → briefings de campanha → outros
4. Leia os arquivos relevantes para a tarefa atual
5. Monte o mapa de contexto disponível

---

## Salvamento de documentos novos

Quando o usuário anexar um documento:

1. Identifique o cliente ao qual o documento pertence
2. Determine o tipo do documento (DCC, UCM, briefing, relatório, etc.)
3. Salve em `clients/{nome-do-cliente}/{tipo-do-documento}.md`
4. Confirme o salvamento para o usuário:
   > "📁 Documento salvo em clients/hs-prevent/briefing-campanha-linkedin.md e disponível para tarefas futuras."

---

## Atualização de documentos existentes

Se um novo documento sobrescrever informações de um existente:

1. Salve o novo documento com nome descritivo (inclua data ou versão se relevante)
2. Não delete o anterior — mantenha histórico
3. Use o mais recente como fonte primária (hierarquia de contexto)

Exemplo:
```
clients/hs-prevent/
├── dcc-v1.md          ← versão anterior
└── dcc-v2-2026-03.md  ← versão atual (prioridade)
```

---

## Quando o cliente é novo

Se a pasta do cliente não existir:

1. Crie a pasta `clients/{nome-do-cliente}/`
2. Salve os documentos recebidos
3. Sinalize ao usuário:
   > "📁 Cliente novo criado: clients/hs-prevent/. Documentos recebidos foram salvos como base de contexto inicial."
4. Prossiga com a tarefa usando os documentos fornecidos

---

## Boas práticas de nomenclatura

| Tipo de arquivo | Nome sugerido |
|-----------------|---------------|
| DCC | `dcc.md` ou `dcc-v2.md` |
| UCM | `ucm.md` |
| Briefing de campanha | `briefing-{campanha}.md` |
| Guia de marca | `guia-de-marca.md` |
| Relatório de mídia | `relatorio-midia-{periodo}.md` |
| Ata de reunião | `reuniao-{data}.md` |
| Copy produzida | `copy-{tipo}-{data}.md` |
| Feedback recebido | `feedback-{data}.md` |

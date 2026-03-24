# Hierarquia de Contexto e Resolução de Conflitos

## Ordem de prioridade

Quando houver informações conflitantes entre fontes diferentes, obedeça esta ordem:

```
1º  Documento novo anexado no prompt atual
      → mais específico, mais recente, reflete intenção atual do usuário

2º  Contexto salvo na pasta clients/{nome-do-cliente}/
      → base de conhecimento acumulada, validada em uso real

3º  Instrução escrita no prompt do usuário
      → mais geral, pode ser imprecisa ou incompleta
```

---

## Como separar o contexto

Ao ler os documentos disponíveis, classifique cada informação em:

| Categoria | Definição | Ação |
|-----------|-----------|------|
| **Contexto essencial** | Sem isso, o briefing fica inválido | Extraia e use |
| **Contexto complementar** | Enriquece, mas não é bloqueante | Extraia e use se relevante |
| **Ruído** | Informação irrelevante para a tarefa atual | Ignore |
| **Lacuna crítica** | Informação necessária que não existe | Sinalize e assuma hipótese ou pergunte |
| **Conflito** | Duas fontes com informações diferentes | Aplique hierarquia acima |
| **Premissa assumida** | Decisão tomada por falta de informação | Declare explicitamente ao usuário |

---

## Regras de completude de contexto

### Cenário 1 — Sem contexto
Nenhum documento encontrado + prompt insuficiente para construir briefing.

**Ação:** Interrompa o fluxo. Pergunte ao usuário antes de prosseguir.

Exemplo de resposta:
> "Não encontrei documentos salvos para [cliente] e o briefing atual não tem contexto suficiente para construir [tipo de peça]. Você pode compartilhar o DCC, UCM ou outro documento de referência do cliente? Ou me dar mais detalhes sobre [lacuna específica]?"

---

### Cenário 2 — Contexto parcial
Há documentos, mas faltam informações importantes.

**Ação:** Prossiga com o que tem. Ao entregar o briefing ou output:
- Liste as lacunas encontradas
- Declare as hipóteses assumidas
- Indique o risco de cada hipótese para a qualidade do output

Exemplo de sinalização:
> "⚠️ Lacunas identificadas:
> - Oferta específica: não encontrada no DCC. Assumi a oferta principal descrita na seção 1.2.
> - Tom de voz para CFO: não especificado. Usei tom executivo formal como padrão.
> Risco: se a oferta real for diferente, o CTA pode estar desalinhado."

---

### Cenário 3 — Contexto completo
Documentos suficientes, prompt claro.

**Ação:** Prossiga direto para classificação de tarefa e construção de briefing.

---

## Tipos de documentos e o que extrair de cada um

| Tipo de documento | O que extrair |
|-------------------|---------------|
| **DCC** | Tom de voz, personas, dores, objeções, diferenciais, oferta, provas sociais |
| **UCM** | Jobs-to-be-done, forças de mudança (push/pull), alternativas de mercado |
| **Briefing de campanha** | Objetivo específico, prazo, canal, público, restrições |
| **Guia de marca** | Cores, tipografia, linguagem proibida, referências visuais |
| **Transcrição de reunião** | Decisões tomadas, próximos passos, contexto de campanha |
| **Relatório de mídia** | Performance, KPIs, gargalos, hipóteses de melhoria |
| **Output de outra skill** | Copy aprovada, estrutura visual, direção de arte |
| **Feedback do usuário** | Ajustes solicitados, tom de insatisfação, nível de mudança necessário |

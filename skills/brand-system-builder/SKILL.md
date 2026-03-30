---
name: brand-system-builder
description: >
  Transforma o brand-raw.json gerado pela skill brand-intel em três documentos
  de design system prontos para uso: identidade-visual.md (guia de marca),
  design-system-social-media.md (sistema de design para conteúdo) e
  design-tokens.json (variáveis CSS/design prontas para o frontend).
  Use sempre após rodar a brand-intel em um cliente novo ou quando o brand-raw.json
  for atualizado. Os documentos gerados alimentam diretamente o social-media-designer
  e o frontend-design para produção de peças alinhadas à marca.
---

# Brand System Builder

Você é o arquiteto de sistemas de design da V4 Company. Seu trabalho não é criar a identidade visual de um cliente — é **documentá-la de forma tão clara e estruturada que qualquer designer do time consiga produzir peças perfeitas sem fazer uma única pergunta**.

O input é o `brand-raw.json` gerado pela `brand-intel`. O output são três arquivos que formam o design system completo do cliente.

## Inputs

- **`brand-raw.json`** (obrigatório) — caminho fornecido pelo usuário
- **Assets locais** (opcional) — pasta de logos, criativos, imagens do cliente
- **Contexto adicional** (opcional) — informações que o usuário queira adicionar manualmente

Leia o `brand-raw.json` integralmente antes de começar. Se o arquivo não existir, peça ao usuário para rodar a skill `brand-intel` primeiro.

## Os três documentos de output

Salve todos em `clients/{cliente}/brand/`:

| Arquivo | Para quem | O que contém |
|---------|-----------|--------------|
| `identidade-visual.md` | Todo o time | Guia de marca completo — cores, tipografia, logo, usos corretos e incorretos |
| `design-system-social-media.md` | Social media designer | Sistema de design específico para conteúdo — layouts, padrões, arquétipos de peça |
| `design-tokens.json` | Frontend designer | Variáveis CSS prontas para colar em HTML/CSS, em formato de tokens |

Gere os três documentos em sequência. Não omita seções — um design system incompleto é mais prejudicial do que não ter nenhum.

---

## Documento 1: identidade-visual.md

Siga a estrutura abaixo. Adapte o conteúdo ao cliente — não use placeholders genéricos.

```markdown
# Identidade Visual — {Nome do Cliente}

> Documento de marca gerado automaticamente pela V4 Company · {data}
> Fonte: brand-raw.json v{versão}

## Arquivos de Marca

Liste todos os arquivos de logo disponíveis com:
- Caminho do arquivo
- Variação (horizontal colorida, vertical branca, símbolo isolado, etc.)
- Fundo recomendado
- Uso recomendado

## Paleta de Cores

### Cores Primárias
Para cada cor primária:
- Swatch em CSS (bloco de código ou tabela)
- Nome da cor
- Hex, RGB
- Uso específico

### Cores Secundárias e de Suporte
Mesma estrutura.

### Cores Neutras
Mesma estrutura.

### Regras de Uso
- O que NUNCA fazer com as cores (combinações proibidas, usos incorretos)
- Hierarquia de uso (qual cor domina, qual é acento, qual é base)

## Tipografia

### Família Principal
- Nome da fonte, link de importação
- Pesos disponíveis
- Instrução de importação (Google Fonts @import ou instalação)

### Hierarquia Tipográfica
Tabela com: Elemento | Família | Peso | Tamanho referência | Uso

### Padrões Observados
Técnicas tipográficas específicas da marca (ex: mix de pesos na mesma linha,
ALL CAPS em CTAs, highlights inline, etc.)

### Regras
- Fontes proibidas
- Pesos mínimos por contexto

## Logo

### Composição e Significado
Descrição detalhada do que é o logo, como é composto, o que comunica.

### Variações e Uso
Tabela: Arquivo | Descrição | Fundo recomendado | Quando usar

### Proteção e Área de Respiro
Regras de espaçamento mínimo ao redor do logo.

### O que Nunca Fazer com o Logo
Lista objetiva de proibições.

## Personalidade e Tom

### Arquétipos
Nome dos arquétipos + descrição de como se manifestam visualmente.

### Adjetivos da Marca
Lista dos adjetivos visuais + o que cada um significa na prática.

### Tom de Voz
Descrição do tom + exemplos concretos de frases que SÃO e frases que NÃO SÃO da marca.

## Aplicações Digitais

### Landing Pages
Como usar as cores, tipografia e logo em LPs — estrutura de seções, cores de fundo,
hierarquia de headline, padrão de CTAs.

### Anúncios (Meta/Google/LinkedIn)
Regras específicas para formatos de ads — logo sempre visível, paleta restrita, etc.
```

---

## Documento 2: design-system-social-media.md

Este é o guia operacional para o social media designer. Seja específico — cada seção deve ser diretamente aplicável sem interpretação adicional.

```markdown
# Design System — Social Media — {Nome do Cliente}

> Gerado automaticamente · {data} · Subordinado à identidade-visual.md
> Em caso de conflito, identidade-visual.md prevalece.

## Paleta para Social Media

### Cores aprovadas para uso em conteúdo
Liste as cores com hex, nome e uso específico em conteúdo social.

### Regra de contraste
Combinações de fundo/texto aprovadas e proibidas, explicitamente.

## Tipografia para Social Media

### Tamanhos mínimos por função e formato
Tabela: Função | Post Feed | Stories | Carrossel
(Use os valores da identidade visual, adaptados para os tamanhos de canvas)

### Peso mínimo por contexto
Regras claras de legibilidade.

## Canvas e Margens de Segurança

Tabela: Formato | Dimensões | Margem lateral | Margem topo | Margem base

## Padrões de Layout

Com base nos criativos analisados no brand-raw.json, documente os padrões
de layout reais que a marca já usa. Para cada padrão:

- **Nome do padrão** (ex: "Split foto + bloco de cor")
- **Quando usar** (tipo de conteúdo, objetivo)
- **Estrutura** (descrição da composição)
- **Cores predominantes**
- **Referência** (arquivo de criativo que exemplifica)

## Arquétipos de Peça

Para cada tipo de peça que a marca produz, documente:

- **Nome** (ex: "Ad de performance — frete")
- **Objetivo** (conversão, awareness, educação)
- **Estrutura visual** (padrão de layout + hierarquia)
- **Tom do texto** (direto, técnico, emocional)
- **Elementos obrigatórios** (logo, CTA, hashtag, etc.)

## Fotografia e Imagens

- Estilo de fotografia aprovado (editorial, lifestyle, operacional, etc.)
- Paleta fotográfica (tons frios, quentes, neutros)
- O que mostrar (personas, cenários, objetos)
- O que evitar

## Elementos Gráficos Recorrentes

Liste os elementos de design que aparecem com frequência nos criativos —
blocos de cor, linhas separadoras, marcadores de bullet, badges, etc.
Para cada um: descrição + cor + uso correto.

## Posicionamento de Logo

Regras explícitas de onde e como o logo deve aparecer em cada formato.

## Anti-Padrões

### Nunca fazer
Lista objetiva do que contradiz a identidade visual da marca.

### Sempre fazer
Lista do que deve aparecer em toda peça sem exceção.
```

---

## Documento 3: design-tokens.json

Gere um JSON de design tokens pronto para ser copiado em um arquivo CSS ou usado por um frontend designer. Siga este schema:

```json
{
  "meta": {
    "cliente": "slug-do-cliente",
    "versao": "1.0.0",
    "gerado_em": "YYYY-MM-DD",
    "fonte": "brand-raw.json"
  },
  "color": {
    "primary": {
      "DEFAULT": { "value": "#HEX", "type": "color" },
      "light": { "value": "#HEX", "type": "color" },
      "dark": { "value": "#HEX", "type": "color" }
    },
    "secondary": {
      "DEFAULT": { "value": "#HEX", "type": "color" }
    },
    "neutral": {
      "white": { "value": "#FFFFFF", "type": "color" },
      "black": { "value": "#000000", "type": "color" },
      "100": { "value": "#HEX", "type": "color" },
      "200": { "value": "#HEX", "type": "color" },
      "500": { "value": "#HEX", "type": "color" },
      "700": { "value": "#HEX", "type": "color" },
      "900": { "value": "#HEX", "type": "color" }
    },
    "text": {
      "primary": { "value": "{color.neutral.900}", "type": "color" },
      "secondary": { "value": "{color.neutral.500}", "type": "color" },
      "inverse": { "value": "{color.neutral.white}", "type": "color" },
      "accent": { "value": "{color.primary.DEFAULT}", "type": "color" }
    },
    "background": {
      "default": { "value": "{color.neutral.white}", "type": "color" },
      "dark": { "value": "{color.secondary.DEFAULT}", "type": "color" },
      "accent": { "value": "{color.primary.DEFAULT}", "type": "color" },
      "subtle": { "value": "#HEX", "type": "color" }
    }
  },
  "typography": {
    "fontFamily": {
      "primary": { "value": "'FontName', sans-serif", "type": "fontFamily" }
    },
    "fontWeight": {
      "light": { "value": 300, "type": "fontWeight" },
      "regular": { "value": 400, "type": "fontWeight" },
      "medium": { "value": 500, "type": "fontWeight" },
      "semibold": { "value": 600, "type": "fontWeight" },
      "bold": { "value": 700, "type": "fontWeight" },
      "extrabold": { "value": 800, "type": "fontWeight" }
    },
    "fontSize": {
      "display": { "value": "4rem", "type": "fontSize" },
      "h1": { "value": "3rem", "type": "fontSize" },
      "h2": { "value": "2.5rem", "type": "fontSize" },
      "h3": { "value": "1.75rem", "type": "fontSize" },
      "body-lg": { "value": "1.125rem", "type": "fontSize" },
      "body": { "value": "1rem", "type": "fontSize" },
      "body-sm": { "value": "0.875rem", "type": "fontSize" },
      "caption": { "value": "0.75rem", "type": "fontSize" }
    }
  },
  "spacing": {
    "base": { "value": "8px", "type": "spacing" },
    "section-y": { "value": "96px", "type": "spacing" },
    "container-max": { "value": "1370px", "type": "dimension" }
  },
  "borderRadius": {
    "button": { "value": "4px", "type": "borderRadius" },
    "card": { "value": "8px", "type": "borderRadius" },
    "container": { "value": "12px", "type": "borderRadius" }
  },
  "cssVariables": "/* Cole este bloco em :root { } no seu CSS */\n--color-primary: #HEX;\n--color-primary-light: #HEX;\n--color-primary-dark: #HEX;\n--color-secondary: #HEX;\n--color-bg: #FFFFFF;\n--color-bg-dark: #HEX;\n--color-text: #HEX;\n--color-text-secondary: #HEX;\n--font-primary: 'FontName', sans-serif;\n--radius-button: 4px;\n--radius-card: 8px;\n--container-max: 1370px;"
}
```

O campo `cssVariables` deve conter um bloco CSS pronto para copiar e colar — preencha com os valores reais do cliente.

---

## Após gerar os três documentos

1. Liste os arquivos gerados com seus caminhos
2. Apresente um resumo em 5-7 bullets do que foi documentado
3. Aponte qualquer decisão de interpretação que tomou (ex: "assumi que #F15A22 é a primária porque aparece em 100% dos CTAs")
4. Liste o que ainda está em `lacunas` no brand-raw.json e que pode enriquecer os documentos futuramente

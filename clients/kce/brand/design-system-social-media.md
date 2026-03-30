# Design System — Social Media — KCE Logistics

> Gerado automaticamente pela V4 Company · 2026-03-24
> Subordinado à `identidade-visual.md` — em caso de conflito, a identidade-visual prevalece.
> Baseado na análise de 11 criativos reais + CSS extraído de kcelogistics.com

---

## Paleta para Social Media

### Cores aprovadas para conteúdo

| Cor | Hex | Nome | Uso em social |
|-----|-----|------|---------------|
| 🟧 | `#F15A22` | Laranja Primário | Blocos de fundo, highlights de texto, CTAs, marcadores de bullet, seta de continuidade |
| 🟦 | `#1C2336` | Navy Institucional | Fundos escuros, overlays sobre foto, slides de tensão/problema |
| ⬜ | `#FFFFFF` | Branco | Texto sobre laranja e navy, cards, fundo de posts institucionais |
| ⬛ | `#191C24` | Preto Base | Texto principal sobre fundo branco, CTA box preenchido |
| 🔵 | `#5E6E8D` | Azul-Cinza | Texto secundário, subtítulos, informações de suporte |
| 🔲 | `#F3F4F6` | Cinza Claro | Fundo alternativo em posts mais limpos/institucionais |

### Regra de contraste (tabela fundo × texto)

| Fundo | Texto permitido | Texto proibido |
|-------|----------------|----------------|
| `#F15A22` Laranja | `#FFFFFF` Branco | Preto, laranja claro, azul-cinza |
| `#1C2336` Navy | `#FFFFFF` Branco, `#F15A22` Laranja | Preto base (invisível), azul-cinza |
| `#FFFFFF` Branco | `#191C24` Preto, `#1C2336` Navy, `#F15A22` Laranja (título apenas, 24px+) | Branco, cinza claro |
| `#191C24` Preto | `#FFFFFF` Branco, `#F15A22` Laranja | Azul-cinza (contraste insuficiente) |

---

## Tipografia para Social Media

### Tamanhos mínimos por função e formato

| Função | Feed 4:5 (1080×1350) | Stories 9:16 (1080×1920) | LinkedIn/Horizontal |
|--------|---------------------|--------------------------|---------------------|
| Hero / Display | 72–120px | 64–100px | 48–80px |
| Heading | 48–72px | 46–64px | 36–52px |
| Body / Bullets | 36–48px | 34–44px | 28–40px |
| CTA / Label | 28–36px | 26–32px | 24–32px |
| Caption / Footer | 24px mínimo | 22px mínimo | 20px mínimo |

> **Regra universal:** nenhum texto legível abaixo de 22px em qualquer formato.

### Peso mínimo por contexto

| Contexto | Peso mínimo |
|----------|-------------|
| Headline principal | 600 (SemiBold) |
| Palavra de destaque em headline | 700–800 (Bold/ExtraBold) |
| Corpo de texto e bullets | 400 (Regular) |
| CTA em ALL CAPS | 500–600 |
| Caption / assinatura | 400 com fundo de alto contraste |

### Padrão tipográfico da marca em social

**Técnica principal — Mix de peso na mesma linha:**
Parte da frase em 400 (regular) + palavra(s)-chave em 700-800 (bold/extrabold).
A palavra de destaque pode também receber a cor laranja `#F15A22`.

```
"The logistics partner that guarantees"  [400, branco]
"on-time delivery"                        [700, laranja #F15A22]
"and flawless execution"                  [700, branco]
```

**Highlight em bloco laranja:**
Palavra ou frase curta dentro de um retângulo laranja sólido, texto branco em ALL CAPS.
Border-radius: 0–4px (quase reto, alinhado com o estilo da marca).

```
[ REFLECT YOUR BRAND ]  ← bloco laranja, texto branco, ALL CAPS, peso 600
```

**CTA sempre em ALL CAPS:**
Todos os calls-to-action em letras maiúsculas, peso 500–600.
Separar palavras com espaçamento normal — não usar letter-spacing exagerado.

---

## Canvas e Margens de Segurança

| Formato | Dimensões | Margem lateral | Margem topo | Margem base |
|---------|-----------|---------------|-------------|-------------|
| Feed quadrado | 1080×1080px | 72px | 72px | 72px |
| Feed 4:5 (principal) | 1080×1350px | 72px | 80px | 80px |
| Stories / Reels | 1080×1920px | 80px | 140px | 160px |
| Carrossel (por slide) | 1080×1350px | 72px | 80px | 80px |
| LinkedIn horizontal | 1200×628px | 80px | 64px | 64px |
| LinkedIn quadrado | 1080×1080px | 72px | 72px | 72px |

> Nenhum texto ou elemento visual deve tocar ou ultrapassar as margens de segurança.

---

## Padrões de Layout

Baseados nos criativos existentes da KCE. Cada padrão tem nome, quando usar e como construir.

---

### Padrão A — Split Layout (Foto + Bloco de Texto)

**Quando usar:** Key Visuals horizontais, LinkedIn ads, materiais institucionais.

**Estrutura:**
- Metade esquerda: fundo branco com bloco de texto alinhado à esquerda
  - Highlight laranja no topo (frase curta, ALL CAPS)
  - Headline H1 em preto, peso 600-700
  - Bullets com marcadores laranjas
  - CTA button outlined (borda laranja, texto laranja)
- Metade direita: foto operacional full-bleed (armazém, carga, entregador)
- Logo: canto inferior direito, versão colorida

**Cores:** Fundo branco + laranja como acento + foto com paleta fria

**Referência:** `criativos/key-visuals/kv-01.png`

---

### Padrão B — Foto Full-Bleed + Bloco Laranja Base

**Quando usar:** Ads de feed (Meta/Instagram), slides de carrossel educativos.

**Estrutura:**
- Foto operacional ocupa 50–60% superior do canvas (full-width)
- Bloco laranja sólido `#F15A22` ocupa 40–50% inferior
  - Headline branca, peso 700, 2–3 linhas
  - Corpo de texto branco, peso 400, abaixo do headline
  - Seta → no canto inferior direito (indica continuidade)
- Logo branca: canto inferior centralizado ou direito

**Cores:** Foto (paleta fria) + laranja `#F15A22` + branco

**Referência:** `criativos/social-media/sm-14-01-slide-02.png`

---

### Padrão C — Foto com Overlay Navy (Capa Dramática)

**Quando usar:** Slide de capa de carrossel, posts de tensão/problema, conteúdo que precisa de impacto.

**Estrutura:**
- Foto operacional full-bleed (avião, navio, carga)
- Overlay navy semi-transparente `rgba(28,35,54,0.75)` sobre a foto
- Texto branco centralizado: headline bold + subheadline regular
- Elemento de navegação: seta → branca no centro-baixo
- Logo branca: bottom-center

**Cores:** Foto + navy overlay + branco

**Referência:** `criativos/social-media/sm-14-01-slide-01.png`

---

### Padrão D — Card Branco Flutuante sobre Laranja/Foto

**Quando usar:** Posts institucionais, desdobramentos de campanha, destaques de produto.

**Estrutura:**
- Fundo laranja sólido `#F15A22` no topo (30–40% do canvas)
  - Logo compacta branca centralizada
- Card branco centralizado (80–90% da largura, border-radius 8px)
  - Headline em ALL CAPS preto, peso 800
  - Faixa laranja com texto branco (highlight de frase)
  - Corpo regular preto centralizado
  - CTA outlined laranja na base do card
- Foto operacional na base (abaixo do card)

**Cores:** Laranja + branco + preto

**Referência:** `criativos/key-visuals/desdobramento-01.png`

---

### Padrão E — Clean com Acento Laranja (Institucional)

**Quando usar:** Posts de valor/institucional, conteúdo de geração de autoridade, posts com fundo branco.

**Estrutura:**
- Fundo branco com foto lateral ou de suporte
- Headline principal: peso 600-700, laranja `#F15A22` para nome/marca, preto para o restante
- Linha divisória horizontal em laranja (2-3px)
- Dados ou bullets em preto regular abaixo da linha
- Logo colorida: canto inferior esquerdo

**Cores:** Branco + preto + laranja como acento pontual

**Referência:** `criativos/social-media/sm-05-01.png`

---

## Arquétipos de Peça

### 1. Ad de Performance — Frete/Logística

**Objetivo:** Conversão direta — gerar lead ou clique para contato.

**Estrutura visual:** Padrão B (Foto + Bloco Laranja Base)

**Tom do texto:**
- Headline: promessa mensurável + urgência ("Close deals faster", "Quote in 60 seconds")
- Bullets: 3 benefícios operacionais concretos (velocidade, visibilidade, suporte)
- CTA: ALL CAPS, direto ("SPEAK TO A FREIGHT EXPERT")

**Elementos obrigatórios:** Logo branca, CTA visível, foto operacional real

**Exemplo de estrutura:**
```
[Foto de navio/avião/armazém]
─────────────────────────────
Close deals faster
with [serviço específico]

• Benefício operacional 1
• Benefício operacional 2
• Benefício operacional 3

[FALE COM UM ESPECIALISTA]
                    KCELogistics
```

---

### 2. Post Educativo — Carrossel Comparativo

**Objetivo:** Autoridade e engajamento — explicar, educar, gerar salvamentos.

**Estrutura visual:**
- Slide 1 (capa): Padrão C — pergunta ou comparação no título ("Air vs. Ocean — which one?")
- Slides 2–4 (conteúdo): Padrão B — foto + bloco laranja com informação
- Slide final: Padrão E ou logo centralizada + CTA suave

**Tom do texto:**
- Capa: pergunta provocativa ou comparação direta
- Conteúdo: formato "Pro/Con", "Best for:", direto e estruturado
- Final: CTA consultivo ("Fale com nosso especialista para a decisão certa")

**Elementos obrigatórios:** Seta → de continuidade entre slides, logo em todos os slides, consistência de paleta

---

### 3. Post Institucional — Hub/Capacidade

**Objetivo:** Awareness e autoridade — mostrar escala, localização, capacidade.

**Estrutura visual:** Padrão E (Clean com Acento Laranja)

**Tom do texto:**
- Headline: dado específico + local ("55,000 sq ft of precision, technology and strategy · Miami")
- Subtítulo: proposição de valor concisa
- Dados: números reais de capacidade ou operação

**Elementos obrigatórios:** Logo colorida, dado numérico de impacto, linha divisória laranja

---

### 4. Post de Oferta / Lead Gen

**Objetivo:** Geração direta de lead com oferta de valor (free quote, free meeting).

**Estrutura visual:** Padrão D (Card Branco Flutuante)

**Tom do texto:**
- Headline: imperativo + benefício imediato ("GET YOUR FREE RISK QUOTE")
- Corpo: 2–3 linhas explicando o que a pessoa ganha
- CTA: outlined laranja, ALL CAPS

**Elementos obrigatórios:** CTA visível, logo compacta no topo, fundo laranja para urgência visual

---

## Fotografia e Imagens

### Estilo aprovado

Fotografia **editorial operacional** — imagens reais ou stock de alta qualidade que mostram o ambiente logístico real. Pessoas em ação, equipamentos, cargas.

### Paleta fotográfica

- **Predominante:** tons frios — azul de céu/oceano, cinza de hangar/armazém, aço de containers
- **Contraste interno:** laranjas naturais dos EPIs (coletes, capacetes, uniformes) — complementam o laranja da marca
- **Evitar:** fotos com paleta quente/dourada ou filtros excessivos

### O que mostrar

✅ Armazéns organizados com boa iluminação
✅ Cargas aéreas — aviões, paletes, carga sendo movimentada
✅ Navios porta-containers e operações portuárias
✅ Profissionais com EPI (colete amarelo/laranja, capacete)
✅ Entregadores em ação (uniforme laranja se disponível)
✅ Sistemas e tecnologia (tablets, scanners, sistemas de gestão)

### O que evitar

❌ Fotos de pessoas sorrindo em escritório sem contexto operacional
❌ Lifestyle desconexo da operação (café, reuniões genericas)
❌ Ilustrações, iconografia flat ou elementos vetoriais decorativos
❌ Fotos com filtro forte (preto e branco, sépia, alto contraste artificial)
❌ Imagens com resolução baixa ou muito "stockadas" (composição artificial demais)

---

## Elementos Gráficos Recorrentes

| Elemento | Descrição | Cor | Uso correto |
|----------|-----------|-----|-------------|
| **Bloco retangular laranja** | Retângulo sólido sem border-radius (ou 0–4px) | `#F15A22` | Fundo de headline highlight, base de slide, banner de CTA |
| **Linha divisória** | Linha horizontal fina (2–3px) | `#F15A22` | Separar hierarquias de texto, dividir seções dentro de um post |
| **Marcador de bullet** | Quadrado ou círculo pequeno | `#F15A22` | Listas de benefícios e características |
| **Seta de continuidade** | `→` em texto ou elemento gráfico | `#FFFFFF` ou `#F15A22` | Indicar próximo slide em carrosseis, CTA visual |
| **CTA outlined** | Border 2px laranja, fundo transparente, texto laranja | `#F15A22` | Chamada para ação secundária ou sobre fundo claro |
| **CTA sólido** | Fundo laranja sólido, texto branco | `#F15A22` / `#FFFFFF` | Chamada para ação principal, alta prioridade |
| **CTA box preto** | Fundo preto, texto branco | `#191C24` / `#FFFFFF` | Variação de CTA sobre fundos brancos (usado em ads de fulfillment) |

---

## Posicionamento de Logo

| Formato | Posição | Versão do logo |
|---------|---------|----------------|
| KV Horizontal (texto à esquerda) | Canto inferior direito | Colorida (sobre branco) |
| KV Horizontal (foto à esquerda) | Canto superior direito | Colorida (sobre branco) |
| Ad Feed vertical com bloco laranja base | Centralizado no bloco laranja | Branca |
| Ad Feed vertical com fundo branco | Canto inferior esquerdo | Colorida |
| Carrossel — capa com overlay navy | Bottom-center | Branca |
| Carrossel — slides com bloco laranja | Bottom-right no bloco | Branca |
| Post institucional (fundo branco) | Canto inferior esquerdo | Colorida |
| Post quadrado com topo laranja | Topo laranja centralizado | Branca compacta ("KCE") |

**Regra universal:** O logo nunca compete visualmente com o headline principal. Em posts com texto dominante, o logo ocupa no máximo 15% da largura do canvas.

---

## Anti-Padrões

### Nunca fazer

❌ Usar mais de 3 cores diferentes em uma mesma peça
❌ Colocar texto laranja sobre fundo laranja em qualquer variação
❌ Usar logo colorida sobre fundo navy ou laranja
❌ Fontes serifadas ou diferentes de Roboto em qualquer elemento
❌ Gradientes — a marca é plana, sem transições de cor
❌ Sombras excessivas ou efeitos 3D sobre o logo
❌ Texto abaixo de 22px em qualquer formato
❌ Copy com metáforas emocionais, linguagem vaga ou genérica
❌ Fotos com filtro excessivo ou paleta quente/dourada
❌ CTA sem ser em ALL CAPS
❌ Múltiplas fontes ou pesos aleatórios sem hierarquia clara
❌ Elementos decorativos (estrelas, confetes, shapes abstratos, gradientes coloridos)

### Sempre fazer

✅ Logo visível em toda peça, em versão adequada ao fundo
✅ CTA em ALL CAPS com cor de alta visibilidade
✅ Pelo menos um elemento laranja `#F15A22` em cada peça
✅ Foto operacional real quando a peça incluir fotografia
✅ Hierarquia clara: 1 headline dominante + 1 CTA + informações de suporte
✅ Margem de segurança respeitada em todos os formatos
✅ Contraste aprovado entre fundo e texto (tabela de contraste acima)

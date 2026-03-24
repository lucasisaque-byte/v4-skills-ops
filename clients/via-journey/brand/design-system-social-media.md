# Design System — Social Media · Via Journey Telehealth
## Salvo em: 2026-03-22
## Fonte: análise das entregas do designer sênior (via ChatGPT) + depara com brand guide oficial

> **Regra de ouro:** Em caso de conflito entre este documento e `identidade-visual.md`, o brand guide (`identidade-visual.md`) prevalece sempre. Este documento é complementar, não substituto.

---

## ⚠️ PALETA CORRIGIDA (source of truth = brand guide)

Os hexes abaixo foram corrigidos em relação à análise raster das imagens. Use SEMPRE estes valores:

```css
:root {
  /* Cores oficiais Via Journey */
  --vj-green-primary:      #6DB350;  /* verde primário — símbolo, CTAs, destaques */
  --vj-green-dark:         #1A5C3A;  /* verde escuro — headers, overlays, fundos institucionais */
  --vj-green-mid:          #3D7A5C;  /* verde institucional — backgrounds, banners */
  --vj-white:              #FFFFFF;
  --vj-gray-light:         #F5F5F5;  /* fundo off-white de seções */
  --vj-gray-text:          #4A4A4A;  /* corpo de texto longo */

  /* Tons de apoio inferidos das entregas (compatíveis com a família) */
  --vj-green-vibrant:      #0EC576;  /* apoio — dinamismo, listas, explicações */
  --vj-green-highlight:    #9CCB63;  /* highlight suave — tarja, pills de destaque */
}
```

> **Nota:** `#9CCB63` a `#B1D978` funcionam bem como tarja de highlight sobre fundos escuros. O `#6DB350` oficial do símbolo deve ser usado em CTAs e ícones primários.

---

## TIPOGRAFIA OFICIAL

```css
/* Display / Headlines — OFICIAL */
font-family: 'Plus Jakarta Sans', 'Nunito', sans-serif;

/* Alternativas aceitáveis se Plus Jakarta Sans não disponível */
/* Montserrat, Satoshi, Poppins — mesma família geométrica/grotesca */
/* NUNCA usar fontes com serifa */
```

### Hierarquia tipográfica obrigatória

| Nível | Uso | Tamanho (canvas 1080px) | Peso | Line-height |
|-------|-----|------------------------|------|------------|
| **H1** | Manchete principal, capa, problema | 88–140 px | 800–900 | 0.88–1.0 |
| **H2** | Subtítulo, complemento da headline | 40–72 px | 600–800 | 0.95–1.15 |
| **H3 / body destaque** | Texto explicativo, benefício, lista | 24–42 px | 400–700 | 1.1–1.35 |
| **Microtexto** | Assinatura, CTA secundário, rodapé | 18–28 px | 300–500 | 1.2–1.4 |

---

## PRINCÍPIOS OBRIGATÓRIOS DE COMPOSIÇÃO

### 1. Clareza acima de ornamentação
Toda peça deve ser entendida em poucos segundos.
Se houver dúvida entre "mais bonito" e "mais claro", escolha o mais claro.

### 2. Uma ideia principal por bloco
Não misture múltiplas mensagens fortes no mesmo slide.
Cada slide precisa ter um ponto dominante.

### 3. Alto contraste tipográfico
- fundo escuro × texto branco
- fundo claro × texto verde escuro (`#1A5C3A`)
- fundo verde vibrante × texto branco
- palavra-chave destacada com tarja ou cápsula verde clara (`#9CCB63`)

### 4. Modularidade
Informação secundária entra em:
- cards com borda fina
- cápsulas/pills
- containers arredondados (`border-radius: 16–24px`)
- blocos empilhados

### 5. Repetição consciente
Consistência da série via repetição de:
- cor e família de verde
- cantos arredondados
- alinhamento e posição de logo
- uso de palavra destacada em tarja
- barra lateral em alguns carrosséis
- ritmo entre slides abertos e informativos

---

## FORMATO E CANVAS

| Formato | Dimensões | Uso |
|---------|-----------|-----|
| Post estático 4:5 | 1080×1350 px | Principal — feed Instagram |
| Stories | 1080×1920 px | Sequências de stories |
| Carrossel | 1080×1350 px | Slides individuais |

### Safe margins
- Laterais: 72–110 px
- Topo: 70–130 px
- Base: 70–120 px
- **Nunca encostar elementos críticos nas bordas**

---

## PADRÕES DE LAYOUT

### Padrão A — Hero com imagem de fundo
Quando usar: forte apelo humano, sazonalidade, emocionalidade

Estrutura:
- foto humana como base
- overlay verde/teal (`#1A5C3A` em 60–75% opacidade)
- headline grande sobre a imagem (H1 branco)
- subheadline curta (H2 branco)
- linha divisória fina opcional
- bloco de texto complementar na base
- logo menor em posição discreta (canto superior ou inferior)

Técnicas:
- escurecer/tonalizar foto para legibilidade
- aplicar degradê que ajude o texto a "assentar"
- imagem cria calor humano, não apenas decoração

### Padrão B — Poster tipográfico puro
Quando usar: argumento racional, proposta de valor

Estrutura:
- fundo liso ou gradiente suave
- headline dominante (H1)
- destaque em palavra-chave (tarja)
- poucos elementos além do texto
- respiro generoso
- logo no canto ou na base

### Padrão C — Conteúdo educativo com cards empilhados
Quando usar: explicações, benefícios, listas

Estrutura:
- headline grande no topo com palavra-chave em tarja
- 2–4 cards verticais com borda fina
- logo no canto
- repetição modular dos blocos

### Padrão D — Lista comparativa / checklist
Quando usar: before/after, risco/solução, objeção/resposta

Estrutura:
- título forte
- container principal arredondado
- divisão entre estados (ontem/hoje, X/✓)
- CTA em balão ou cápsula
- logo no rodapé

### Padrão E — Fechamento / CTA institucional
Quando usar: último slide do carrossel, posts institucionais

Estrutura:
- fundo muito limpo (branco ou off-white)
- logo mais presente e centralizado
- headline curta e forte
- subtítulo explicativo
- CTA final discreto
- máxima respiração

---

## TÉCNICA DE DESTAQUE DE PALAVRAS

**Elemento mais importante do sistema.** Palavras-chave são enfatizadas por:

1. **Tarja horizontal arredondada** atrás de 1–3 palavras
2. **Palavra em verde claro** (`#9CCB63`) contrastando com texto branco
3. **Trecho em bold** dentro do parágrafo
4. **Palavra isolada em bloco próprio**

### Regras
- máximo 1–2 trechos destacados por bloco
- use a tarja no trecho semanticamente decisivo
- não destaque tudo — o destaque precisa parecer cirúrgico

---

## ESTRUTURAS DE FUNDO

| Fundo | Quando usar |
|-------|------------|
| **Fotográfico tonalizado** | Calor humano, sazonalidade, emoção |
| **Sólido escuro (`#1A5C3A`)** | Autoridade, problema, tensão, dado crítico |
| **Verde vibrante/gradiente** | Dinamismo, explicação, didático |
| **Claro/off-white (`#F5F5F5`)** | Sofisticação, benefícios, CTA, institucional |
| **Formas orgânicas discretas** | Apoio secundário — nunca compete com a informação |

---

## BORDAS, BOXES E CONTAINERS

### Cards
- borda: 1–2 px
- cor: branco translúcido, verde claro ou verde escuro (conforme contraste)
- border-radius: 16–24 px
- padding: generoso
- sombra: sutil ou nenhuma

### Pills / cápsulas
- altura baixa, raio alto (border-radius: 999px)
- cor sólida com alto contraste
- para CTAs secundários, benefícios curtos, palavras-chave

### Containers grandes
- border-radius grande (24–32 px)
- pode conter divisória horizontal
- excelente para comparativos e checklists

---

## LOGO E BRANDING

### Regras de posicionamento
- **Slides de conteúdo:** logo pequeno no canto inferior direito (ou superior direito)
- **Peças institucionais / fechamento:** logo centralizado com mais protagonismo
- **Ads:** logo sempre visível, nunca briga com a headline

### Variações a usar
- Fundo claro → `logo-horizontal-01.png` (full color)
- Fundo escuro/verde → `logo-horizontal-04.png` ou `logo-horizontal-07.png` (versão branca)
- Apenas símbolo → `simbolo-01.png` (bicolor) ou `simbolo-06.png` (outline branco para fundo escuro)

> Consulte `identidade-visual.md` para a tabela completa de variações.

---

## ÍCONES

Use ícones simples, flat e limpos (nunca 3D ou detalhados):
- ✅ check — confirmação, benefício, positivo
- ✖ X / coral — negação, risco, problema
- 💰 moeda — preço, custo
- 🛡️ escudo — proteção, segurança
- 📄 documento — taxa, conta, burocracia

Regra: ícone acelera entendimento do texto. Nunca use só para preencher espaço.

---

## CONTINUIDADE DO CARROSSEL

### Recursos de continuidade
1. **Barra/faixa lateral escura** com canto arredondado — cria identidade de série
2. **Alternância controlada de fundo:**
   - slides escuros → tensão
   - slides verdes → desenvolvimento
   - slides claros → conclusão
3. **Posições repetidas** — headline e logo sempre nas mesmas regiões
4. **Mesma linguagem de destaque** — mesma tarja, mesmos pesos
5. **Ritmo de densidade:**
   - slide 1: impactante
   - slides intermediários: informativos
   - slide final: limpo e institucional

### Regra central
O carrossel deve parecer uma família, não um painel panorâmico.

---

## DECISÃO DE LAYOUT

| Situação | Layout ideal |
|----------|-------------|
| Forte apelo humano ou sazonal | Padrão A (foto + overlay) |
| Argumento racional e educativo | Padrão B ou C |
| Comparação ou contraste | Padrão D |
| Fechamento ou CTA | Padrão E |

---

## FAÇA SEMPRE
- Use respiro (safe margins obrigatórias)
- Use contraste forte
- Organize texto em blocos claros
- Destaque 1 ideia central por slide
- Use verde como sistema, não como efeito aleatório
- Preserve aparência clean
- Faça a peça parecer médica, mas humana
- Crie leitura fácil para mobile
- Privilegie títulos em 2–4 linhas
- Use modularidade para simplificar

## EVITE SEMPRE
- Excesso de elementos decorativos
- Gradientes chamativos demais
- Texturas pesadas / sombras exageradas
- Baixa legibilidade
- Cores fora do sistema principal (`#6DB350`, `#1A5C3A`, `#3D7A5C`, branco, off-white)
- Cara de panfleto promocional
- Visual genérico de "post de Canva sem direção"
- Tipografia com serifa
- Verde claro (`#6DB350`) como fundo de texto escuro (baixo contraste — proibido pelo brand guide)

---

## ARQUÉTIPOS DE PEÇA

### 1. Estático emocional com foto
Para: datas sazonais, acolhimento, saúde mental, vínculo
→ Padrão A com overlay + H1 forte + frase complementar curta + assinatura

### 2. Estático institucional limpo
Para: proposta de valor, transparência, preço, confiança, CTA
→ Padrão E com fundo claro + headline grande + 3 benefícios em pills + logo

### 3. Carrossel educativo risco → explicação → solução
Slide 1: problema forte (escuro)
Slides 2–4: explicações em cards (verde)
Slide 5: quebra de objeção
Slide 6: solução/proposta de valor
Slide final: CTA institucional (claro)

### 4. Carrossel comparativo / lifestyle / sazonal
Slide 1: headline com humor ou contraste
Slide 2: container comparativo (before/after)
Slide 3: apoio com ícones
Slide final: CTA simples

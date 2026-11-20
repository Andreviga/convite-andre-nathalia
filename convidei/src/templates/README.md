# Modelos de convite

Cada modelo é uma pasta `src/templates/<id>/` com dois arquivos:

- `index.tsx`: exporta `def: TemplateDef` (nome, descrição, paletas e o componente `Art` com os ornamentos em SVG).
- `style.css`: o visual. **Todas** as regras ficam sob `.inv[data-template="<id>"]`.

A estrutura (HTML) do convite é a mesma para todos e fica em `src/components/InviteCover.tsx` (capa) e `Invite.tsx` (seções).
O visual base está em `src/app/invite.css`. Um modelo só redefine variáveis e detalhes. `classico/` é o exemplo de referência.

## O que um modelo controla

**Variáveis** (em `.inv[data-template="<id>"]`): `--font-names`, `--font-text`, `--font-label`, `--names-size`, `--names-weight`,
`--names-leading`, `--names-tracking`, `--names-transform`, `--names-em`, `--amp-scale`, `--label-tracking`, `--radius`,
`--btn-radius`, `--paper-pad`, `--frame-inset`, `--paper-shadow`.

`--names-em` é a largura média de uma letra da fonte dos nomes, em `em` (0.45 numa caligrafia estreita, 0.5 numa serifa de
texto, perto de 0.7 em caixa alta espaçada). A base usa esse número para encolher o nome até a maior palavra caber na
linha: nenhuma palavra é partida no meio. Se o modelo troca de fonte numa regra (frase em serifa), redefine `--names-em` ali.

**Cores**: vêm da paleta (`def.palettes`), como `--bg --paper --ink --soft --accent --line --btn-ink --seal --seal-ink --liner`.
Nunca escreva cor fixa no CSS para algo que deve mudar com a paleta; use as variáveis e `color-mix()`.

**Fontes disponíveis** (`src/lib/fonts.ts`): `--f-serif` (EB Garamond, pesos 400 a 800; não há 300), `--f-sc` (Cormorant SC,
só para rótulos em versalete), `--f-sans` (DM Sans),
`--f-pinyon`, `--f-parisienne`, `--f-italianno`, `--f-alex`, `--f-madi`, `--f-greatvibes`, `--f-playfair`, `--f-bodoni`,
`--f-cinzel`, `--f-jost`, `--f-fraunces`, `--f-dmserif`, `--f-marcellus`, `--f-poiret`, `--f-montserrat`.
Não use Cormorant Garamond, Cormorant nem Cormorant Infant em texto com minúsculas: o circunflexo delas é uma cunha fina e
alta ("Você", "bebê" e "avô" parecem ter sujeira sobre a letra). Foi por isso que `--f-serif` passou a ser a EB Garamond.

**Ornamentos** (`Art({ slot, initials, eventType })`): `backdrop` (atrás de tudo, ocupa a página), `top`, `divider`, `bottom`
(dentro do cartão) e `liner` (forro do envelope, preenche 100%). `eventType` é o id do tipo de evento (`casamento`,
`aniversario`, `quinze-anos`, `cha`, `formatura`, `outro`), para o ornamento que só faz sentido em um tipo; chega nos slots
da capa (`top`, `divider`, `bottom`) e pode vir vazio, então tenha sempre um desenho padrão. Devolva `null` no que não usar. SVG com `currentColor`; ids de `<pattern>`/`<gradient>`
com o prefixo do modelo.

**Forro e lacre**: do `liner` só aparece o triângulo de cima (0 0, 100% 0, 50% 58%), e girado em 180° na aba aberta (a borda
de cima do desenho fica na dobra). Para o desenho sair de pé, use `.env-liner > svg { transform: rotate(180deg); }` no modelo:
aí a parte visível é o triângulo de baixo (0 100%, 100% 100%, 50% 42%). As iniciais do lacre usam por padrão a fonte dos nomes;
ajuste em `.env-seal` com `--seal-font`, `--seal-weight`, `--seal-style` e `--seal-size` (tamanho máximo, em unidades da viewBox
de 120). Modelo com nomes em caligráfica usa no lacre as capitais romanas do texto (`--seal-font: var(--font-text)`): floreio não
cabe na cera. Não é preciso ajustar tamanho por par de letras: `WaxSeal` mede a tinta das iniciais no navegador e reduz o que
for preciso para caberem no anel interno, em qualquer fonte. O contorno escuro atrás das iniciais só é desenhado quando a tinta
é clara e o contraste com a cera fica abaixo de 4,5:1 (`sealNeedsEdge` em `src/lib/envelope.ts`). Camadas do envelope (z-index): cartão 1, frente 3,
enfeites do modelo sobre a frente 4, aba 5, lacre 6.

**Classes da capa**: `.inv-cover .inv-paper .inv-art-top .inv-monogram .inv-hello .inv-headline .inv-names .inv-name .inv-amp
.inv-message .inv-art-divider .inv-date (.inv-date-side .inv-date-main .inv-date-day .inv-date-month) .inv-dateline .inv-place
.inv-countdown .inv-art-bottom .inv-more`. O monograma e `.inv-dateline` vêm escondidos: ligue com `display` se o modelo usar.
Dentro do título, algarismos e travessões vêm em `<span class="inv-num">`.

**O título (`.inv-names`)** traz atributos que descrevem o texto, para o CSS decidir tamanho e fonte (`titleShape` em
`src/lib/names.ts`):

| Atributo | Quando | Exemplo |
| --- | --- | --- |
| `data-count="2"` | casal: nome, conector (`.inv-amp`), nome | "Marina & Rafael" |
| `data-count="1"` | título único | "Sofia", "Helena faz 30" |
| `data-long="true"` | casal com um nome de 11 letras ou mais; título único com mais de 16 caracteres (senão vem `"false"`) | "Maria Eduarda & Luiz Henrique" |
| `data-short="true"` | título único de uma palavra com até 7 letras: pode ser composto bem maior | "Sofia" |
| `data-phrase="true"` | título único que é frase, não nome: tem travessão ou quatro palavras ou mais | "Chá revelação da Ana e do Pedro" |
| `data-words="N"` | número de palavras (no casal, do nome com mais palavras) | `3` em "Helena faz 30" |
| `data-longest="N"` | letras do maior trecho que não pode ser partido; também vem como variável `--longest` | `11` em "Maximiliano" |

Junto vem a variável `--line`: as letras do título inteiro quando ele é único e curto (até 14 caracteres, "Helena faz 30");
senão, igual a `--longest`. Na capa (`.inv-cover`) vem também `data-type`, o tipo de evento (usado só nas miniaturas).

O que a base já resolve, sem regra do modelo:

- **Palavra nunca é partida no meio.** Cada `.inv-name` encolhe (piso de 13px) para a maior palavra caber, usando
  `--longest` e `--names-em`. A garantia vale para palavras de até 20 letras num celular de 320px, nos 12 modelos: meça
  `--names-em` com palavras largas ("Wilhelmina", "Maximiliano", "Confraternização"), não com a média do alfabeto, e confira
  também uma de 20 letras ("Otorrinolaringologia"). Modelo de caixa alta espaçada reduz `--names-tracking` nos trechos
  compridos (o Noite faz isso por `data-longest`). O modelo define o tamanho em `.inv-names` normalmente (`font-size: calc(var(--names-size) * 1.3)` para
  título único, por exemplo) e a base aplica o limite por cima. Não ponha `font-size` em `.inv-name`.
- **Partículas e travessão não ficam pendurados.** "de", "da", "do", "das", "dos" e "e" vêm colados à palavra seguinte por
  espaço não separável, e o travessão à palavra anterior (`glueTitle`): a quebra sai "Formatura de Direito — / Turma 2026"
  e "Jantar / de Confraternização" (o trecho colado vai até 20 letras). A frase de abertura, o recado e a saudação passam
  por `glueText` (mesma ideia, com artigos e preposições curtas); a data por extenso vem com "12 de maio", "de 2027" e
  "às 16h30" colados. Nenhum deles termina linha em "e", "de", "da", "do".
- **O "&" nunca fecha uma linha.** No casal ele vem em linha própria (nome / & / nome). O modelo que compõe o casal em texto
  corrido (Festa) cola o "&" ao segundo nome com espaço não separável: "João / & Conceição". Dê folga vertical ao
  `.inv-amp` para descendentes do nome de cima (g, j, ç) e acentos de maiúscula do de baixo (Â, É): confira "Ângela & Érica".
- **`data-long`** reduz o corpo (78% no título único, 84% no casal).

O que cabe ao modelo:

- **Fonte caligráfica nos nomes**: os algarismos e o travessão dela ficam ruins ("30" parece "Zo"). Componha `.inv-num` na
  serifa do modelo, em itálico, com a altura das maiúsculas da caligrafia (cerca de 0.84em) e peso 500:
  `.inv-names:not([data-phrase]) .inv-num { font-family: var(--font-text); font-style: italic; font-size: 0.84em; font-weight: 500; }`.
  E faça o título curto caber numa linha só, para "faz 30" não cair sozinho embaixo:
  `.inv-names[data-count="1"]:not([data-phrase]) .inv-name { --longest: var(--line); }`.
- **Frase de seis palavras ou mais** em fonte grande passa de quatro linhas a 320px: reduza o corpo com
  `[data-phrase="true"]:not([data-words="4"], [data-words="5"])` (Festa, Noite e Azulejo fazem).
- **Respiro entre a frase de abertura e o nome**: cerca de 20px medidos até a caixa da primeira linha do nome; caligrafia
  com laços altos (M, J, Â) encosta na linha de cima com menos que isso.
- **Frase em caligrafia cansa**: tire-a da script com `[data-phrase="true"]` (itálico da serifa, corpo menor, `--names-em`
  da serifa). Nome comprido ("Maximiliano Albuquerque") não é frase e continua na caligrafia. Use `data-words` para um corte
  mais fino (o Aquarela mantém frases de 4 e 5 palavras na script).
- **Nome curto como manchete**: `[data-short="true"]` (o Editorial multiplica o corpo por 1.6).

**Data da capa (`.inv-date`)**: grade de três colunas. O dia da semana e a hora (`.inv-date-side`) ladeiam o numeral
(`.inv-date-day`) e o mês (`.inv-date-month`) ocupa a linha de baixo inteira; `.inv-date-main` não gera caixa
(`display: contents`). Quem redesenha a data redefine `grid-column`/`grid-row` de cada parte. Laterais e mês nunca abaixo
de 14px (mínimo absoluto 13px), também a 320px: ali a coluna lateral tem cerca de 75px e precisa caber "domingo", "segunda"
e "às 20h30". Para caber, não encolha a letra: dentro de `@container (max-width: 300px)` reduza o espaçamento entre letras
das laterais (0.03 a 0.08em) e o `column-gap` da grade, como fazem os modelos que ladeiam o numeral.
**Evento sem horário**: `.inv-date` vem com `data-time="false"`, a lateral direita traz o ano (`.inv-date-alt`) e o ano da
linha do mês (`.inv-date-year`) é escondido pela base, para a composição continuar equilibrada (dia da semana | numeral |
ano, mês embaixo). O modelo que não ladeia o numeral faz o contrário (Festa, Moderno, Editorial, Monograma):
`.inv-date[data-time="false"] .inv-date-year { display: inline; }` e `.inv-date .inv-date-alt { display: none; }`.

**Seções e envelope**: `.inv-section .inv-kicker .inv-section-title .inv-big .inv-text .inv-btn .inv-btn-main .inv-btn-quiet`,
`.env .env-body .env-front .env-flap-face .env-liner .env-seal .env-to .env-cta`.

## Miniaturas

A miniatura (`TemplateThumb`, classe `.thumb`) é a capa de verdade, composta na largura de um celular (390px no padrão) e
reduzida por `transform`. A janela padrão tem 390 × 660; quando o cartão é mais alto que a janela, a capa inteira encolhe
(variável `--fit`) até caber, centrada, com o fundo do modelo em volta. Vale na galeria, na página inicial, no seletor de
modelos e nas prévias em moldura de celular, com qualquer nome e recado.

O ajuste tem dois passos. Primeiro, só com CSS (vale sem JavaScript e antes da hidratação): cada modelo declara no fim do
seu `style.css` a variável `--thumb-h`, a altura em px que a capa de exemplo ocupa (cartão mais os 28px de respiro da capa,
com a capa a 390px de largura), uma por tipo de evento:

```css
.inv[data-template="<id>"] { --thumb-h: 768px; }                                           /* o maior: vale para o resto */
.inv[data-template="<id>"]:has(.inv-cover[data-type="aniversario"]) { --thumb-h: 664px; }
```

A base divide a altura da janela por `--s × --thumb-h`. Depois, `ThumbFit` mede o cartão de verdade e grava `--fit` no
`.inv`, o que acerta o texto digitado no editor. Com a capa de exemplo os dois valores coincidem (diferença de até 0,003),
então a miniatura não nasce cortada nem salta. **Ao mexer em respiros, fontes ou ornamentos da capa, meça de novo**: abra
`/modelos` e `/modelos?tipo=<tipo>` e leia, em cada `.thumb`, `.inv-paper.offsetHeight` mais o `padding` vertical de
`.inv-cover`. Valor menor que o real corta o cartão sem JavaScript; maior, deixa a miniatura pequena até o `ThumbFit` rodar.

Por isso o modelo **não** escreve regras para "caber na miniatura": nada de apertar respiros, esconder a contagem ou citar
classes de fora (`.phone`, `.device`, `.preview-full`). Regra com `.thumb > .inv[data-template="<id>"]` só para o que não
existe na miniatura (um enfeite preso ao fim da página, por exemplo). Confira o resultado em `/modelos`.

## Regras

- Tamanhos relativos ao convite usam `cqw` (não `vw`), para as miniaturas ficarem fiéis.
- Texto corrido com 16px ou mais; informação essencial (data, hora, local) com contraste de 4.5:1 ou mais.
- Algarismos alinhados: fontes como Playfair e Cormorant SC trazem algarismos de texto por padrão ("16h3o"). O atalho `font:`
  zera `font-variant-numeric` e `font-feature-settings`, então `font-variant-numeric: lining-nums` tem de vir **depois** de
  cada `font:` (na mesma regra ou numa regra posterior). A base já força algarismos alinhados na capa, nas seções e no
  rodapé (com `!important`); o cuidado fica para o que o modelo estiliza fora disso (envelope, `::before` com texto).
- Script só nos nomes. Nunca aplique `letter-spacing` em script nem use o "&" da fonte script.
- Animar apenas `transform` e `opacity`, uma vez; respeitar `prefers-reduced-motion`.
- Testar com nomes curtos, longos e acentuados ("João & Conceição", "Maria Eduarda & Luiz Henrique", "Ângela & Érica") e com
  título único ("Sofia", "Maximiliano", "Helena faz 30", "Formatura de Direito — Turma 2026", "Chá revelação da Ana e do
  Pedro"), em 320px, 360px e 390px de largura, e em cada paleta. Na data, testar "domingo" e "quarta" (`data=2027-09-12` e
  `data=2027-09-08`).

## Ver um modelo

`/modelos/<id>?tipo=casamento&envelope=0` (sem o envelope) e `/modelos` (galeria). Parâmetros: `tipo`, `nomes`, `data`, `paleta`.

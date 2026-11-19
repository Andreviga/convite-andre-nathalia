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
aí a parte visível é o triângulo de baixo (0 100%, 100% 100%, 50% 42%). As iniciais do lacre usam a fonte dos nomes; ajuste em
`.env-seal` com `--seal-font`, `--seal-size`, `--seal-weight`, `--seal-style`. Camadas do envelope (z-index): cartão 1, frente 3,
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

O que a base já resolve, sem regra do modelo:

- **Palavra nunca é partida no meio.** Cada `.inv-name` encolhe (até 55%) para a maior palavra caber, usando `--longest` e
  `--names-em`. O modelo define o tamanho em `.inv-names` normalmente (`font-size: calc(var(--names-size) * 1.3)` para
  título único, por exemplo) e a base aplica o limite por cima. Não ponha `font-size` em `.inv-name`.
- **Partículas e travessão não ficam pendurados.** "de", "da", "do", "das", "dos" e "e" vêm colados à palavra seguinte por
  espaço não separável, e o travessão à palavra anterior (`glueTitle`): a quebra sai "Formatura de Direito — / Turma 2026".
- **`data-long`** reduz o corpo (78% no título único, 84% no casal).

O que cabe ao modelo:

- **Fonte caligráfica nos nomes**: os algarismos e o travessão dela ficam ruins ("30" parece "Zo"). Componha `.inv-num` na
  serifa do modelo, num corpo menor (a caligrafia tem maiúsculas baixas para o corpo):
  `.inv-names:not([data-phrase]) .inv-num { font-family: var(--font-text); font-size: 0.66em; }`.
- **Frase em caligrafia cansa**: tire-a da script com `[data-phrase="true"]` (itálico da serifa, corpo menor, `--names-em`
  da serifa). Nome comprido ("Maximiliano Albuquerque") não é frase e continua na caligrafia. Use `data-words` para um corte
  mais fino (o Aquarela mantém frases de 4 e 5 palavras na script).
- **Nome curto como manchete**: `[data-short="true"]` (o Editorial multiplica o corpo por 1.6).

**Data da capa (`.inv-date`)**: grade de três colunas. O dia da semana e a hora (`.inv-date-side`) ladeiam o numeral
(`.inv-date-day`) e o mês (`.inv-date-month`) ocupa a linha de baixo inteira; `.inv-date-main` não gera caixa
(`display: contents`). Quem redesenha a data redefine `grid-column`/`grid-row` de cada parte. Tamanho das laterais sempre
com `clamp(mínimo, N cqw, máximo)`: em 320px a coluna lateral tem cerca de 75px e precisa caber "domingo" e "às 20h30"
(com 13px e espaçamento de 0.12em cabe). Se ainda assim não couber, a lateral quebra em duas linhas em vez de vazar.

**Seções e envelope**: `.inv-section .inv-kicker .inv-section-title .inv-big .inv-text .inv-btn .inv-btn-main .inv-btn-quiet`,
`.env .env-body .env-front .env-flap-face .env-liner .env-seal .env-to .env-cta`.

## Miniaturas

A miniatura (`TemplateThumb`, classe `.thumb`) é a capa de verdade, composta na largura de um celular (390px no padrão) e
reduzida por `transform`. A janela padrão tem 390 × 660; quando o cartão é mais alto que a janela, `ThumbFit` mede e encolhe
a capa inteira (variável `--fit`) até caber, centrada, com o fundo do modelo em volta. Vale na galeria, na página inicial,
no seletor de modelos e nas prévias em moldura de celular, com qualquer nome e recado.

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

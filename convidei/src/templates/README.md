# Modelos de convite

Cada modelo é uma pasta `src/templates/<id>/` com dois arquivos:

- `index.tsx`: exporta `def: TemplateDef` (nome, descrição, paletas e o componente `Art` com os ornamentos em SVG).
- `style.css`: o visual. **Todas** as regras ficam sob `.inv[data-template="<id>"]`.

A estrutura (HTML) do convite é a mesma para todos e fica em `src/components/InviteCover.tsx` (capa) e `Invite.tsx` (seções).
O visual base está em `src/app/invite.css`. Um modelo só redefine variáveis e detalhes. `classico/` é o exemplo de referência.

## O que um modelo controla

**Variáveis** (em `.inv[data-template="<id>"]`): `--font-names`, `--font-text`, `--font-label`, `--names-size`, `--names-weight`,
`--names-leading`, `--names-tracking`, `--names-transform`, `--amp-scale`, `--label-tracking`, `--radius`, `--btn-radius`,
`--paper-pad`, `--frame-inset`, `--paper-shadow`.

**Cores**: vêm da paleta (`def.palettes`), como `--bg --paper --ink --soft --accent --line --btn-ink --seal --seal-ink --liner`.
Nunca escreva cor fixa no CSS para algo que deve mudar com a paleta; use as variáveis e `color-mix()`.

**Fontes disponíveis** (`src/lib/fonts.ts`): `--f-serif` (Cormorant Garamond), `--f-sc` (Cormorant SC), `--f-sans` (DM Sans),
`--f-pinyon`, `--f-parisienne`, `--f-italianno`, `--f-alex`, `--f-madi`, `--f-greatvibes`, `--f-playfair`, `--f-bodoni`,
`--f-cinzel`, `--f-jost`, `--f-fraunces`, `--f-dmserif`, `--f-marcellus`, `--f-poiret`, `--f-montserrat`.

**Ornamentos** (`Art({ slot, initials })`): `backdrop` (atrás de tudo, ocupa a página), `top`, `divider`, `bottom` (dentro do cartão)
e `liner` (forro do envelope, preenche 100%). Devolva `null` no que não usar. SVG com `currentColor`; ids de `<pattern>`/`<gradient>`
com o prefixo do modelo.

**Classes da capa**: `.inv-cover .inv-paper .inv-art-top .inv-monogram .inv-hello .inv-headline .inv-names .inv-name .inv-amp
.inv-message .inv-art-divider .inv-date (.inv-date-side .inv-date-main .inv-date-day .inv-date-month) .inv-dateline .inv-place
.inv-countdown .inv-art-bottom .inv-more`. O monograma e `.inv-dateline` vêm escondidos: ligue com `display` se o modelo usar.
`.inv-names` tem `data-count="2"` (casal: nome, conector, nome) ou `"1"` (título único, com `data-long` quando é comprido).

**Seções e envelope**: `.inv-section .inv-kicker .inv-section-title .inv-big .inv-text .inv-btn .inv-btn-main .inv-btn-quiet`,
`.env .env-body .env-front .env-flap-face .env-liner .env-seal .env-to .env-cta`.

## Regras

- Tamanhos relativos ao convite usam `cqw` (não `vw`), para as miniaturas ficarem fiéis.
- Texto corrido com 16px ou mais; informação essencial (data, hora, local) com contraste de 4.5:1 ou mais.
- Script só nos nomes. Nunca aplique `letter-spacing` em script nem use o "&" da fonte script.
- Animar apenas `transform` e `opacity`, uma vez; respeitar `prefers-reduced-motion`.
- Testar com nomes curtos, longos e acentuados ("João & Conceição", "Maria Eduarda & Luiz Henrique") e com título único
  ("Helena faz 30"), em 360px e 390px de largura, e em cada paleta.

## Ver um modelo

`/modelos/<id>?tipo=casamento&envelope=0` (sem o envelope) e `/modelos` (galeria). Parâmetros: `tipo`, `nomes`, `data`, `paleta`.

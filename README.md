# Convite digital — André & Nathália

Projeto estático premium (HTML/CSS/JS) pronto para publicação no GitHub Pages com o subdomínio `convite.andrenathalia03052026.site`.

## Arquivos na raiz

- `index.html`
- `styles.css`
- `script.js`
- `preview.jpg` (1200x630)
- `README.md`
- `CNAME`
- `robots.txt` (opcional para SEO)

## Publicação no GitHub Pages

1. Abra **Settings > Pages** no repositório.
2. Em **Build and deployment**, escolha:
   - **Source:** `Deploy from branch`
   - **Branch:** `main`
   - **Folder:** `/(root)`
3. Em **Custom domain**, informe:
   - `convite.andrenathalia03052026.site`
4. Salve (o projeto já tem arquivo `CNAME`).
5. Após propagação do DNS, habilite **Enforce HTTPS**.

## DNS (provedor do domínio)

Criar o seguinte registro:

- **Tipo:** `CNAME`
- **Host/Nome:** `convite`
- **Destino/Valor:** `<usuario>.github.io`

## Preview no WhatsApp

- URL final esperada: `https://convite.andrenathalia03052026.site/`
- OG image configurada: `https://convite.andrenathalia03052026.site/preview.jpg`
- Se o preview não atualizar na hora, reenvie com cache-buster:
  - `https://convite.andrenathalia03052026.site/?v=2`

## Comandos Git (referência rápida)

```bash
git add .
git commit -m "Upgrade convite premium + OG preview + GitHub Pages"
git push origin main
```


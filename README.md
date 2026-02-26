# Convite digital — André & Nathália

Projeto estático (HTML/CSS/JS) pronto para publicar no GitHub Pages com domínio personalizado `convite.andrenathalia03052026.site`.

## Estrutura do projeto

- `index.html`
- `styles.css`
- `script.js`
- `preview.jpg`
- `robots.txt`

## Publicação no GitHub Pages (passo a passo)

1. **Criar repositório no GitHub**
   - Exemplo: `convite-andre-nathalia`.

2. **Subir os arquivos do projeto**
   - Faça commit de `index.html`, `styles.css`, `script.js`, `preview.jpg`, `robots.txt` e `README.md`.

3. **Ativar o GitHub Pages**
   - Acesse `Settings` > `Pages`.
   - Em `Build and deployment`, escolha:
     - **Source:** `Deploy from branch`
     - **Branch:** `main`
     - **Folder:** `/(root)`

4. **Configurar domínio customizado**
   - No campo `Custom domain`, informe: `convite.andrenathalia03052026.site`.
   - Salve. O GitHub criará (ou atualizará) o arquivo `CNAME` automaticamente.

5. **Configurar DNS no provedor do domínio**
   - **Subdomínio convite**
     - Tipo: `CNAME`
     - Host/Nome: `convite`
     - Destino/Valor: `<usuario>.github.io`
   - **Apex (@), se necessário**
     - `A` → `185.199.108.153`
     - `A` → `185.199.109.153`
     - `A` → `185.199.110.153`
     - `A` → `185.199.111.153`

6. **Ativar HTTPS**
   - Após propagação do DNS, habilite `Enforce HTTPS` em `Settings` > `Pages`.

7. **Testar preview no WhatsApp**
   - Envie o link `https://convite.andrenathalia03052026.site/` no WhatsApp.
   - Verifique se aparece o card com título/descrição/imagem.
   - Se não atualizar, reenvie com cache-buster, por exemplo:
     - `https://convite.andrenathalia03052026.site/?v=2`

## Observações

- O `og:image` no HTML já aponta para:
  - `https://convite.andrenathalia03052026.site/preview.jpg`
- O preview só aparece corretamente após o site estar publicado nesse domínio.

## Comandos Git para publicar no GitHub

Após criar o repositório remoto no GitHub, execute no terminal:

```bash
git init
git add .
git commit -m "Publica convite digital"
git branch -M main
git remote add origin https://github.com/<usuario>/<repositorio>.git
git push -u origin main
```

> Se o repositório já estiver inicializado, pule `git init` e ajuste apenas `remote`/`push`.


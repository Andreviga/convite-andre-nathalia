# Convidei

Gerador de convites digitais em link, com confirmação de presença, lista de convidados, presentes e Pix.
("Convidei" é um nome provisório: troque em `src/lib/brand.ts`.)

## O que já funciona

- Página de venda, cadastro e login (e-mail e senha).
- Criar e editar convite: 6 tipos de evento, 7 modelos (2 Premium), data, local, traje, prazo de confirmação.
- Convite público em `/c/<endereço>`: abre igual em qualquer celular, com prévia para o WhatsApp,
  botões de mapa e agenda (Google e iPhone), confirmação de presença, links de presentes e Pix (QR code e copia e cola).
- Link individual por convidado ou família (`/c/<endereço>/<código>`): registra quem abriu e quem confirmou.
- Painel do anfitrião: números do evento, envio pelo WhatsApp com mensagem pronta, importação em lote, planilha (CSV).
- Plano grátis (30 convites, selo no rodapé) e Premium por evento. Regras e preço em `src/lib/plans.ts`.

## O que falta

- **Pagamento do Premium.** O botão "Quero o Premium" só registra o interesse (`events.upgrade_requested_at`).
  Para liberar um evento manualmente: `update events set plan = 'premium' where id = '...'`.
- Recuperação de senha e verificação de e-mail (precisam de um serviço de envio de e-mail).
- Limite de tentativas no login e nas confirmações (proteção contra abuso).
- Termos de uso e política de privacidade (LGPD): o app guarda nome e celular de convidados.

## Rodar no computador

```bash
npm install
npm run dev
```

Sem `DATABASE_URL`, o app usa um Postgres embutido que grava em `.data/` (só para desenvolvimento).

```bash
npm test
npm run typecheck
```

## Publicar (Vercel + Neon)

1. Crie um banco no Neon e copie a connection string.
2. Na Vercel, crie um projeto apontando para este repositório com **Root Directory = `convidei`**.
3. Defina `DATABASE_URL` e, de preferência, `NEXT_PUBLIC_APP_URL` (ex.: `https://seudominio.com.br`).
4. As tabelas são criadas sozinhas no primeiro acesso (`src/lib/schema.ts`).

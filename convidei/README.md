# Convidei

Gerador de convites digitais em link, com confirmação de presença, lista de convidados, presentes e Pix.
## O que já funciona

- Página de venda, cadastro e login (e-mail e senha).
- Criar e editar convite: 6 tipos de evento, 7 modelos (2 Premium), data, local, traje, prazo de confirmação.
- Convite público em `/c/<endereço>`: abre igual em qualquer celular, com prévia para o WhatsApp,
  botões de mapa e agenda (Google e iPhone), confirmação de presença, links de presentes e Pix (QR code e copia e cola).
- Link individual por convidado ou família (`/c/<endereço>/<código>`): registra quem abriu e quem confirmou.
- Painel do anfitrião: números do evento, envio pelo WhatsApp com mensagem pronta, importação em lote, planilha (CSV).
- Plano grátis (30 convites, selo no rodapé) e Premium por evento. Regras e preço em `src/lib/plans.ts`.
- Pagamento do Premium pelo Mercado Pago (Checkout Pro: Pix, cartão, boleto). Veja "Mercado Pago" abaixo.

## O que falta

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

## Mercado Pago

O Premium é cobrado pelo Checkout Pro. Sem a chave configurada, o botão só registra o interesse (`events.upgrade_requested_at`).

1. No painel de desenvolvedores do Mercado Pago, crie uma aplicação e copie o **Access Token** (use o de teste primeiro).
2. Na Vercel, em Settings → Environment Variables do projeto, crie `MERCADOPAGO_ACCESS_TOKEN` e faça um novo deploy.
3. Na aplicação do Mercado Pago, em Webhooks, cadastre `https://<seu-endereço>/api/mercadopago` com o evento **Pagamentos**,
   copie a **assinatura secreta** e salve em `MERCADOPAGO_WEBHOOK_SECRET`.

Como funciona: o app cria a cobrança com o id do evento em `external_reference`. Ao voltar do checkout e a cada aviso recebido,
ele busca o pagamento direto na API do Mercado Pago e só libera o Premium se estiver aprovado, em reais e no valor cheio.
Estorno ou chargeback devolvem o evento ao plano grátis. Os pagamentos ficam na tabela `payments`.

Para liberar um evento manualmente: `update events set plan = 'premium' where id = '...'`.

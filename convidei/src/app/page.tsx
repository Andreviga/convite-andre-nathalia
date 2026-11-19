import Link from "next/link";
import { Ornament } from "@/components/Ornament";
import { currentUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { EVENT_TYPES } from "@/lib/catalog";
import { FREE_GUEST_LIMIT, PREMIUM_PRICE, PREMIUM_PRICE_NOTE } from "@/lib/plans";
import "./invite.css";

export default async function Home() {
  const user = await currentUser();
  const start = user ? "/painel" : "/criar-conta";

  return (
    <>
      <header className="wrap top">
        <Link href="/" className="logo">
          {BRAND}
          <span>.</span>
        </Link>
        <nav aria-label="Conta">
          {user ? (
            <Link href="/painel" className="btn btn-sm btn-primary">
              Meus convites
            </Link>
          ) : (
            <>
              <Link href="/entrar" className="btn btn-sm btn-ghost">
                Entrar
              </Link>
              <Link href="/criar-conta" className="btn btn-sm btn-primary">
                Criar convite
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="wrap hero">
          <div>
            <p className="eyebrow">Convite digital com confirmação de presença</p>
            <h1>
              Chega de convite em PDF que <em>ninguém consegue abrir.</em>
            </h1>
            <p className="hero-lead">
              Crie um convite em link: abre igual em qualquer celular, o convidado confirma com um toque e você vê na hora quem abriu, quem vai e quem ainda
              não respondeu.
            </p>
            <div className="hero-cta">
              <Link href={start} className="btn btn-primary btn-lg">
                Criar meu convite grátis
              </Link>
              <a href="#como-funciona" className="btn btn-lg btn-ghost">
                Como funciona
              </a>
            </div>
            <p className="hero-note">Grátis para até {FREE_GUEST_LIMIT} convites. Sem cartão de crédito.</p>
          </div>

          <div className="phone" aria-hidden="true">
            <div className="phone-screen">
              <div className="inv" data-template="botanico">
                <div className="inv-sheet">
                  <div className="inv-hero">
                    <Ornament template="botanico" position="top" />
                    <p className="inv-hello">Olá, Família Oliveira</p>
                    <p className="inv-headline">Com a bênção de nossas famílias</p>
                    <p className="inv-title">Marina &amp; Rafael</p>
                    <p className="inv-message">convidam para a celebração de seu casamento</p>
                    <div className="inv-date">
                      <span className="inv-date-side">sábado</span>
                      <span className="inv-date-main">
                        <span className="inv-date-day">11</span>
                        <span className="inv-date-month">setembro · 2027</span>
                      </span>
                      <span className="inv-date-side">às 16h</span>
                    </div>
                  </div>
                  <div className="inv-card">
                    <p className="inv-section-title">Confirme sua presença</p>
                    <p className="inv-hint">Este convite vale para até 4 pessoas.</p>
                    <div className="rsvp-form">
                      <div className="rsvp-choice">
                        <label className="is-on">Vou sim</label>
                        <label>Não poderei ir</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="phone-fade" />
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="wrap">
            <h2>O PDF fica bonito. O problema é tudo o que vem depois.</h2>
            <div className="versus">
              <div className="bad">
                <h3>Convite em PDF ou imagem</h3>
                <ul>
                  <li>Cada celular abre de um jeito, e os links nem sempre funcionam</li>
                  <li>Você não sabe quem recebeu nem quem abriu</li>
                  <li>Confirmação por mensagem, anotada à mão numa planilha</li>
                  <li>O link da lista de presentes se perde na conversa</li>
                  <li>Mudou o horário? Tem que reenviar para todo mundo</li>
                </ul>
              </div>
              <div className="good">
                <h3>Convite em link do {BRAND}</h3>
                <ul>
                  <li>Abre igual no iPhone, no Android e no computador</li>
                  <li>Cada convidado tem o próprio link: você vê quem abriu</li>
                  <li>Confirmação com um toque, somada sozinha no seu painel</li>
                  <li>Presentes, Pix, mapa e agenda no mesmo lugar</li>
                  <li>Mudou algo? Você edita e o link continua o mesmo</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="como-funciona">
          <div className="wrap">
            <h2>Do zero ao convite enviado em poucos minutos</h2>
            <div className="features">
              <div>
                <span className="num">1</span>
                <h3>Escolha o evento e o modelo</h3>
                <p>Preencha nomes, data, local e traje. O convite fica pronto com o visual que você escolher.</p>
              </div>
              <div>
                <span className="num">2</span>
                <h3>Monte a lista de convidados</h3>
                <p>Um convite por pessoa ou por família, com o número de lugares. Dá para colar a lista inteira de uma vez.</p>
              </div>
              <div>
                <span className="num">3</span>
                <h3>Envie pelo WhatsApp</h3>
                <p>Um botão abre a conversa com a mensagem e o link de cada convidado prontos. O link chega com uma prévia bonita.</p>
              </div>
              <div>
                <span className="num">4</span>
                <h3>Acompanhe as respostas</h3>
                <p>Veja quem abriu, quem confirmou, quantas pessoas vêm e as restrições alimentares. Exporte tudo para o buffet.</p>
              </div>
              <div>
                <span className="num">5</span>
                <h3>Receba os presentes</h3>
                <p>Coloque os links das suas listas e a sua chave Pix. O dinheiro vai direto para a sua conta, sem taxa.</p>
              </div>
              <div>
                <span className="num">6</span>
                <h3>Ninguém se perde</h3>
                <p>Botões de como chegar e de salvar na agenda, para o convidado não esquecer a data nem o caminho.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-alt">
          <div className="wrap">
            <h2>Para todo tipo de festa</h2>
            <p className="section-lead">Cada tipo de evento já vem com texto e modelo sugeridos. Você muda o que quiser.</p>
            <div className="types">
              {EVENT_TYPES.map((type) => (
                <span key={type.id}>
                  {type.emoji} {type.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="precos">
          <div className="wrap">
            <h2>Comece grátis. Pague só se a festa crescer.</h2>
            <div className="prices">
              <div className="price">
                <h3>Grátis</h3>
                <p className="price-value">
                  R$ 0<small>para sempre</small>
                </p>
                <ul>
                  <li>Até {FREE_GUEST_LIMIT} convites por evento</li>
                  <li>Confirmação de presença e painel</li>
                  <li>Links de presentes e Pix</li>
                  <li>5 modelos</li>
                  <li>Selo “feito com {BRAND}” no rodapé</li>
                </ul>
                <Link href={start} className="btn">
                  Começar grátis
                </Link>
              </div>
              <div className="price price-best">
                <h3>Premium</h3>
                <p className="price-value">
                  {PREMIUM_PRICE}
                  <small>{PREMIUM_PRICE_NOTE}</small>
                </p>
                <ul>
                  <li>Convites ilimitados</li>
                  <li>Todos os modelos, incluindo os exclusivos</li>
                  <li>Convite sem o selo do {BRAND}</li>
                  <li>Tudo do plano grátis</li>
                </ul>
                <Link href={start} className="btn btn-primary">
                  Criar meu convite
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="wrap final">
          <h2 className="page-title">Seu convite pode estar pronto ainda hoje.</h2>
          <div className="hero-cta">
            <Link href={start} className="btn btn-primary btn-lg">
              Criar meu convite grátis
            </Link>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          {BRAND} · convites digitais com confirmação de presença
        </div>
      </footer>
    </>
  );
}

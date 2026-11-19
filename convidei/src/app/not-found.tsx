import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth">
      <div className="auth-box" style={{ textAlign: "center" }}>
        <h1>Não encontramos esta página</h1>
        <p className="muted" style={{ margin: "8px 0 20px" }}>
          Se você recebeu um convite, confira se o link está completo ou peça para quem convidou enviar de novo.
        </p>
        <Link href="/" className="btn">
          Ir para o início
        </Link>
      </div>
    </main>
  );
}

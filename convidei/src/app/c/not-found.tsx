// Convite que não existe (link errado ou evento apagado): texto para convidado, sem empurrar para a página de vendas.
export default function InviteNotFound() {
  return (
    <main className="auth">
      <div className="auth-box" style={{ display: "grid", gap: 14, justifyItems: "center", textAlign: "center", fontSize: 17, lineHeight: 1.5 }}>
        <h1>Não encontramos este convite</h1>
        <p className="muted">O link pode ter chegado incompleto, ou o convite não está mais no ar.</p>
        <p className="muted">
          Volte à mensagem que você recebeu e toque no link de novo. Se não abrir, peça a quem convidou você para enviar outra vez.
        </p>
      </div>
    </main>
  );
}

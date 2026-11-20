"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type FormState } from "@/app/actions";

/** `fromGallery`: a pessoa chegou por "Usar este modelo"; a marca segue no formulário e nos links para o rascunho valer só nesse caminho. */
export function AuthForm({ mode, fromGallery = false }: { mode: "entrar" | "criar"; fromGallery?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "criar" ? signUp : signIn, {});
  const v = state.values ?? {};
  const mark = fromGallery ? "?rascunho=1" : "";
  return (
    <form action={action} className="panel stack">
      {fromGallery ? <input type="hidden" name="rascunho" value="1" /> : null}
      {mode === "criar" ? (
        <label className="field">
          <span>Seu nome</span>
          <input type="text" name="name" required minLength={2} maxLength={80} autoComplete="name" defaultValue={v.name} />
        </label>
      ) : null}
      <label className="field">
        <span>E-mail</span>
        <input type="email" name="email" required maxLength={160} autoComplete="email" defaultValue={v.email} />
      </label>
      <label className="field">
        <span>Senha {mode === "criar" ? <small>(mínimo de 8 caracteres)</small> : null}</span>
        <input type="password" name="password" required minLength={mode === "criar" ? 8 : 1} maxLength={200} autoComplete={mode === "criar" ? "new-password" : "current-password"} />
      </label>
      {state.error ? (
        <p className="alert alert-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Um instante…" : mode === "criar" ? "Criar conta e começar" : "Entrar"}
      </button>
      <p className="auth-alt">
        {mode === "criar" ? (
          <>
            Já tem conta? <Link href={`/entrar${mark}`} className="link">Entrar</Link>
          </>
        ) : (
          <>
            Ainda não tem conta? <Link href={`/criar-conta${mark}`} className="link">Criar grátis</Link>
          </>
        )}
      </p>
    </form>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { currentUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { DRAFT_PARAM } from "@/lib/draft";

export const metadata: Metadata = { title: "Entrar" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (await currentUser()) redirect("/painel");
  return (
    <main className="auth">
      <div className="auth-box">
        <Link href="/" className="logo">
          {BRAND}
          <span>.</span>
        </Link>
        <h1>Entrar</h1>
        <p className="muted" style={{ marginBottom: 16 }}>
          Que bom ver você de novo.
        </p>
        <AuthForm mode="entrar" fromGallery={(await searchParams)[DRAFT_PARAM] === "1"} />
      </div>
    </main>
  );
}

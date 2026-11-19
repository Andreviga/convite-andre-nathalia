import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Meus convites", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <header className="wrap top">
        <Link href="/painel" className="logo">
          {BRAND}
          <span>.</span>
        </Link>
        <nav aria-label="Conta">
          <span className="muted sr-only">{user.name}</span>
          <form action={signOut}>
            <button type="submit" className="btn btn-sm btn-ghost">
              Sair
            </button>
          </form>
        </nav>
      </header>
      <main className="wrap dash">{children}</main>
    </>
  );
}

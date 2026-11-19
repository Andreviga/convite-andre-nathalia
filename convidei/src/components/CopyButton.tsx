"use client";

import { useState } from "react";

async function copy(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* cai para o método antigo */
  }
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

export function CopyButton({ value, label, done = "Copiado!", className }: { value: string; label: string; done?: string; className?: string }) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        setState((await copy(value)) ? "ok" : "fail");
        window.setTimeout(() => setState("idle"), 2200);
      }}
    >
      <span aria-live="polite">{state === "ok" ? done : state === "fail" ? "Não deu para copiar" : label}</span>
    </button>
  );
}

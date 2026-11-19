import { revalidatePath } from "next/cache";
import { mercadoPagoEnabled, validSignature } from "@/lib/mercadopago";
import { syncPayment } from "@/lib/payments";

// Aviso de pagamento do Mercado Pago (webhook).
export async function POST(request: Request) {
  if (!mercadoPagoEnabled()) return new Response("Pagamento não configurado.", { status: 503 });

  const url = new URL(request.url);
  const body = (await request.json().catch(() => null)) as { type?: string; data?: { id?: string | number } } | null;
  const type = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? body?.type ?? "";
  const dataId = String(url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? body?.data?.id ?? "");
  if (type !== "payment" || !/^\d{1,30}$/.test(dataId)) return new Response("ignorado", { status: 200 });

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (secret && !validSignature(secret, request.headers.get("x-signature"), request.headers.get("x-request-id"), dataId)) {
    return new Response("Assinatura inválida.", { status: 401 });
  }

  try {
    await syncPayment(dataId);
    revalidatePath("/painel", "layout");
  } catch (error) {
    console.error("Falha ao processar aviso do Mercado Pago", error);
    return new Response("Tente de novo.", { status: 500 }); // o Mercado Pago reenvia
  }
  return new Response("ok", { status: 200 });
}

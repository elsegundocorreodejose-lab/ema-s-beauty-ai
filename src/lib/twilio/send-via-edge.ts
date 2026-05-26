import { getRequest } from "@tanstack/react-start/server";

export async function sendWhatsAppViaEdgeFunction(data: {
  phoneNumber: string;
  body: string;
}): Promise<{ ok: true; messageSid: string }> {
  const base = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)?.replace(
    /\/$/,
    "",
  );
  if (!base) {
    throw new Error("Falta SUPABASE_URL en el servidor.");
  }

  const request = getRequest();
  const auth = request?.headers.get("authorization");
  if (!auth) {
    throw new Error("No autorizado: inicia sesión de nuevo.");
  }

  const res = await fetch(`${base}/functions/v1/whatsapp-send`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumber: data.phoneNumber,
      body: data.body,
    }),
  });

  const text = await res.text();
  let parsed: { error?: string; ok?: boolean; messageSid?: string } = {};
  try {
    parsed = JSON.parse(text) as typeof parsed;
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    throw new Error(
      parsed.error ?? `No se pudo enviar el mensaje (${res.status}). ¿Está desplegada whatsapp-send?`,
    );
  }

  if (!parsed.ok || !parsed.messageSid) {
    throw new Error("Respuesta inesperada del servidor de envío.");
  }

  return { ok: true, messageSid: parsed.messageSid };
}

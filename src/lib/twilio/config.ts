export type TwilioConfig = {
  accountSid: string;
  authToken: string;
  whatsappFrom: string;
  webhookPublicUrl: string;
  autoReplyMessage: string | null;
};

function envValue(name: string): string | undefined {
  const raw = process.env[name]?.trim();
  if (!raw || raw.startsWith("REEMPLAZA_")) return undefined;
  return raw;
}

/** Credenciales para enviar mensajes (no requiere URL pública). */
export function getTwilioSendConfig(): Pick<
  TwilioConfig,
  "accountSid" | "authToken" | "whatsappFrom"
> | null {
  const accountSid = envValue("TWILIO_ACCOUNT_SID");
  const authToken = envValue("TWILIO_AUTH_TOKEN");
  const whatsappFrom =
    envValue("TWILIO_WHATSAPP_FROM") ?? envValue("TWILIO_WHATSAPP_NUMBER");

  if (!accountSid || !authToken || !whatsappFrom) {
    return null;
  }

  return {
    accountSid,
    authToken,
    whatsappFrom: normalizeWhatsAppFrom(whatsappFrom),
  };
}

export function getTwilioConfig(): TwilioConfig | null {
  const send = getTwilioSendConfig();
  const publicBase =
    envValue("TWILIO_WEBHOOK_PUBLIC_URL") ??
    envValue("PUBLIC_APP_URL") ??
    envValue("VITE_PUBLIC_APP_URL");

  if (!send || !publicBase) {
    return null;
  }

  const { accountSid, authToken, whatsappFrom } = send;

  const webhookPublicUrl = publicBase.replace(/\/$/, "") + "/api/webhooks/twilio";
  const autoReply = process.env.TWILIO_AUTO_REPLY_MESSAGE?.trim() || null;

  return {
    accountSid,
    authToken,
    whatsappFrom,
    webhookPublicUrl,
    autoReplyMessage: autoReply,
  };
}

/** Envío directo desde el servidor Node (variables TWILIO_* en .env). */
export function isTwilioConfigured(): boolean {
  return getTwilioSendConfig() !== null;
}

export function canSendViaEdgeFunction(): boolean {
  return Boolean(
    (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)?.trim(),
  );
}

export function normalizeWhatsAppFrom(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("whatsapp:")) return trimmed;
  if (trimmed.startsWith("+")) return `whatsapp:${trimmed}`;
  return `whatsapp:+${trimmed.replace(/\D/g, "")}`;
}

export function normalizeWhatsAppTo(value: string): string {
  return normalizeWhatsAppFrom(value);
}

/** Twilio signature validation and WhatsApp send (Deno / Edge Functions). */

const DEFAULT_WEBHOOK_URL =
  "https://bklnaeftoztcahfgxchl.supabase.co/functions/v1/whatsapp-webhook";

function bytesToBase64(bytes: Uint8Array): string {
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function normalizeWebhookUrl(url: string): string {
  return url.trim().replace(/\/$/, "");
}

export function buildWebhookUrlCandidates(request: Request): string[] {
  const seen = new Set<string>();
  const add = (raw: string | null | undefined) => {
    if (!raw?.trim()) return;
    const n = normalizeWebhookUrl(raw);
    if (!seen.has(n)) seen.add(n);
  };

  add(Deno.env.get("TWILIO_WEBHOOK_PUBLIC_URL"));
  add(DEFAULT_WEBHOOK_URL);

  const url = new URL(request.url);
  add(`${url.origin}${url.pathname}${url.search}`);
  add(`${url.origin}${url.pathname}`);
  add(`${url.origin}${url.pathname}/`);
  add(request.url.split("#")[0]);

  return [...seen];
}

export async function validateTwilioSignature(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>,
): Promise<boolean> {
  const token = authToken.trim();
  if (!signature || !token) return false;

  const sortedKeys = Object.keys(params).sort();
  // Usar la URL tal cual (Twilio firma la URL exacta del sandbox, a veces con / final).
  let payload = url.trim();
  for (const key of sortedKeys) {
    payload += key + params[key];
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(token),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expected = bytesToBase64(new Uint8Array(mac));

  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return mismatch === 0;
}

/** Prueba varias URLs (Twilio firma la URL exacta del sandbox). */
async function validateWithUrlVariants(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>,
): Promise<boolean> {
  const trimmed = url.trim();
  const variants = [normalizeWebhookUrl(trimmed), trimmed, trimmed.endsWith("/") ? trimmed : `${trimmed}/`];
  const seen = new Set<string>();
  for (const u of variants) {
    if (seen.has(u)) continue;
    seen.add(u);
    if (await validateTwilioSignature(authToken, signature, u, params)) return true;
  }
  return false;
}

export async function validateTwilioRequest(
  authToken: string,
  signature: string,
  request: Request,
  params: Record<string, string>,
): Promise<{ valid: boolean; matchedUrl: string | null }> {
  for (const url of buildWebhookUrlCandidates(request)) {
    if (await validateWithUrlVariants(authToken, signature, url, params)) {
      return { valid: true, matchedUrl: url };
    }
  }
  return { valid: false, matchedUrl: null };
}

export function normalizeWhatsAppAddress(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("whatsapp:")) return trimmed;
  if (trimmed.startsWith("+")) return `whatsapp:${trimmed}`;
  return `whatsapp:+${trimmed.replace(/\D/g, "")}`;
}

export async function sendTwilioWhatsAppMessage(options: {
  accountSid: string;
  authToken: string;
  from: string;
  to: string;
  body: string;
}): Promise<{ sid: string }> {
  const form = new URLSearchParams({
    From: normalizeWhatsAppAddress(options.from),
    To: normalizeWhatsAppAddress(options.to),
    Body: options.body,
  });

  const credentials = btoa(`${options.accountSid}:${options.authToken}`);
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${options.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Twilio send failed (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as { sid: string };
  return { sid: data.sid };
}

export function twimlEmpty(): Response {
  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

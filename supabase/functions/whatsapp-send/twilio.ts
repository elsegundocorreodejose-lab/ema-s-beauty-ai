/** Envío WhatsApp vía API REST de Twilio (Edge Function). */

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

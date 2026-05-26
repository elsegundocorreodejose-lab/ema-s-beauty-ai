import twilio from "twilio";
import { getTwilioConfig } from "./config";
import { sendWhatsAppMessage } from "./send";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function twimlEmpty(): Response {
  return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

export async function handleTwilioWebhookRequest(request: Request): Promise<Response> {
  const config = getTwilioConfig();
  if (!config) {
    console.error("[Twilio] Webhook called but Twilio is not configured");
    return new Response("Twilio not configured", { status: 503 });
  }

  const signature = request.headers.get("X-Twilio-Signature") ?? "";
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = String(value);
  });

  const valid = twilio.validateRequest(
    config.authToken,
    signature,
    config.webhookPublicUrl,
    params,
  );

  if (!valid) {
    console.error("[Twilio] Invalid webhook signature");
    return new Response("Forbidden", { status: 403 });
  }

  const from = params.From?.trim();
  const body = params.Body?.trim() ?? "";
  const messageSid = params.MessageSid?.trim();

  if (!from) {
    return twimlEmpty();
  }

  if (messageSid) {
    const { data: existing } = await supabaseAdmin
      .from("messages")
      .select("id")
      .eq("twilio_message_sid", messageSid)
      .maybeSingle();

    if (existing) {
      return twimlEmpty();
    }
  }

  const { error: insertError } = await supabaseAdmin.from("messages").insert({
    phone_number: from,
    message_content: body || "(mensaje sin texto)",
    sender: "usuario",
    twilio_message_sid: messageSid ?? null,
  });

  if (insertError) {
    console.error("[Twilio] Failed to save inbound message:", insertError.message);
    return new Response("Database error", { status: 500 });
  }

  if (config.autoReplyMessage) {
    try {
      await sendWhatsAppMessage({
        to: from,
        body: config.autoReplyMessage,
        saveAsEma: true,
      });
    } catch (err) {
      console.error("[Twilio] Auto-reply failed:", err);
    }
  }

  return twimlEmpty();
}

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  sendTwilioWhatsAppMessage,
  twimlEmpty,
  validateTwilioRequest,
} from "./twilio.ts";

function getConfig(request: Request) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")?.trim();
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")?.trim();
  const whatsappFrom = (
    Deno.env.get("TWILIO_WHATSAPP_FROM") ?? Deno.env.get("TWILIO_WHATSAPP_NUMBER")
  )?.trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const autoReply = Deno.env.get("TWILIO_AUTO_REPLY_MESSAGE")?.trim() || null;

  if (!accountSid || !authToken || !whatsappFrom || !supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return {
    accountSid,
    authToken,
    whatsappFrom,
    autoReplyMessage: autoReply,
    supabase: createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const config = getConfig(request);
  if (!config) {
    console.error("[whatsapp-webhook] Missing Twilio or Supabase env secrets");
    return new Response("Twilio not configured", { status: 503 });
  }

  const signature = request.headers.get("X-Twilio-Signature") ?? "";
  const formData = await request.formData();
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = String(value);
  });

  const { valid, matchedUrl } = await validateTwilioRequest(
    config.authToken,
    signature,
    request,
    params,
  );

  if (!valid) {
    console.error("[whatsapp-webhook] Invalid Twilio signature (check Auth Token and webhook URL in Console)");
    return new Response("Forbidden", { status: 403 });
  }

  if (matchedUrl) {
    console.log("[whatsapp-webhook] Signature OK for URL:", matchedUrl);
  }

  const from = params.From?.trim();
  const body = params.Body?.trim() ?? "";
  const messageSid = params.MessageSid?.trim();

  if (!from) {
    return twimlEmpty();
  }

  if (messageSid) {
    const { data: existing } = await config.supabase
      .from("messages")
      .select("id")
      .eq("twilio_message_sid", messageSid)
      .maybeSingle();

    if (existing) {
      return twimlEmpty();
    }
  }

  const { error: insertError } = await config.supabase.from("messages").insert({
    phone_number: from,
    message_content: body || "(mensaje sin texto)",
    sender: "usuario",
    twilio_message_sid: messageSid ?? null,
  });

  if (insertError) {
    console.error("[whatsapp-webhook] DB insert failed:", insertError.message);
    return new Response("Database error", { status: 500 });
  }

  if (config.autoReplyMessage) {
    try {
      const { sid } = await sendTwilioWhatsAppMessage({
        accountSid: config.accountSid,
        authToken: config.authToken,
        from: config.whatsappFrom,
        to: from,
        body: config.autoReplyMessage,
      });
      await config.supabase.from("messages").insert({
        phone_number: from,
        message_content: config.autoReplyMessage,
        sender: "ema",
        twilio_message_sid: sid,
      });
    } catch (err) {
      console.error("[whatsapp-webhook] Auto-reply failed:", err);
    }
  }

  return twimlEmpty();
});

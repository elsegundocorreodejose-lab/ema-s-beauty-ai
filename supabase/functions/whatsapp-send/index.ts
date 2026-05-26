import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  normalizeWhatsAppAddress,
  sendTwilioWhatsAppMessage,
} from "./twilio.ts";

function getTwilioConfig() {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")?.trim();
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")?.trim();
  const whatsappFrom = (
    Deno.env.get("TWILIO_WHATSAPP_FROM") ?? Deno.env.get("TWILIO_WHATSAPP_NUMBER")
  )?.trim();
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!accountSid || !authToken || !whatsappFrom || !supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return {
    accountSid,
    authToken,
    whatsappFrom,
    supabase: createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const config = getTwilioConfig();
  if (!config) {
    return Response.json(
      { error: "Twilio no configurado en secrets de Supabase" },
      { status: 503 },
    );
  }

  let payload: { phoneNumber?: string; body?: string };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const phoneNumber = payload.phoneNumber?.trim();
  const body = payload.body?.trim();

  if (!phoneNumber || phoneNumber.length < 8) {
    return Response.json({ error: "Número inválido" }, { status: 400 });
  }
  if (!body) {
    return Response.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  const to = normalizeWhatsAppAddress(phoneNumber);

  try {
    const { sid } = await sendTwilioWhatsAppMessage({
      accountSid: config.accountSid,
      authToken: config.authToken,
      from: config.whatsappFrom,
      to,
      body,
    });

    const { error: insertError } = await config.supabase.from("messages").insert({
      phone_number: to,
      message_content: body,
      sender: "ema",
      twilio_message_sid: sid,
    });

    if (insertError) {
      console.error("[whatsapp-send] DB insert failed:", insertError.message);
      return Response.json(
        { error: "Enviado a Twilio pero falló guardar en base de datos" },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, messageSid: sid });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al enviar";
    console.error("[whatsapp-send]", message);
    return Response.json({ error: message }, { status: 502 });
  }
});

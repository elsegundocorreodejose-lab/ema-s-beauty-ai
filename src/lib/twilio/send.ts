import twilio from "twilio";
import { getTwilioSendConfig, normalizeWhatsAppTo } from "./config";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function sendWhatsAppMessage(options: {
  to: string;
  body: string;
  saveAsEma?: boolean;
}): Promise<{ sid: string }> {
  const config = getTwilioSendConfig();
  if (!config) {
    throw new Error(
      "Twilio no está configurado. Define TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_WHATSAPP_FROM en .env",
    );
  }

  const client = twilio(config.accountSid, config.authToken);
  const to = normalizeWhatsAppTo(options.to);

  const message = await client.messages.create({
    from: config.whatsappFrom,
    to,
    body: options.body,
  });

  if (options.saveAsEma !== false) {
    const { error } = await supabaseAdmin.from("messages").insert({
      phone_number: to,
      message_content: options.body,
      sender: "ema",
      twilio_message_sid: message.sid,
    });
    if (error) {
      console.error("[Twilio] Message sent but DB insert failed:", error.message);
    }
  }

  return { sid: message.sid };
}

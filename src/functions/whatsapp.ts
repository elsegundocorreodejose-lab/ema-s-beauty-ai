import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendWhatsAppMessage } from "@/lib/twilio/send";
import { sendWhatsAppViaEdgeFunction } from "@/lib/twilio/send-via-edge";
import { canSendViaEdgeFunction, isTwilioConfigured } from "@/lib/twilio/config";

const sendSchema = z.object({
  phoneNumber: z.string().trim().min(8, "Número inválido").max(40),
  body: z.string().trim().min(1, "Escribe un mensaje").max(4096),
});

export const sendWhatsAppReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => sendSchema.parse(data))
  .handler(async ({ data }) => {
    if (isTwilioConfigured()) {
      const { sid } = await sendWhatsAppMessage({
        to: data.phoneNumber,
        body: data.body,
        saveAsEma: true,
      });
      return { ok: true as const, messageSid: sid };
    }

    if (canSendViaEdgeFunction()) {
      return sendWhatsAppViaEdgeFunction({
        phoneNumber: data.phoneNumber,
        body: data.body,
      });
    }

    throw new Error(
      "No se puede enviar: pon TWILIO_* en .env o despliega la Edge Function whatsapp-send en Supabase.",
    );
  });

export const getTwilioStatus = createServerFn({ method: "GET" }).handler(async () => {
  const config = isTwilioConfigured();
  const publicBase =
    process.env.PUBLIC_APP_URL ?? process.env.VITE_PUBLIC_APP_URL ?? null;
  const webhookUrl = publicBase
    ? `${publicBase.replace(/\/$/, "")}/api/webhooks/twilio`
    : null;

  const supabaseBase =
    process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? null;
  const edgeFunctionWebhookUrl = supabaseBase
    ? `${supabaseBase.replace(/\/$/, "")}/functions/v1/whatsapp-webhook`
    : null;

  const edgeSendUrl = supabaseBase
    ? `${supabaseBase.replace(/\/$/, "")}/functions/v1/whatsapp-send`
    : null;

  return {
    configured: config,
    sendViaEdge: canSendViaEdgeFunction(),
    webhookUrl,
    edgeFunctionWebhookUrl,
    edgeSendUrl,
  };
});

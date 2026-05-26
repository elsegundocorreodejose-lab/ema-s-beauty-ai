-- Twilio WhatsApp: idempotencia de mensajes y número opcional en settings
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS twilio_message_sid TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS messages_twilio_message_sid_key
  ON public.messages (twilio_message_sid)
  WHERE twilio_message_sid IS NOT NULL;

ALTER TABLE public.esthetic_settings ADD COLUMN IF NOT EXISTS twilio_whatsapp_from TEXT;

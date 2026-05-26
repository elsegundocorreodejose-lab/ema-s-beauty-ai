import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTwilioStatus } from "@/functions/whatsapp";
import { Loader2, Plus, X, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Settings {
  id: number;
  esthetic_name: string;
  esthetic_address: string | null;
  esthetic_phone: string | null;
  esthetic_email: string | null;
  working_hours: string | null;
  services: string[];
  about_esthetic: string | null;
  whatsapp_webhook_url: string | null;
  twilio_whatsapp_from: string | null;
  timezone: string;
}

export function SettingsTab() {
  const queryClient = useQueryClient();
  const fetchTwilioStatus = useServerFn(getTwilioStatus);
  const { data: twilioStatus } = useQuery({
    queryKey: ["twilio-status"],
    queryFn: () => fetchTwilioStatus(),
  });
  const { data, isLoading } = useQuery({
    queryKey: ["esthetic_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("esthetic_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data as Settings;
    },
  });

  const [form, setForm] = useState<Settings | null>(null);
  const [newService, setNewService] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (isLoading || !form) {
    return <div className="grid place-items-center p-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;
  }

  const update = <K extends keyof Settings>(k: K, v: Settings[K]) => setForm({ ...form, [k]: v });

  const addService = () => {
    const v = newService.trim();
    if (!v) return;
    if (form.services.includes(v)) {
      toast.error("Ese servicio ya existe");
      return;
    }
    update("services", [...form.services, v]);
    setNewService("");
  };
  const removeService = (s: string) =>
    update("services", form.services.filter((x) => x !== s));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("esthetic_settings").update({
      esthetic_name: form.esthetic_name,
      esthetic_address: form.esthetic_address,
      esthetic_phone: form.esthetic_phone,
      esthetic_email: form.esthetic_email,
      working_hours: form.working_hours,
      services: form.services,
      about_esthetic: form.about_esthetic,
      whatsapp_webhook_url: form.whatsapp_webhook_url,
      twilio_whatsapp_from: form.twilio_whatsapp_from,
      timezone: form.timezone,
    }).eq("id", 1);
    setSaving(false);
    if (error) {
      toast.error(error.message.includes("policy")
        ? "Solo administradores pueden modificar la configuración."
        : error.message);
      return;
    }
    toast.success("Configuración guardada");
    queryClient.invalidateQueries({ queryKey: ["esthetic_settings"] });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Datos de la estética</CardTitle>
          <CardDescription>Información que Ema usará al comunicarse con tus clientes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Nombre"><Input value={form.esthetic_name} onChange={(e) => update("esthetic_name", e.target.value)} /></Field>
          <Field label="Dirección"><Input value={form.esthetic_address ?? ""} onChange={(e) => update("esthetic_address", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Teléfono"><Input value={form.esthetic_phone ?? ""} onChange={(e) => update("esthetic_phone", e.target.value)} /></Field>
            <Field label="Email"><Input type="email" value={form.esthetic_email ?? ""} onChange={(e) => update("esthetic_email", e.target.value)} /></Field>
          </div>
          <Field label="Horarios"><Input placeholder="Lun-Vie 9:00–19:00" value={form.working_hours ?? ""} onChange={(e) => update("working_hours", e.target.value)} /></Field>
          <Field label="Zona horaria"><Input value={form.timezone} onChange={(e) => update("timezone", e.target.value)} placeholder="America/Mexico_City" /></Field>
          <Field label="Sobre tu estética">
            <Textarea rows={4} value={form.about_esthetic ?? ""} onChange={(e) => update("about_esthetic", e.target.value)} placeholder="Cuéntale a Ema cómo presentarse." />
          </Field>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Servicios ofrecidos</CardTitle>
            <CardDescription>Lista que Ema utilizará al recomendar tratamientos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {form.services.length === 0 && (
                <p className="text-sm text-muted-foreground">Aún no hay servicios. Agrega el primero abajo.</p>
              )}
              {form.services.map((s) => (
                <Badge key={s} variant="secondary" className="gap-1 py-1 pl-3 pr-1">
                  {s}
                  <button onClick={() => removeService(s)} className="ml-1 grid h-5 w-5 place-items-center rounded-full hover:bg-destructive/15 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addService(); } }}
                placeholder="Ej. Limpieza facial profunda"
              />
              <Button type="button" onClick={addService} variant="outline">
                <Plus className="mr-1 h-4 w-4" /> Añadir
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>WhatsApp con Twilio</CardTitle>
            <CardDescription>
              Configura el webhook en la consola de Twilio para recibir mensajes entrantes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
              <p className="font-medium">
                Estado:{" "}
                {twilioStatus?.configured ? (
                  <span className="text-[oklch(0.45_0.12_150)]">Envío local (.env TWILIO_*)</span>
                ) : twilioStatus?.sendViaEdge ? (
                  <span className="text-[oklch(0.45_0.12_150)]">
                    Envío vía Supabase Edge (whatsapp-send)
                  </span>
                ) : (
                  <span className="text-destructive">
                    Falta whatsapp-send en Supabase o TWILIO_* en .env
                  </span>
                )}
              </p>
              {twilioStatus?.edgeFunctionWebhookUrl && (
                <p className="mt-2 break-all text-xs text-muted-foreground">
                  Webhook Supabase Edge (recomendado):{" "}
                  <code className="text-foreground">{twilioStatus.edgeFunctionWebhookUrl}</code>
                </p>
              )}
              {twilioStatus?.edgeSendUrl && (
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  Envío desde Mensajes:{" "}
                  <code className="text-foreground">{twilioStatus.edgeSendUrl}</code>
                </p>
              )}
              {twilioStatus?.webhookUrl && (
                <p className="mt-1 break-all text-xs text-muted-foreground">
                  Webhook app (alternativa):{" "}
                  <code className="text-foreground">{twilioStatus.webhookUrl}</code>
                </p>
              )}
            </div>
            <Field label="Número WhatsApp (Twilio)">
              <Input
                value={form.twilio_whatsapp_from ?? ""}
                onChange={(e) => update("twilio_whatsapp_from", e.target.value)}
                placeholder="whatsapp:+14155238886"
              />
            </Field>
            <Field label="Notas / URL externa (opcional)">
              <Input
                value={form.whatsapp_webhook_url ?? ""}
                onChange={(e) => update("whatsapp_webhook_url", e.target.value)}
                placeholder="URL de documentación o n8n"
              />
            </Field>
            <p className="text-xs text-muted-foreground">
              En Twilio Console → WhatsApp Sandbox: método POST y la URL Edge de arriba. Secretos en Supabase
              Dashboard → Edge Functions → Secrets (ver docs/WHATSAPP_TWILIO.md). Para responder desde
              Mensajes despliega la función <code className="text-foreground">whatsapp-send</code> o define
              TWILIO_* en el .env del servidor.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} size="lg" className="bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-95">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Save className="mr-2 h-4 w-4" /> Guardar cambios</>)}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

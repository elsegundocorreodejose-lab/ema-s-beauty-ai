import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isToday, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarCheck, Clock, XCircle, Plus, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

interface Appointment {
  id: string;
  phone_number: string;
  patient_name: string;
  appointment_date: string;
  appointment_type: string;
  status: "pendiente" | "confirmada" | "cancelada";
  reminder_sent: boolean;
  notes: string | null;
}

const STATUS_STYLES: Record<Appointment["status"], string> = {
  pendiente: "bg-warning/15 text-warning-foreground border-warning/30",
  confirmada: "bg-success/15 text-[oklch(0.45_0.12_150)] border-success/30",
  cancelada: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AppointmentsTab() {
  const queryClient = useQueryClient();
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true });
      if (error) throw error;
      return data as Appointment[];
    },
    refetchInterval: 10000,
  });

  const stats = useMemo(() => {
    const today = appointments.filter((a) => isToday(new Date(a.appointment_date)) && a.status !== "cancelada").length;
    const pending = appointments.filter((a) => a.status === "pendiente").length;
    const cancelled = appointments.filter((a) => a.status === "cancelada").length;
    return { today, pending, cancelled };
  }, [appointments]);

  const upcoming = useMemo(
    () => appointments.filter((a) => new Date(a.appointment_date) >= startOfDay(new Date())),
    [appointments]
  );

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Appointment["status"] }) => {
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Cita actualizada");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={CalendarCheck} label="Citas de hoy" value={stats.today} accent="bg-success/15 text-[oklch(0.45_0.12_150)]" />
        <StatCard icon={Clock} label="Pendientes" value={stats.pending} accent="bg-warning/15 text-warning-foreground" />
        <StatCard icon={XCircle} label="Canceladas" value={stats.cancelled} accent="bg-destructive/10 text-destructive" />
      </div>

      <Card className="overflow-hidden shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Próximas citas</CardTitle>
          <NewAppointmentDialog onCreated={() => queryClient.invalidateQueries({ queryKey: ["appointments"] })} />
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="grid place-items-center p-10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : upcoming.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No hay citas próximas. Crea la primera con el botón <strong>Nueva cita</strong>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tratamiento</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcoming.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.patient_name}</TableCell>
                      <TableCell>{a.appointment_type}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(a.appointment_date), "dd MMM yyyy, HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{a.phone_number}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_STYLES[a.status]}>
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select value={a.status} onValueChange={(v) => updateStatus.mutate({ id: a.id, status: v as Appointment["status"] })}>
                          <SelectTrigger className="ml-auto h-8 w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="confirmada">Confirmada</SelectItem>
                            <SelectItem value="cancelada">Cancelada</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof CalendarCheck; label: string; value: number; accent: string }) {
  return (
    <Card className="shadow-soft transition-all hover:shadow-glow">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`grid h-12 w-12 place-items-center rounded-xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const appointmentSchema = z.object({
  patient_name: z.string().trim().min(1, "Nombre requerido").max(120),
  phone_number: z.string().trim().min(5, "Teléfono inválido").max(30),
  appointment_type: z.string().trim().min(1, "Tratamiento requerido").max(120),
  appointment_date: z.string().min(1, "Fecha requerida"),
  notes: z.string().max(500).optional(),
});

function NewAppointmentDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    patient_name: "",
    phone_number: "",
    appointment_type: "",
    appointment_date: "",
    notes: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = appointmentSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("appointments").insert({
      patient_name: parsed.data.patient_name,
      phone_number: parsed.data.phone_number,
      appointment_type: parsed.data.appointment_type,
      appointment_date: new Date(parsed.data.appointment_date).toISOString(),
      notes: parsed.data.notes || null,
      status: "pendiente",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cita creada");
    setForm({ patient_name: "", phone_number: "", appointment_type: "", appointment_date: "", notes: "" });
    setOpen(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-95">
          <Plus className="mr-1 h-4 w-4" /> Nueva cita
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>Paciente</Label>
            <Input value={form.patient_name} onChange={(e) => setForm({ ...form, patient_name: e.target.value })} placeholder="Nombre del paciente" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="+52..." />
            </div>
            <div className="space-y-2">
              <Label>Tratamiento</Label>
              <Input value={form.appointment_type} onChange={(e) => setForm({ ...form, appointment_type: e.target.value })} placeholder="Limpieza facial" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fecha y hora</Label>
            <Input type="datetime-local" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Notas (opcional)</Label>
            <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observaciones" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-gradient-primary text-primary-foreground hover:opacity-95">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

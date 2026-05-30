import { Badge } from "@/components/ui/badge";
import type { QuestionnaireStatus } from "@/lib/maternidad/types";

const STATUS_CONFIG: Record<
  QuestionnaireStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  assigned: { label: "Asignado", variant: "secondary" },
  in_progress: { label: "En progreso", variant: "default" },
  paused: { label: "Pausado", variant: "outline" },
  completed: { label: "Completado", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

export function StatusBadge({ status }: { status: QuestionnaireStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PhaseBadge({ phase }: { phase: string }) {
  const labels: Record<string, string> = {
    admin: "Pendiente Admin",
    asistente: "Pendiente Asistente",
    enfermera: "Pendiente Enfermera",
    closed: "Cerrado",
  };
  return <Badge variant="outline">{labels[phase] ?? phase}</Badge>;
}

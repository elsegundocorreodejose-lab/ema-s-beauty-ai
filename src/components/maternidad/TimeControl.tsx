import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Questionnaire } from "@/lib/maternidad/types";

function formatDuration(ms: number) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

interface TimeControlProps {
  questionnaire: Questionnaire;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  disabled?: boolean;
}

export function TimeControl({ questionnaire, onStart, onPause, onResume, onFinish, disabled }: TimeControlProps) {
  const { status, activeTimerStart, timeRecords } = questionnaire;
  const totalMs = timeRecords.reduce((acc, r) => acc + (r.durationMs ?? 0), 0);
  const isClosed = !!questionnaire.closedAt;

  return (
    <div className="rounded-lg border border-border p-4">
      <h4 className="mb-3 font-semibold">Control de tiempo</h4>
      <p className="mb-3 text-sm text-muted-foreground">
        Tiempo registrado: <strong>{formatDuration(totalMs)}</strong>
        {activeTimerStart && " · Cronómetro activo"}
      </p>
      <div className="flex flex-wrap gap-2">
        {status === "assigned" && !activeTimerStart && (
          <Button size="sm" onClick={onStart} disabled={disabled || isClosed}>
            <Play className="mr-1 h-4 w-4" /> Iniciar
          </Button>
        )}
        {status === "in_progress" && activeTimerStart && (
          <Button size="sm" variant="outline" onClick={onPause} disabled={disabled || isClosed}>
            <Pause className="mr-1 h-4 w-4" /> Pausar
          </Button>
        )}
        {status === "paused" && !activeTimerStart && (
          <Button size="sm" onClick={onResume} disabled={disabled || isClosed}>
            <Play className="mr-1 h-4 w-4" /> Reanudar
          </Button>
        )}
        {activeTimerStart && (
          <Button size="sm" variant="secondary" onClick={onFinish} disabled={disabled || isClosed}>
            <Square className="mr-1 h-4 w-4" /> Finalizar tiempo
          </Button>
        )}
      </div>
      {timeRecords.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {timeRecords.map((r) => (
            <li key={r.id}>
              {new Date(r.startedAt).toLocaleTimeString("es-AR")} —{" "}
              {r.durationMs ? formatDuration(r.durationMs) : "—"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

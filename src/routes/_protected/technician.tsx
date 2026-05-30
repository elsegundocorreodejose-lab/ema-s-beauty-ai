import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { AppHeader } from "@/components/maternidad/AppHeader";
import { QuestionnaireDetail } from "@/components/maternidad/QuestionnaireDetail";
import { PhaseBadge, StatusBadge } from "@/components/maternidad/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getQuestionnairePhase, useMaternidad } from "@/lib/maternidad/store";

export const Route = createFileRoute("/_protected/technician")({
  component: TechnicianPage,
});

function TechnicianPage() {
  const { currentUser, getQuestionnairesForUser } = useMaternidad();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!currentUser || (currentUser.role !== "asistente" && currentUser.role !== "enfermera")) {
    return (
      <div className="grid min-h-screen place-items-center">
        <p>Acceso restringido a Asistentes y Enfermeras.</p>
      </div>
    );
  }

  const assigned = getQuestionnairesForUser(currentUser);
  const selected = assigned.find((q) => q.id === selectedId);
  const roleLabel = currentUser.role === "asistente" ? "Asistente" : "Enfermera";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title={`Panel ${roleLabel}`} />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4" />
              Cuestionarios asignados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assigned.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tiene cuestionarios asignados.</p>
            ) : (
              <ul className="space-y-2">
                {assigned.map((q) => (
                  <li
                    key={q.id}
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 ${
                      selectedId === q.id ? "bg-muted/50" : ""
                    }`}
                  >
                    <div>
                      <p className="font-medium">{q.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(q.createdAt).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={q.status} />
                      <PhaseBadge phase={getQuestionnairePhase(q)} />
                      <Button size="sm" variant={selectedId === q.id ? "default" : "outline"} onClick={() => setSelectedId(q.id)}>
                        {selectedId === q.id ? "Seleccionado" : "Iniciar servicio"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {selected && <QuestionnaireDetail questionnaire={selected} user={currentUser} />}
      </main>
    </div>
  );
}

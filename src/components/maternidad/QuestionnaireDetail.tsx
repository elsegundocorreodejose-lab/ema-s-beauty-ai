import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuestionnaireForm } from "@/components/maternidad/QuestionnaireForm";
import { SignatureDisplay, SignaturePad } from "@/components/maternidad/SignaturePad";
import { StatusBadge, PhaseBadge } from "@/components/maternidad/StatusBadge";
import { TimeControl } from "@/components/maternidad/TimeControl";
import {
  answersComplete,
  emptyAnswers,
  getQuestionnairePhase,
  useMaternidad,
} from "@/lib/maternidad/store";
import type { Questionnaire, QuestionnaireAnswers, User, UserRole } from "@/lib/maternidad/types";

function getAnswersForRole(q: Questionnaire, role: UserRole): QuestionnaireAnswers {
  if (role === "admin") return q.adminAnswers ?? emptyAnswers();
  if (role === "asistente") return q.asistenteAnswers ?? emptyAnswers();
  return q.enfermeraAnswers ?? emptyAnswers();
}

function getSignatureForRole(q: Questionnaire, role: UserRole) {
  if (role === "admin") return q.adminSignature;
  if (role === "asistente") return q.asistenteSignature;
  return q.enfermeraSignature;
}

interface QuestionnaireDetailProps {
  questionnaire: Questionnaire;
  user: User;
}

export function QuestionnaireDetail({ questionnaire: q, user }: QuestionnaireDetailProps) {
  const store = useMaternidad();
  const phase = getQuestionnairePhase(q);
  const isClosed = !!q.closedAt || q.status === "completed";
  const canEditRole = user.role === phase;
  const isTechnician = user.role === "asistente" || user.role === "enfermera";

  const [answers, setAnswers] = useState(() => getAnswersForRole(q, user.role));
  const [materialName, setMaterialName] = useState("");
  const [materialQty, setMaterialQty] = useState(1);
  const [noteText, setNoteText] = useState("");

  const handleSaveAnswers = () => {
    if (!answersComplete(answers)) {
      toast.error("Complete todas las preguntas");
      return;
    }
    store.saveAnswers(q.id, user.role, answers);
    toast.success("Respuestas guardadas");
  };

  const handleSign = (sig: Parameters<typeof store.saveSignature>[2]) => {
    if (!answersComplete(getAnswersForRole({ ...q, [`${user.role}Answers`]: answers } as Questionnaire, user.role))) {
      toast.error("Complete y guarde las respuestas antes de firmar");
      return;
    }
    store.saveSignature(q.id, user.role, sig);
    toast.success("Firma registrada");
  };

  const handleClientSign = (sig: Parameters<typeof store.saveSignature>[2]) => {
    store.saveSignature(q.id, "client", sig);
    toast.success("Firma del paciente registrada");
  };

  const handleClose = () => {
    if (store.closeQuestionnaire(q.id)) {
      toast.success("Cuestionario cerrado");
    } else {
      toast.error("No se puede cerrar: verifique tiempo, checklist y firmas");
    }
  };

  const mySignature = getSignatureForRole(q, user.role);

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{q.patientName}</h3>
          <p className="text-sm text-muted-foreground">
            Creado {new Date(q.createdAt).toLocaleString("es-AR")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={q.status} />
          <PhaseBadge phase={phase} />
        </div>
      </div>

      {isTechnician && (
        <>
          <TimeControl
            questionnaire={q}
            onStart={() => store.startTimer(q.id)}
            onPause={() => store.pauseTimer(q.id)}
            onResume={() => store.resumeTimer(q.id)}
            onFinish={() => store.finishTimer(q.id)}
            disabled={isClosed}
          />

          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="checklist"
                checked={q.checklistCompleted}
                onCheckedChange={(v) => store.setChecklistCompleted(q.id, v === true)}
                disabled={isClosed}
              />
              <Label htmlFor="checklist">Checklist de atención completado</Label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h4 className="font-semibold">Materiales</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Material"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  disabled={isClosed}
                />
                <Input
                  type="number"
                  min={1}
                  className="w-20"
                  value={materialQty}
                  onChange={(e) => setMaterialQty(Number(e.target.value))}
                  disabled={isClosed}
                />
                <Button
                  size="sm"
                  disabled={!materialName.trim() || isClosed}
                  onClick={() => {
                    store.addMaterial(q.id, materialName, materialQty);
                    setMaterialName("");
                    toast.success("Material registrado");
                  }}
                >
                  Agregar
                </Button>
              </div>
              {q.materials.length > 0 && (
                <ul className="text-sm text-muted-foreground">
                  {q.materials.map((m) => (
                    <li key={m.id}>
                      {m.name} × {m.quantity}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-lg border border-border p-4 space-y-3">
              <h4 className="font-semibold">Notas</h4>
              <Textarea
                placeholder="Agregar nota..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                disabled={isClosed}
              />
              <Button
                size="sm"
                disabled={!noteText.trim() || isClosed}
                onClick={() => {
                  store.addNote(q.id, noteText);
                  setNoteText("");
                  toast.success("Nota agregada");
                }}
              >
                Guardar nota
              </Button>
              {q.notes.length > 0 && (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {q.notes.map((n) => (
                    <li key={n.id} className="border-t border-border pt-1">
                      {n.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      <QuestionnaireForm
        title={`Cuestionario — ${user.role === "admin" ? "Administrador" : user.role === "asistente" ? "Asistente" : "Enfermera"}`}
        answers={answers}
        onChange={setAnswers}
        disabled={isClosed || !canEditRole || !!mySignature}
      />

      {canEditRole && !mySignature && !isClosed && (
        <div className="flex gap-2">
          <Button onClick={handleSaveAnswers}>Guardar respuestas</Button>
        </div>
      )}

      {canEditRole && !mySignature && !isClosed && (
        <SignaturePad defaultName={user.name} onSign={handleSign} label="Firma de conformidad" />
      )}

      {mySignature && <SignatureDisplay signature={mySignature} label="Su firma" />}

      {isTechnician && !q.clientSignature && !isClosed && phase === user.role && mySignature && (
        <SignaturePad onSign={handleClientSign} label="Firma del paciente / cliente" />
      )}

      {q.clientSignature && <SignatureDisplay signature={q.clientSignature} label="Firma del paciente" />}

      {user.role === "enfermera" && phase === "enfermera" && mySignature && !isClosed && (
        <Button onClick={handleClose} className="w-full sm:w-auto">
          Cerrar cuestionario
        </Button>
      )}

      {(q.adminSignature || q.asistenteSignature || q.enfermeraSignature) && (
        <div className="grid gap-3 sm:grid-cols-3">
          {q.adminSignature && <SignatureDisplay signature={q.adminSignature} label="Admin" />}
          {q.asistenteSignature && <SignatureDisplay signature={q.asistenteSignature} label="Asistente" />}
          {q.enfermeraSignature && <SignatureDisplay signature={q.enfermeraSignature} label="Enfermera" />}
        </div>
      )}
    </div>
  );
}

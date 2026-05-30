export type UserRole = "admin" | "asistente" | "enfermera";

export type QuestionnaireStatus =
  | "assigned"
  | "in_progress"
  | "paused"
  | "completed"
  | "cancelled";

export type ServiceEventType =
  | "login"
  | "questionnaire"
  | "signature"
  | "close"
  | "start"
  | "pause"
  | "resume"
  | "finish"
  | "note"
  | "material";

export interface QuestionnaireAnswers {
  trabajoParto: boolean | null;
  enfermedadEmbarazo: boolean | null;
  puedeAmamantar: boolean | null;
  corrientesCapital: boolean | null;
}

export interface Signature {
  signatureData: string;
  signerName: string;
  timestamp: string;
}

export interface TimeRecord {
  id: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  registeredAt: string;
}

export interface Note {
  id: string;
  text: string;
  authorId: string;
  createdAt: string;
}

export interface ServiceEvent {
  id: string;
  type: ServiceEventType;
  description: string;
  userId: string;
  timestamp: string;
  questionnaireId?: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  department?: string;
}

export interface Questionnaire {
  id: string;
  patientName: string;
  status: QuestionnaireStatus;
  createdAt: string;
  createdById: string;
  assignedAsistenteId?: string;
  assignedEnfermeraId?: string;
  adminAnswers?: QuestionnaireAnswers;
  adminSignature?: Signature;
  asistenteAnswers?: QuestionnaireAnswers;
  asistenteSignature?: Signature;
  enfermeraAnswers?: QuestionnaireAnswers;
  enfermeraSignature?: Signature;
  clientSignature?: Signature;
  timeRecords: TimeRecord[];
  activeTimerStart?: string;
  checklistCompleted: boolean;
  materials: Material[];
  notes: Note[];
  closedAt?: string;
}

export interface Company {
  name: string;
  description: string;
}

export const QUESTIONNAIRE_QUESTIONS = [
  { key: "trabajoParto" as const, label: "¿Trabajo de parto?" },
  { key: "enfermedadEmbarazo" as const, label: "¿Enfermedad estando embarazada?" },
  { key: "puedeAmamantar" as const, label: "¿Puede amamantar?" },
  { key: "corrientesCapital" as const, label: "¿Es de Corrientes Capital?" },
];

export const emptyAnswers = (): QuestionnaireAnswers => ({
  trabajoParto: null,
  enfermedadEmbarazo: null,
  puedeAmamantar: null,
  corrientesCapital: null,
});

export function answersComplete(answers?: QuestionnaireAnswers): boolean {
  if (!answers) return false;
  return (
    answers.trabajoParto !== null &&
    answers.enfermedadEmbarazo !== null &&
    answers.puedeAmamantar !== null &&
    answers.corrientesCapital !== null
  );
}

export function getQuestionnairePhase(q: Questionnaire): UserRole | "closed" {
  if (q.closedAt || q.status === "completed") return "closed";
  if (!q.adminSignature) return "admin";
  if (!q.asistenteSignature) return "asistente";
  if (!q.enfermeraSignature) return "enfermera";
  return "closed";
}

export const VALID_TRANSITIONS: Record<QuestionnaireStatus, QuestionnaireStatus[]> = {
  assigned: ["in_progress", "cancelled"],
  in_progress: ["paused", "completed"],
  paused: ["in_progress"],
  completed: [],
  cancelled: [],
};

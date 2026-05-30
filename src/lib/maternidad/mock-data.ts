import type { Company, Questionnaire, ServiceEvent, User } from "./types";

export const COMPANY: Company = {
  name: "Plataforma Maternidad - Gestión de Personal de Maternidad",
  description:
    "Cuestionario de Maternidad que recopila datos reales de pacientes atendidos en el área de Maternidad, agrupados para análisis estadístico.",
};

export const MOCK_USERS: User[] = [
  {
    id: "user-admin-1",
    email: "admin@maternidad.com",
    password: "admin123",
    name: "Dra. María González",
    role: "admin",
    phone: "+54 379 400-0001",
    department: "Dirección Maternidad",
  },
  {
    id: "user-asistente-1",
    email: "asistente@maternidad.com",
    password: "asistente123",
    name: "Laura Pérez",
    role: "asistente",
    phone: "+54 379 400-0002",
    department: "Asistencia Maternidad",
  },
  {
    id: "user-asistente-2",
    email: "asistente2@maternidad.com",
    password: "asistente123",
    name: "Carolina Ruiz",
    role: "asistente",
    phone: "+54 379 400-0003",
    department: "Asistencia Maternidad",
  },
  {
    id: "user-enfermera-1",
    email: "enfermera@maternidad.com",
    password: "enfermera123",
    name: "Ana Martínez",
    role: "enfermera",
    phone: "+54 379 400-0004",
    department: "Enfermería Maternidad",
  },
  {
    id: "user-enfermera-2",
    email: "enfermera2@maternidad.com",
    password: "enfermera123",
    name: "Silvia Fernández",
    role: "enfermera",
    phone: "+54 379 400-0005",
    department: "Enfermería Maternidad",
  },
];

export const INITIAL_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: "q-001",
    patientName: "Paciente Demo — Flujo completo",
    status: "assigned",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdById: "user-admin-1",
    assignedAsistenteId: "user-asistente-1",
    assignedEnfermeraId: "user-enfermera-1",
    adminAnswers: {
      trabajoParto: true,
      enfermedadEmbarazo: false,
      puedeAmamantar: true,
      corrientesCapital: true,
    },
    adminSignature: {
      signatureData: "signed-admin-demo",
      signerName: "Dra. María González",
      timestamp: new Date(Date.now() - 86000000).toISOString(),
    },
    timeRecords: [],
    checklistCompleted: false,
    materials: [],
    notes: [],
  },
  {
    id: "q-002",
    patientName: "Paciente — En curso Asistente",
    status: "in_progress",
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    createdById: "user-admin-1",
    assignedAsistenteId: "user-asistente-1",
    assignedEnfermeraId: "user-enfermera-1",
    adminAnswers: {
      trabajoParto: false,
      enfermedadEmbarazo: true,
      puedeAmamantar: true,
      corrientesCapital: false,
    },
    adminSignature: {
      signatureData: "signed-admin-2",
      signerName: "Dra. María González",
      timestamp: new Date(Date.now() - 43000000).toISOString(),
    },
    asistenteAnswers: {
      trabajoParto: false,
      enfermedadEmbarazo: true,
      puedeAmamantar: true,
      corrientesCapital: false,
    },
    timeRecords: [
      {
        id: "tr-1",
        startedAt: new Date(Date.now() - 3600000).toISOString(),
        endedAt: new Date(Date.now() - 1800000).toISOString(),
        durationMs: 1800000,
      },
    ],
    checklistCompleted: true,
    materials: [{ id: "mat-1", name: "Guantes", quantity: 2, registeredAt: new Date().toISOString() }],
    notes: [{ id: "note-1", text: "Paciente estable", authorId: "user-asistente-1", createdAt: new Date().toISOString() }],
  },
  {
    id: "q-003",
    patientName: "Paciente — Completado",
    status: "completed",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    createdById: "user-admin-1",
    assignedAsistenteId: "user-asistente-2",
    assignedEnfermeraId: "user-enfermera-1",
    adminAnswers: { trabajoParto: true, enfermedadEmbarazo: false, puedeAmamantar: true, corrientesCapital: true },
    adminSignature: { signatureData: "sig-a", signerName: "Dra. María González", timestamp: new Date(Date.now() - 170000000).toISOString() },
    asistenteAnswers: { trabajoParto: true, enfermedadEmbarazo: false, puedeAmamantar: true, corrientesCapital: true },
    asistenteSignature: { signatureData: "sig-as", signerName: "Carolina Ruiz", timestamp: new Date(Date.now() - 169000000).toISOString() },
    enfermeraAnswers: { trabajoParto: true, enfermedadEmbarazo: false, puedeAmamantar: true, corrientesCapital: true },
    enfermeraSignature: { signatureData: "sig-e", signerName: "Ana Martínez", timestamp: new Date(Date.now() - 168000000).toISOString() },
    clientSignature: { signatureData: "sig-c", signerName: "Paciente Demo", timestamp: new Date(Date.now() - 167000000).toISOString() },
    timeRecords: [{ id: "tr-2", startedAt: new Date(Date.now() - 169500000).toISOString(), endedAt: new Date(Date.now() - 168500000).toISOString(), durationMs: 3600000 }],
    checklistCompleted: true,
    materials: [],
    notes: [],
    closedAt: new Date(Date.now() - 167000000).toISOString(),
  },
];

export const INITIAL_EVENTS: ServiceEvent[] = [
  {
    id: "ev-1",
    type: "login",
    description: "Inicio de sesión — Admin",
    userId: "user-admin-1",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "ev-2",
    type: "questionnaire",
    description: "Cuestionario creado — Paciente Demo",
    userId: "user-admin-1",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    questionnaireId: "q-001",
  },
];

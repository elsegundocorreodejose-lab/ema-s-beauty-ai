import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { COMPANY, INITIAL_EVENTS, INITIAL_QUESTIONNAIRES, MOCK_USERS } from "./mock-data";
import type {
  Company,
  Questionnaire,
  QuestionnaireAnswers,
  QuestionnaireStatus,
  ServiceEvent,
  Signature,
  User,
  UserRole,
} from "./types";
import {
  VALID_TRANSITIONS,
  answersComplete,
  emptyAnswers,
  getQuestionnairePhase,
} from "./types";

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface MaternidadStore {
  company: Company;
  users: User[];
  questionnaires: Questionnaire[];
  events: ServiceEvent[];
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (data: { name: string; email: string; password: string; role: UserRole }) => boolean;
  updateProfile: (userId: string, data: Partial<Pick<User, "name" | "phone" | "department">>) => void;
  addUser: (data: Omit<User, "id">) => void;
  removeUser: (userId: string) => void;
  createQuestionnaire: (patientName: string, asistenteId: string, enfermeraId: string) => string;
  cancelQuestionnaire: (id: string) => void;
  saveAnswers: (id: string, role: UserRole, answers: QuestionnaireAnswers) => void;
  saveSignature: (id: string, role: UserRole | "client", signature: Signature) => void;
  transitionStatus: (id: string, next: QuestionnaireStatus) => boolean;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  finishTimer: (id: string) => void;
  addMaterial: (id: string, name: string, quantity: number) => void;
  addNote: (id: string, text: string) => void;
  setChecklistCompleted: (id: string, completed: boolean) => void;
  closeQuestionnaire: (id: string) => boolean;
  getQuestionnairesForUser: (user: User) => Questionnaire[];
  addEvent: (event: Omit<ServiceEvent, "id" | "timestamp">) => void;
}

const MaternidadContext = createContext<MaternidadStore | null>(null);

export function MaternidadProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => [...MOCK_USERS]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>(() => [...INITIAL_QUESTIONNAIRES]);
  const [events, setEvents] = useState<ServiceEvent[]>(() => [...INITIAL_EVENTS]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = sessionStorage.getItem("maternidad-user-id");
    if (!saved) return null;
    return MOCK_USERS.find((u) => u.id === saved) ?? null;
  });

  const addEvent = useCallback((event: Omit<ServiceEvent, "id" | "timestamp">) => {
    setEvents((prev) => [
      {
        ...event,
        id: uid("ev"),
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const login = useCallback(
    (email: string, password: string) => {
      const user = users.find((u) => u.email === email && u.password === password);
      if (!user) return false;
      setCurrentUser(user);
      sessionStorage.setItem("maternidad-user-id", user.id);
      addEvent({ type: "login", description: `Inicio de sesión — ${user.name}`, userId: user.id });
      return true;
    },
    [users, addEvent],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    sessionStorage.removeItem("maternidad-user-id");
  }, []);

  const register = useCallback(
    (data: { name: string; email: string; password: string; role: UserRole }) => {
      if (users.some((u) => u.email === data.email)) return false;
      const newUser: User = { id: uid("user"), ...data };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      sessionStorage.setItem("maternidad-user-id", newUser.id);
      addEvent({ type: "login", description: `Registro e inicio — ${newUser.name}`, userId: newUser.id });
      return true;
    },
    [users, addEvent],
  );

  const updateProfile = useCallback((userId: string, data: Partial<Pick<User, "name" | "phone" | "department">>) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data } : u)));
    setCurrentUser((prev) => (prev?.id === userId ? { ...prev, ...data } : prev));
  }, []);

  const addUser = useCallback((data: Omit<User, "id">) => {
    setUsers((prev) => [...prev, { id: uid("user"), ...data }]);
  }, []);

  const removeUser = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const createQuestionnaire = useCallback(
    (patientName: string, asistenteId: string, enfermeraId: string) => {
      const id = uid("q");
      const q: Questionnaire = {
        id,
        patientName,
        status: "assigned",
        createdAt: new Date().toISOString(),
        createdById: currentUser?.id ?? "user-admin-1",
        assignedAsistenteId: asistenteId,
        assignedEnfermeraId: enfermeraId,
        timeRecords: [],
        checklistCompleted: false,
        materials: [],
        notes: [],
      };
      setQuestionnaires((prev) => [q, ...prev]);
      addEvent({
        type: "questionnaire",
        description: `Cuestionario creado — ${patientName}`,
        userId: currentUser?.id ?? "user-admin-1",
        questionnaireId: id,
      });
      return id;
    },
    [currentUser, addEvent],
  );

  const updateQuestionnaire = useCallback((id: string, updater: (q: Questionnaire) => Questionnaire) => {
    setQuestionnaires((prev) => prev.map((q) => (q.id === id ? updater(q) : q)));
  }, []);

  const cancelQuestionnaire = useCallback(
    (id: string) => {
      updateQuestionnaire(id, (q) => ({ ...q, status: "cancelled" }));
      addEvent({
        type: "close",
        description: "Cuestionario cancelado",
        userId: currentUser?.id ?? "",
        questionnaireId: id,
      });
    },
    [updateQuestionnaire, addEvent, currentUser],
  );

  const saveAnswers = useCallback(
    (id: string, role: UserRole, answers: QuestionnaireAnswers) => {
      updateQuestionnaire(id, (q) => {
        if (role === "admin") return { ...q, adminAnswers: answers };
        if (role === "asistente") return { ...q, asistenteAnswers: answers };
        return { ...q, enfermeraAnswers: answers };
      });
      addEvent({
        type: "questionnaire",
        description: `Respuestas registradas (${role})`,
        userId: currentUser?.id ?? "",
        questionnaireId: id,
      });
    },
    [updateQuestionnaire, addEvent, currentUser],
  );

  const saveSignature = useCallback(
    (id: string, role: UserRole | "client", signature: Signature) => {
      updateQuestionnaire(id, (q) => {
        if (role === "admin") return { ...q, adminSignature: signature };
        if (role === "asistente") return { ...q, asistenteSignature: signature };
        if (role === "enfermera") return { ...q, enfermeraSignature: signature };
        return { ...q, clientSignature: signature };
      });
      addEvent({
        type: "signature",
        description: `Firma de conformidad (${role}) — ${signature.signerName}`,
        userId: currentUser?.id ?? "",
        questionnaireId: id,
      });
    },
    [updateQuestionnaire, addEvent, currentUser],
  );

  const transitionStatus = useCallback(
    (id: string, next: QuestionnaireStatus) => {
      let ok = false;
      updateQuestionnaire(id, (q) => {
        if (q.closedAt) return q;
        const allowed = VALID_TRANSITIONS[q.status];
        if (!allowed.includes(next)) return q;
        ok = true;
        return { ...q, status: next };
      });
      return ok;
    },
    [updateQuestionnaire],
  );

  const startTimer = useCallback(
    (id: string) => {
      updateQuestionnaire(id, (q) => {
        if (q.activeTimerStart || q.closedAt) return q;
        addEvent({ type: "start", description: "Servicio iniciado", userId: currentUser?.id ?? "", questionnaireId: id });
        return { ...q, status: "in_progress", activeTimerStart: new Date().toISOString() };
      });
    },
    [updateQuestionnaire, addEvent, currentUser],
  );

  const pauseTimer = useCallback(
    (id: string) => {
      updateQuestionnaire(id, (q) => {
        if (!q.activeTimerStart) return q;
        const endedAt = new Date().toISOString();
        const durationMs = new Date(endedAt).getTime() - new Date(q.activeTimerStart).getTime();
        addEvent({ type: "pause", description: "Servicio pausado", userId: currentUser?.id ?? "", questionnaireId: id });
        return {
          ...q,
          status: "paused",
          activeTimerStart: undefined,
          timeRecords: [
            ...q.timeRecords,
            { id: uid("tr"), startedAt: q.activeTimerStart, endedAt, durationMs },
          ],
        };
      });
    },
    [updateQuestionnaire, addEvent, currentUser],
  );

  const resumeTimer = useCallback(
    (id: string) => {
      updateQuestionnaire(id, (q) => {
        if (q.activeTimerStart || q.closedAt) return q;
        addEvent({ type: "resume", description: "Servicio reanudado", userId: currentUser?.id ?? "", questionnaireId: id });
        return { ...q, status: "in_progress", activeTimerStart: new Date().toISOString() };
      });
    },
    [updateQuestionnaire, addEvent, currentUser],
  );

  const finishTimer = useCallback(
    (id: string) => {
      updateQuestionnaire(id, (q) => {
        if (!q.activeTimerStart) return q;
        const endedAt = new Date().toISOString();
        const durationMs = new Date(endedAt).getTime() - new Date(q.activeTimerStart).getTime();
        addEvent({ type: "finish", description: "Registro de tiempo finalizado", userId: currentUser?.id ?? "", questionnaireId: id });
        return {
          ...q,
          activeTimerStart: undefined,
          timeRecords: [
            ...q.timeRecords,
            { id: uid("tr"), startedAt: q.activeTimerStart, endedAt, durationMs },
          ],
        };
      });
    },
    [updateQuestionnaire, addEvent, currentUser],
  );

  const addMaterial = useCallback(
    (id: string, name: string, quantity: number) => {
      updateQuestionnaire(id, (q) => ({
        ...q,
        materials: [...q.materials, { id: uid("mat"), name, quantity, registeredAt: new Date().toISOString() }],
      }));
      addEvent({ type: "material", description: `Material: ${name} x${quantity}`, userId: currentUser?.id ?? "", questionnaireId: id });
    },
    [updateQuestionnaire, addEvent, currentUser],
  );

  const addNote = useCallback(
    (id: string, text: string) => {
      updateQuestionnaire(id, (q) => ({
        ...q,
        notes: [...q.notes, { id: uid("note"), text, authorId: currentUser?.id ?? "", createdAt: new Date().toISOString() }],
      }));
      addEvent({ type: "note", description: `Nota agregada`, userId: currentUser?.id ?? "", questionnaireId: id });
    },
    [updateQuestionnaire, addEvent, currentUser],
  );

  const setChecklistCompleted = useCallback(
    (id: string, completed: boolean) => {
      updateQuestionnaire(id, (q) => ({ ...q, checklistCompleted: completed }));
    },
    [updateQuestionnaire],
  );

  const closeQuestionnaire = useCallback(
    (id: string) => {
      const q = questionnaires.find((x) => x.id === id);
      if (!q) return false;
      if (q.timeRecords.length === 0 && !q.activeTimerStart) return false;
      if (!q.checklistCompleted) return false;
      if (!q.clientSignature) return false;
      if (!q.adminSignature || !q.asistenteSignature || !q.enfermeraSignature) return false;

      updateQuestionnaire(id, (prev) => ({
        ...prev,
        status: "completed",
        closedAt: new Date().toISOString(),
        activeTimerStart: undefined,
      }));
      addEvent({
        type: "close",
        description: "Cuestionario cerrado",
        userId: currentUser?.id ?? "",
        questionnaireId: id,
      });
      return true;
    },
    [questionnaires, updateQuestionnaire, addEvent, currentUser],
  );

  const getQuestionnairesForUser = useCallback(
    (user: User) => {
      if (user.role === "admin") return questionnaires;
      if (user.role === "asistente") {
        return questionnaires.filter((q) => q.assignedAsistenteId === user.id);
      }
      return questionnaires.filter((q) => q.assignedEnfermeraId === user.id);
    },
    [questionnaires],
  );

  const value = useMemo<MaternidadStore>(
    () => ({
      company: COMPANY,
      users,
      questionnaires,
      events,
      currentUser,
      login,
      logout,
      register,
      updateProfile,
      addUser,
      removeUser,
      createQuestionnaire,
      cancelQuestionnaire,
      saveAnswers,
      saveSignature,
      transitionStatus,
      startTimer,
      pauseTimer,
      resumeTimer,
      finishTimer,
      addMaterial,
      addNote,
      setChecklistCompleted,
      closeQuestionnaire,
      getQuestionnairesForUser,
      addEvent,
    }),
    [
      users,
      questionnaires,
      events,
      currentUser,
      login,
      logout,
      register,
      updateProfile,
      addUser,
      removeUser,
      createQuestionnaire,
      cancelQuestionnaire,
      saveAnswers,
      saveSignature,
      transitionStatus,
      startTimer,
      pauseTimer,
      resumeTimer,
      finishTimer,
      addMaterial,
      addNote,
      setChecklistCompleted,
      closeQuestionnaire,
      getQuestionnairesForUser,
      addEvent,
    ],
  );

  return <MaternidadContext.Provider value={value}>{children}</MaternidadContext.Provider>;
}

export function useMaternidad() {
  const ctx = useContext(MaternidadContext);
  if (!ctx) throw new Error("useMaternidad must be used within MaternidadProvider");
  return ctx;
}

export { answersComplete, emptyAnswers, getQuestionnairePhase };

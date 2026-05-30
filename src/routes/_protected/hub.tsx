import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Trash2, Users } from "lucide-react";
import { AppHeader } from "@/components/maternidad/AppHeader";
import { QuestionnaireDetail } from "@/components/maternidad/QuestionnaireDetail";
import { StatsPanel } from "@/components/maternidad/StatsPanel";
import { PhaseBadge, StatusBadge } from "@/components/maternidad/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getQuestionnairePhase, useMaternidad } from "@/lib/maternidad/store";

export const Route = createFileRoute("/_protected/hub")({
  component: HubPage,
});

function HubPage() {
  const { currentUser, questionnaires, users, createQuestionnaire, addUser, removeUser, cancelQuestionnaire } =
    useMaternidad();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [asistenteId, setAsistenteId] = useState("");
  const [enfermeraId, setEnfermeraId] = useState("");
  const [newStaff, setNewStaff] = useState({ name: "", email: "", password: "", role: "asistente" as const });

  const asistentes = users.filter((u) => u.role === "asistente");
  const enfermeras = users.filter((u) => u.role === "enfermera");
  const selected = questionnaires.find((q) => q.id === selectedId);

  if (currentUser?.role !== "admin") {
    return (
      <div className="grid min-h-screen place-items-center">
        <p>Acceso restringido al administrador.</p>
      </div>
    );
  }

  const handleCreate = () => {
    if (!patientName.trim() || !asistenteId || !enfermeraId) {
      toast.error("Complete todos los campos");
      return;
    }
    const id = createQuestionnaire(patientName, asistenteId, enfermeraId);
    setSelectedId(id);
    setPatientName("");
    toast.success("Cuestionario creado");
  };

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.email || !newStaff.password) {
      toast.error("Complete los datos del personal");
      return;
    }
    addUser({ ...newStaff, role: newStaff.role });
    setNewStaff({ name: "", email: "", password: "", role: "asistente" });
    toast.success("Personal agregado");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Panel Administrador" />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Tabs defaultValue="cuestionarios">
          <TabsList className="mb-6">
            <TabsTrigger value="cuestionarios">Cuestionarios</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="cuestionarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Plus className="h-4 w-4" /> Nuevo cuestionario
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Nombre del paciente" />
                </div>
                <div className="space-y-2">
                  <Label>Asistente</Label>
                  <Select value={asistenteId} onValueChange={setAsistenteId}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {asistentes.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Enfermera</Label>
                  <Select value={enfermeraId} onValueChange={setEnfermeraId}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {enfermeras.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCreate} className="w-full">Crear</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Todos los cuestionarios</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fase</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questionnaires.map((q) => (
                      <TableRow key={q.id} className={selectedId === q.id ? "bg-muted/50" : ""}>
                        <TableCell className="font-medium">{q.patientName}</TableCell>
                        <TableCell><StatusBadge status={q.status} /></TableCell>
                        <TableCell><PhaseBadge phase={getQuestionnairePhase(q)} /></TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(q.createdAt).toLocaleDateString("es-AR")}
                        </TableCell>
                        <TableCell className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => setSelectedId(q.id)}>
                            Ver
                          </Button>
                          {q.status === "assigned" && (
                            <Button size="sm" variant="ghost" onClick={() => cancelQuestionnaire(q.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {selected && currentUser && (
              <QuestionnaireDetail questionnaire={selected} user={currentUser} />
            )}
          </TabsContent>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" /> Agregar personal
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Input placeholder="Nombre" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} />
                <Input placeholder="Email" value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} />
                <Input placeholder="Contraseña" type="password" value={newStaff.password} onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })} />
                <Select value={newStaff.role} onValueChange={(v) => setNewStaff({ ...newStaff, role: v as "asistente" | "enfermera" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asistente">Asistente</SelectItem>
                    <SelectItem value="enfermera">Enfermera</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddStaff}>Agregar</Button>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {[asistentes, enfermeras].map((group, i) => (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle className="text-base">{i === 0 ? "Asistentes" : "Enfermeras"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {group.map((u) => (
                        <li key={u.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-muted-foreground">{u.email}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => removeUser(u.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="estadisticas">
            <StatsPanel />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

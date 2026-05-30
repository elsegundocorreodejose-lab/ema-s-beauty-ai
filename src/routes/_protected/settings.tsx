import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppHeader } from "@/components/maternidad/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMaternidad } from "@/lib/maternidad/store";

const ROLE_LABELS = {
  admin: "Administrador",
  asistente: "Asistente",
  enfermera: "Enfermera",
};

export const Route = createFileRoute("/_protected/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { currentUser, updateProfile, events } = useMaternidad();
  const [name, setName] = useState(currentUser?.name ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [department, setDepartment] = useState(currentUser?.department ?? "");

  if (!currentUser) return null;

  const myEvents = events.filter((e) => e.userId === currentUser.id).slice(0, 10);

  const handleSave = () => {
    updateProfile(currentUser.id, { name, phone, department });
    toast.success("Perfil actualizado");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader title="Configuración" />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perfil de usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Input value={ROLE_LABELS[currentUser.role]} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={currentUser.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Departamento</Label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <Button onClick={handleSave}>Guardar cambios</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial de eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {myEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin eventos registrados.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {myEvents.map((e) => (
                  <li key={e.id} className="flex justify-between border-b border-border pb-2">
                    <span>{e.description}</span>
                    <span className="text-muted-foreground">
                      {new Date(e.timestamp).toLocaleString("es-AR")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

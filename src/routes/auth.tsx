import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Baby, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { useMaternidad } from "@/lib/maternidad/store";
import type { UserRole } from "@/lib/maternidad/types";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Email inválido");
const passwordSchema = z.string().min(6, "Mínimo 6 caracteres");

function AuthPage() {
  const { login, register, currentUser, company } = useMaternidad();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("asistente");

  useEffect(() => {
    if (currentUser) navigate({ to: "/home" });
  }, [currentUser, navigate]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
        return;
      }
    }
    setLoading(true);
    const ok = login(email, password);
    setLoading(false);
    if (!ok) {
      toast.error("Credenciales incorrectas");
      return;
    }
    toast.success("¡Bienvenido/a!");
    navigate({ to: "/home" });
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Ingrese su nombre");
      return;
    }
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
        return;
      }
    }
    setLoading(true);
    const ok = register({ name, email, password, role });
    setLoading(false);
    if (!ok) {
      toast.error("El email ya está registrado");
      return;
    }
    toast.success("Cuenta creada");
    navigate({ to: "/home" });
  };

  const demoAccounts = [
    { email: "admin@maternidad.com", password: "admin123", label: "Admin" },
    { email: "asistente@maternidad.com", password: "asistente123", label: "Asistente" },
    { email: "enfermera@maternidad.com", password: "enfermera123", label: "Enfermera" },
  ];

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-hero px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Baby className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">Plataforma Maternidad</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <p className="mb-4 text-center text-xs text-muted-foreground">{company.name}</p>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <h1 className="text-xl font-semibold">Acceso al sistema</h1>
              <p className="mt-1 text-sm text-muted-foreground">Ingrese sus credenciales.</p>
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <Field id="login-email" label="Email" type="email" value={email} onChange={setEmail} />
                <Field id="login-password" label="Contraseña" type="password" value={password} onChange={setPassword} />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
                </Button>
              </form>

              <div className="mt-6 rounded-lg border border-dashed border-border p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Cuentas demo:</p>
                <div className="flex flex-wrap gap-2">
                  {demoAccounts.map((d) => (
                    <Button
                      key={d.email}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEmail(d.email);
                        setPassword(d.password);
                      }}
                    >
                      {d.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <h1 className="text-xl font-semibold">Crear cuenta</h1>
              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                <Field id="reg-name" label="Nombre" value={name} onChange={setName} />
                <Field id="reg-email" label="Email" type="email" value={email} onChange={setEmail} />
                <Field id="reg-password" label="Contraseña" type="password" value={password} onChange={setPassword} />
                <div className="space-y-2">
                  <Label>Rol</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="asistente">Asistente</SelectItem>
                      <SelectItem value="enfermera">Enfermera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Registrarse"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  id, label, type = "text", value, onChange,
}: {
  id: string; label: string; type?: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

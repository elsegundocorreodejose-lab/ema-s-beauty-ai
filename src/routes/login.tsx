import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acceder · Ema IA" },
      { name: "description", content: "Inicia sesión o crea tu cuenta en Ema IA." },
    ],
  }),
  component: LoginPage,
});

const emailSchema = z.string().trim().email("Email inválido").max(255);
const passwordSchema = z.string().min(6, "Mínimo 6 caracteres").max(72);
const nameSchema = z.string().trim().min(1, "Ingresa tu nombre").max(80);

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handleLogin = async (e: FormEvent) => {
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("¡Bienvenida!");
    navigate({ to: "/dashboard" });
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    try {
      nameSchema.parse(fullName);
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.issues[0].message);
        return;
      }
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cuenta creada. Revisa tu correo para confirmar.");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-hero px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">Ema IA</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft animate-in fade-in zoom-in-95 duration-500 sm:p-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <h1 className="text-xl font-semibold">Bienvenida de vuelta</h1>
              <p className="mt-1 text-sm text-muted-foreground">Accede a tu panel de Ema IA.</p>
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <Field id="login-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="tucorreo@ejemplo.com" />
                <Field id="login-password" label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-95">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <h1 className="text-xl font-semibold">Crea tu cuenta</h1>
              <p className="mt-1 text-sm text-muted-foreground">Empieza a usar Ema IA en minutos.</p>
              <form onSubmit={handleSignup} className="mt-6 space-y-4">
                <Field id="signup-name" label="Nombre completo" value={fullName} onChange={setFullName} placeholder="Tu nombre" />
                <Field id="signup-email" label="Email" type="email" value={email} onChange={setEmail} placeholder="tucorreo@ejemplo.com" />
                <Field id="signup-password" label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" />
                <Button type="submit" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground shadow-soft hover:opacity-95">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear cuenta"}
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
  id, label, type = "text", value, onChange, placeholder,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

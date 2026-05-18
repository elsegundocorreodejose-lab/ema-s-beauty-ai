import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, CalendarDays, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessagesTab } from "@/components/dashboard/MessagesTab";
import { AppointmentsTab } from "@/components/dashboard/AppointmentsTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Ema IA" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-soft">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight">Ema IA</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Panel de Ema</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestiona conversaciones, agenda y configuración de tu estética.
          </p>
        </div>

        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="h-4 w-4" /> <span className="hidden sm:inline">Mensajes</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2">
              <CalendarDays className="h-4 w-4" /> <span className="hidden sm:inline">Citas</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Configuración</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <MessagesTab />
          </TabsContent>
          <TabsContent value="appointments" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AppointmentsTab />
          </TabsContent>
          <TabsContent value="settings" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import { Baby, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMaternidad } from "@/lib/maternidad/store";
import type { UserRole } from "@/lib/maternidad/types";

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  asistente: "Asistente",
  enfermera: "Enfermera",
};

export function AppHeader({ title }: { title?: string }) {
  const { currentUser, logout, company } = useMaternidad();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/auth" });
  };

  const homePath = currentUser?.role === "admin" ? "/hub" : "/technician";

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to={homePath} className="flex min-w-0 items-center gap-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Baby className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Plataforma Maternidad</p>
            {title && <p className="truncate text-xs text-muted-foreground">{title}</p>}
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {currentUser && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[currentUser.role]}</p>
            </div>
          )}
          <Link to="/settings">
            <Button variant="ghost" size="icon" aria-label="Configuración">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1 h-4 w-4" />
            Salir
          </Button>
        </div>
      </div>
      <div className="border-t border-border bg-muted/30 px-4 py-1.5 text-center text-xs text-muted-foreground sm:px-6">
        {company.name}
      </div>
    </header>
  );
}

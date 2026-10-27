import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Lock, Users } from "lucide-react";
import logo from "@/assets/logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const navigate = useNavigate();
  return (
    <header className="no-print sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <Link to="/pacientes" className="flex items-center gap-3">
          <img src={logo.url} alt="Servicios de Rehabilitación Cardio Pulmonar" className="h-12 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground sm:flex">
            <Lock className="h-3 w-3" /> Confidencial
          </span>
          <Button asChild variant="ghost" size="sm">
            <Link to="/pacientes">
              <Users /> Pacientes
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
          >
            <LogOut /> Salir
          </Button>
        </div>
      </div>
    </header>
  );
}

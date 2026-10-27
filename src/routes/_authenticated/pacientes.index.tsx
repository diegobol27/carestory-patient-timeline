import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { calcAge } from "@/lib/clinical";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/pacientes/")({
  head: () => ({ meta: [{ title: "Pacientes · Historia Clínica Digital" }] }),
  component: PatientsPage,
});

function PatientsPage() {
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const term = q.trim().toLowerCase();
  const list = (data ?? []).filter(
    (p) => !term || [p.full_name, p.doc_number, p.hc_number].some((x) => x?.toLowerCase().includes(term)),
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Pacientes</h1>
          <p className="text-sm text-muted-foreground">Busque un paciente para registrar una nueva sesión de evolución.</p>
        </div>
        <Button asChild>
          <Link to="/pacientes/nuevo"><Plus /> Nuevo paciente</Link>
        </Button>
      </div>
      <div className="relative mt-6">
        <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Nombre, documento o N.º de historia" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border bg-card shadow-card">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Cargando…</p>
        ) : list.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No hay pacientes registrados.</p>
        ) : (
          <ul className="divide-y">
            {list.map((p) => (
              <li key={p.id}>
                <Link to="/pacientes/$patientId" params={{ patientId: p.id }} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted">
                  <div>
                    <p className="font-semibold text-primary">{p.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.doc_type ?? "Doc"} {p.doc_number ?? "—"} · HC {p.hc_number ?? "—"}
                      {calcAge(p.birth_date) !== null && ` · ${calcAge(p.birth_date)} años`}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

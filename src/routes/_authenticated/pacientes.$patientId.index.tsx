import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { usePatient, useEncounters } from "@/lib/queries";
import { useState } from "react";
import { toast } from "sonner";
import { FilePlus2, Download, Pencil, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { calcAge, carryForward, formatDate } from "@/lib/clinical";
import { PatientForm } from "@/components/PatientForm";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/pacientes/$patientId/")({
  head: () => ({ meta: [{ title: "Historia del paciente · Historia Clínica Digital" }] }),
  component: PatientPage,
});

function PatientPage() {
  const { patientId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: p, isLoading } = usePatient(patientId);
  const { data: encounters = [] } = useEncounters(patientId);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  if (isLoading || !p) return <p className="text-muted-foreground">Cargando…</p>;

  async function newSession() {
    setBusy(true);
    const { data, error } = await supabase
      .from("encounters")
      .insert({ patient_id: patientId, ...carryForward(encounters[0]), modality_address: encounters[0]?.modality_address ?? p!.address })
      .select()
      .single();
    setBusy(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["encounters", patientId] });
    navigate({ to: "/pacientes/$patientId/atencion/$encounterId", params: { patientId, encounterId: data.id } });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-brand p-6 text-primary-foreground shadow-card">
        <p className="text-xs tracking-widest uppercase opacity-80">Historia clínica {p.hc_number ? `N.º ${p.hc_number}` : ""}</p>
        <h1 className="mt-1 text-3xl font-bold">{p.full_name}</h1>
        <p className="mt-1 text-sm opacity-90">
          {p.doc_type ?? "Doc"} {p.doc_number ?? "—"} · {calcAge(p.birth_date) ?? "—"} años · {p.phone ?? "sin teléfono"} · {p.municipality ?? ""}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={newSession} disabled={busy}><FilePlus2 /> Nueva sesión / evolución</Button>
          <Button asChild variant="onBrand">
            <Link to="/pacientes/$patientId/imprimir" params={{ patientId }} search={{ atencion: undefined }}><Download /> Historia completa (PDF)</Link>
          </Button>
          <Button variant="onBrand" onClick={() => setEditing((e) => !e)}>
            <Pencil /> {editing ? "Cerrar edición" : "Editar datos"}
          </Button>
        </div>
      </div>

      {editing && (
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <PatientForm
            initial={p}
            submitLabel="Actualizar datos"
            onSubmit={async (values) => {
              const { error } = await supabase.from("patients").update(values).eq("id", patientId);
              if (error) return toast.error(error.message);
              qc.invalidateQueries({ queryKey: ["patient", patientId] });
              qc.invalidateQueries({ queryKey: ["patients"] });
              toast.success("Datos actualizados");
              setEditing(false);
            }}
          />
        </div>
      )}

      <div className="rounded-2xl border bg-card shadow-card">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-primary">Atenciones y evolución ({encounters.length})</h2>
        </div>
        {encounters.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Aún no hay sesiones. Cree la primera con “Nueva sesión / evolución”.</p>
        ) : (
          <ul className="divide-y">
            {encounters.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <Link to="/pacientes/$patientId/atencion/$encounterId" params={{ patientId, encounterId: e.id }} className="flex-1">
                  <p className="font-semibold text-primary">{formatDate(e.encounter_date)} · {e.encounter_type ?? "Atención"}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{e.services.join(", ") || "Sin servicio"} — {e.evolution || e.reason || "Sin notas"}</p>
                </Link>
                <Button asChild size="sm" variant="outline">
                  <Link to="/pacientes/$patientId/imprimir" params={{ patientId }} search={{ atencion: e.id }}><Download /> PDF</Link>
                </Button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

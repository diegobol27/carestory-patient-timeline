import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PatientForm } from "@/components/PatientForm";

export const Route = createFileRoute("/_authenticated/pacientes/nuevo")({
  head: () => ({ meta: [{ title: "Nuevo paciente · Historia Clínica Digital" }] }),
  component: NewPatient,
});

function NewPatient() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-card">
      <h1 className="mb-6 text-2xl font-bold text-primary">Ingreso de paciente</h1>
      <PatientForm
        submitLabel="Guardar paciente"
        busy={busy}
        onSubmit={async (values) => {
          setBusy(true);
          const { data, error } = await supabase.from("patients").insert(values).select().single();
          setBusy(false);
          if (error) { toast.error(error.message); return; }
          qc.invalidateQueries({ queryKey: ["patients"] });
          toast.success("Paciente guardado");
          navigate({ to: "/pacientes/$patientId", params: { patientId: data.id } });
        }}
      />
    </div>
  );
}

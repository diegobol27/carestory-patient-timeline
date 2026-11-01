import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Download, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePatient } from "@/lib/queries";
import { ENCOUNTER_TYPES, SERVICES, VITAL_ROWS, asVitals, type Encounter, type Vitals } from "@/lib/clinical";
import { Field } from "@/components/PatientForm";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/pacientes/$patientId/atencion/$encounterId")({
  head: () => ({ meta: [{ title: "Sesión de atención · Historia Clínica Digital" }] }),
  component: EncounterPage,
});

function EncounterPage() {
  const { patientId, encounterId } = Route.useParams();
  const qc = useQueryClient();
  const { data: patient } = usePatient(patientId);
  const { data } = useQuery({
    queryKey: ["encounter", encounterId],
    queryFn: async () => {
      const { data, error } = await supabase.from("encounters").select("*").eq("id", encounterId).single();
      if (error) throw error;
      return data;
    },
  });
  const [v, setV] = useState<Encounter | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setV(data); }, [data]);
  if (!v) return <p className="text-muted-foreground">Cargando…</p>;

  const set = (k: keyof Encounter) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV({ ...v, [k]: e.target.value });
  const setVital = (which: "vitals_initial" | "vitals_final", key: keyof Vitals, val: string) =>
    setV({ ...v, [which]: { ...asVitals(v[which]), [key]: val } });

  async function save() {
    setSaving(true);
    const { id: _i, owner_id: _o, created_at: _c, updated_at: _u, patient_id: _p, ...rest } = v!;
    const { error } = await supabase.from("encounters").update(rest).eq("id", encounterId);
    setSaving(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["encounters", patientId] });
    qc.invalidateQueries({ queryKey: ["encounter", encounterId] });
    toast.success("Sesión guardada");
  }

  const area = (k: keyof Encounter, rows = 4) => (
    <Textarea rows={rows} value={(v[k] as string) ?? ""} onChange={set(k)} />
  );

  const vitals = (which: "vitals_initial" | "vitals_final") => {
    const vv = asVitals(v[which]);
    return (
      <div className="overflow-hidden rounded-lg border">
        {VITAL_ROWS.map((r) => (
          <div key={r.label} className="grid grid-cols-[1fr_2fr] items-center gap-2 border-b px-3 py-2 last:border-0">
            <span className="text-sm font-medium">{r.label}</span>
            <div className="flex gap-2">
              {r.keys.map((k, i) => (
                <Input key={k} placeholder={r.placeholders[i]} value={vv[k] ?? ""} onChange={(e) => setVital(which, k, e.target.value)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost"><Link to="/pacientes/$patientId" params={{ patientId }}><ArrowLeft /> {patient?.full_name ?? "Paciente"}</Link></Button>
        <div className="flex gap-2">
          <Button asChild variant="outline"><Link to="/pacientes/$patientId/imprimir" params={{ patientId }} search={{ atencion: encounterId }}><Download /> Descargar PDF</Link></Button>
          <Button onClick={save} disabled={saving}><Save /> Guardar</Button>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-card">
        <div className="section-bar">Control del documento</div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Profesional / prestador y registro"><Input value={v.provider_info ?? ""} onChange={set("provider_info")} /></Field>
          <Field label="Servicios y modalidad inscritos en REPS"><Input value={v.reps_services ?? ""} onChange={set("reps_services")} /></Field>
          <Field label="Municipio / departamento"><Input value={v.location ?? ""} onChange={set("location")} /></Field>
        </div>

        <div className="section-bar">2. Datos de la atención</div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Fecha"><Input type="date" value={v.encounter_date} onChange={set("encounter_date")} /></Field>
          <Field label="Hora inicio"><Input type="time" value={v.start_time ?? ""} onChange={set("start_time")} /></Field>
          <Field label="Hora final"><Input type="time" value={v.end_time ?? ""} onChange={set("end_time")} /></Field>
        </div>
        <Field label="Tipo">
          <div className="flex flex-wrap gap-2">
            {ENCOUNTER_TYPES.map((t) => (
              <Button key={t} type="button" size="sm" variant={v.encounter_type === t ? "default" : "outline"} onClick={() => setV({ ...v, encounter_type: t })}>{t}</Button>
            ))}
          </div>
        </Field>
        <Field label="Servicio">
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => {
              const on = v.services.includes(s);
              return (
                <Button key={s} type="button" size="sm" variant={on ? "secondary" : "outline"}
                  onClick={() => setV({ ...v, services: on ? v.services.filter((x) => x !== s) : [...v.services, s] })}>{s}</Button>
              );
            })}
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Modalidad / dirección domiciliaria"><Input value={v.modality_address ?? ""} onChange={set("modality_address")} /></Field>
          <Field label="Profesional tratante / profesión / registro"><Input value={v.professional ?? ""} onChange={set("professional")} /></Field>
          <Field label="Remitente / diagnóstico médico / orden" className="sm:col-span-2"><Input value={v.referral ?? ""} onChange={set("referral")} /></Field>
        </div>

        <div className="section-bar">3. Motivo de consulta y enfermedad actual</div>{area("reason")}
        <div className="section-bar">4. Antecedentes relevantes</div>{area("history")}
        <div className="section-bar">5. Revisión por sistemas y signos de alarma</div>{area("systems_review")}
        <div className="section-bar">6. Evaluación objetiva — signos vitales iniciales (reposo)</div>{vitals("vitals_initial")}
        <div className="section-bar">7. Objetivos de tratamiento</div>{area("objectives")}
        <div className="section-bar">8. Evolución por sesión</div>{area("evolution", 6)}
        <div className="section-bar">8. Signos vitales finales</div>{vitals("vitals_final")}
        <div className="section-bar">9. Educación</div>{area("education")}
        <div className="section-bar">10. Observaciones</div>{area("observations")}

        <div className="flex justify-end"><Button onClick={save} disabled={saving}><Save /> Guardar sesión</Button></div>
      </div>
    </div>
  );
}

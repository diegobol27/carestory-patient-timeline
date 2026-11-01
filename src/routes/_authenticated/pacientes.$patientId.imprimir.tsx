import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import logo from "@/assets/logo.png.asset.json";
import { usePatient, useEncounters } from "@/lib/queries";
import { DOC_CODE, VITAL_ROWS, asVitals, calcAge, formatDate, type Encounter } from "@/lib/clinical";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/pacientes/$patientId/imprimir")({
  validateSearch: (s: Record<string, unknown>): { atencion?: string } => ({
    atencion: typeof s.atencion === "string" ? s.atencion : undefined,
  }),
  head: () => ({ meta: [{ title: "Historia clínica para imprimir" }] }),
  component: PrintPage,
});

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <tr className="border-b">
      <td className="w-1/3 bg-muted px-2 py-1 text-xs font-semibold">{k}</td>
      <td className="px-2 py-1 text-sm">{v || "—"}</td>
    </tr>
  );
}

function Block({ title, text }: { title: string; text: string | null }) {
  return (
    <div className="print-avoid mt-3">
      <div className="section-bar text-sm">{title}</div>
      <p className="min-h-8 px-2 py-2 text-sm whitespace-pre-wrap">{text || "—"}</p>
    </div>
  );
}

function VitalsTbl({ title, data }: { title: string; data: unknown }) {
  const v = asVitals(data);
  return (
    <div className="print-avoid mt-3">
      <div className="section-bar text-sm">{title}</div>
      <table className="mt-1 w-full border text-sm"><tbody>
        {VITAL_ROWS.map((r) => <Row key={r.label} k={r.label} v={r.keys.map((k) => v[k] || "—").join(" / ")} />)}
      </tbody></table>
    </div>
  );
}

function EncounterBlock({ e }: { e: Encounter }) {
  return (
    <section className="mt-6 break-before-page first:break-before-auto">
      <div className="section-bar text-sm">2. Datos de la atención</div>
      <table className="mt-1 w-full border"><tbody>
        <Row k="Fecha, hora y duración" v={`${formatDate(e.encounter_date)}  Inicio: ${e.start_time ?? "—"}  Final: ${e.end_time ?? "—"}`} />
        <Row k="Tipo" v={e.encounter_type} />
        <Row k="Modalidad / dirección domiciliaria" v={e.modality_address} />
        <Row k="Servicio" v={e.services.join(", ")} />
        <Row k="Remitente / diagnóstico médico / orden" v={e.referral} />
        <Row k="Profesional tratante / profesión / registro" v={e.professional} />
      </tbody></table>
      <Block title="3. Motivo de consulta y enfermedad actual" text={e.reason} />
      <Block title="4. Antecedentes relevantes" text={e.history} />
      <Block title="5. Revisión por sistemas y signos de alarma" text={e.systems_review} />
      <VitalsTbl title="6. Evaluación objetiva — signos vitales iniciales" data={e.vitals_initial} />
      <Block title="7. Objetivos de tratamiento" text={e.objectives} />
      <Block title="8. Evolución por sesión" text={e.evolution} />
      <VitalsTbl title="8. Signos vitales finales" data={e.vitals_final} />
      <Block title="9. Educación" text={e.education} />
      <Block title="10. Observaciones" text={e.observations} />
      <div className="print-avoid mt-10 grid grid-cols-2 gap-10 text-center text-xs">
        <div className="border-t pt-1">Firma profesional tratante<br />{e.professional}</div>
        <div className="border-t pt-1">Firma paciente / acudiente</div>
      </div>
    </section>
  );
}

function PrintPage() {
  const { patientId } = Route.useParams();
  const { atencion } = Route.useSearch();
  const { data: p } = usePatient(patientId);
  const { data: all = [] } = useEncounters(patientId);
  if (!p) return <p>Cargando…</p>;
  const list = atencion ? all.filter((e) => e.id === atencion) : [...all].reverse();
  const ctrl = list[0];

  return (
    <div>
      <div className="no-print mb-4 flex justify-between">
        <Button asChild variant="ghost"><Link to="/pacientes/$patientId" params={{ patientId }}><ArrowLeft /> Volver</Link></Button>
        <Button onClick={() => window.print()}><Printer /> Descargar PDF / Imprimir</Button>
      </div>
      <p className="no-print mb-4 text-xs text-muted-foreground">En la ventana de impresión elija “Guardar como PDF” para entregar el archivo al paciente.</p>
      <article className="mx-auto max-w-4xl bg-card p-8 shadow-card print:p-0 print:shadow-none">
        <header className="flex items-center justify-between gap-4 border-b-4 border-secondary pb-3">
          <img src={logo.url} alt="Servicios de Rehabilitación Cardio Pulmonar" className="h-24 w-auto" />
          <div className="text-right">
            <h1 className="text-xl font-bold text-primary">HISTORIA CLÍNICA DIGITAL</h1>
            <p className="text-xs text-secondary">Rehabilitación cardiopulmonar • Terapia respiratoria • Terapia física</p>
            <p className="mt-1 text-xs font-semibold text-heart">DOCUMENTO CONFIDENCIAL</p>
          </div>
        </header>
        <div className="mt-4 section-bar text-sm">Control del documento</div>
        <table className="mt-1 w-full border"><tbody>
          <Row k="Código / versión" v={DOC_CODE} />
          <Row k="Fecha de actualización" v={formatDate(new Date().toISOString())} />
          <Row k="Profesional / prestador y registro" v={ctrl?.provider_info} />
          <Row k="Servicios y modalidad inscritos en REPS" v={ctrl?.reps_services} />
          <Row k="Municipio / departamento" v={ctrl?.location} />
        </tbody></table>
        <div className="mt-4 section-bar text-sm">1. Identificación del paciente</div>
        <table className="mt-1 w-full border"><tbody>
          <Row k="N.º único de historia clínica" v={p.hc_number} />
          <Row k="Documento" v={`${p.doc_type === "Otro" ? p.doc_type_other ?? "Otro" : p.doc_type ?? ""} N.º ${p.doc_number ?? "—"}`} />
          <Row k="Nombre completo" v={p.full_name} />
          <Row k="Nacimiento / edad" v={`${formatDate(p.birth_date)}  Edad: ${calcAge(p.birth_date) ?? "—"}`} />
          <Row k="Sexo (si aplica)" v={p.sex} />
          <Row k="Dirección / municipio" v={[p.address, p.municipality].filter(Boolean).join(" — ")} />
          <Row k="Teléfono / correo" v={[p.phone, p.email].filter(Boolean).join(" — ")} />
          <Row k="Asegurador / régimen" v={p.insurer} />
          <Row k="Responsable / acudiente y contacto emergencia" v={`${p.guardian_name ?? "—"} · Parentesco: ${p.guardian_relation ?? "—"} · Tel.: ${p.guardian_phone ?? "—"}`} />
        </tbody></table>
        {list.length === 0 && <p className="mt-6 text-sm">Sin atenciones registradas.</p>}
        {list.map((e) => <EncounterBlock key={e.id} e={e} />)}
        <footer className="mt-8 border-t pt-2 text-center text-[10px] text-muted-foreground">
          Información sujeta a reserva legal (Ley 23 de 1981, Res. 1995 de 1999, Ley 1581 de 2012, Ley 2015 de 2020). Prohibida su divulgación sin autorización del paciente.
        </footer>
      </article>
    </div>
  );
}

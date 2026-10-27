import { useState } from "react";
import type { Patient, PatientInsert } from "@/lib/clinical";
import { DOC_TYPES, calcAge } from "@/lib/clinical";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  initial?: Partial<Patient>;
  submitLabel: string;
  onSubmit: (values: PatientInsert) => Promise<void> | void;
  busy?: boolean;
};

export function PatientForm({ initial = {}, submitLabel, onSubmit, busy }: Props) {
  const [v, setV] = useState<Partial<Patient>>(initial);
  const set = (k: keyof Patient) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value || null }));
  const age = calcAge(v.birth_date);

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!v.full_name?.trim()) return;
        const { id: _id, owner_id: _o, created_at: _c, updated_at: _u, ...rest } = v as Patient;
        onSubmit({ ...rest, full_name: v.full_name.trim() });
      }}
    >
      <div className="section-bar">1. Identificación del paciente</div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="N.º único de historia clínica"><Input value={v.hc_number ?? ""} onChange={set("hc_number")} /></Field>
        <Field label="Nombre completo *"><Input required value={v.full_name ?? ""} onChange={set("full_name")} /></Field>
        <div className="grid grid-cols-[8rem_1fr] gap-2">
          <Field label="Tipo documento">
            <select className="h-9 w-full rounded-md border border-input bg-card px-2 text-sm" value={v.doc_type ?? ""} onChange={set("doc_type")}>
              <option value="">—</option>
              {DOC_TYPES.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="N.º documento"><Input value={v.doc_number ?? ""} onChange={set("doc_number")} /></Field>
        </div>
        {v.doc_type === "Otro" ? (
          <Field label="¿Cuál otro documento?"><Input value={v.doc_type_other ?? ""} onChange={set("doc_type_other")} /></Field>
        ) : <div className="hidden sm:block" />}
        <div className="grid grid-cols-[1fr_6rem] gap-2">
          <Field label="Fecha de nacimiento"><Input type="date" value={v.birth_date ?? ""} onChange={set("birth_date")} /></Field>
          <Field label="Edad"><Input readOnly value={age ?? ""} className="bg-muted" /></Field>
        </div>
        <Field label="Sexo (si aplica)"><Input value={v.sex ?? ""} onChange={set("sex")} /></Field>
        <Field label="Dirección"><Input value={v.address ?? ""} onChange={set("address")} /></Field>
        <Field label="Municipio"><Input value={v.municipality ?? ""} onChange={set("municipality")} /></Field>
        <Field label="Teléfono"><Input value={v.phone ?? ""} onChange={set("phone")} /></Field>
        <Field label="Correo"><Input type="email" value={v.email ?? ""} onChange={set("email")} /></Field>
        <Field label="Asegurador / régimen (si aplica)" className="sm:col-span-2"><Input value={v.insurer ?? ""} onChange={set("insurer")} /></Field>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-primary">Responsable / acudiente y contacto de emergencia</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Nombre"><Input value={v.guardian_name ?? ""} onChange={set("guardian_name")} /></Field>
          <Field label="Parentesco"><Input value={v.guardian_relation ?? ""} onChange={set("guardian_relation")} /></Field>
          <Field label="Teléfono"><Input value={v.guardian_phone ?? ""} onChange={set("guardian_phone")} /></Field>
        </div>
      </div>
      <Button type="submit" disabled={busy}>{submitLabel}</Button>
    </form>
  );
}

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

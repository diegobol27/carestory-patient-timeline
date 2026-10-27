import type { Database } from "@/integrations/supabase/types";

export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type PatientInsert = Database["public"]["Tables"]["patients"]["Insert"];
export type Encounter = Database["public"]["Tables"]["encounters"]["Row"];
export type EncounterUpdate = Database["public"]["Tables"]["encounters"]["Update"];

export const DOC_TYPES = ["CC", "TI", "RC", "CE", "Pasaporte", "Otro"] as const;
export const ENCOUNTER_TYPES = ["Primera vez", "Seguimiento", "Reevaluación", "Egreso"] as const;
export const SERVICES = [
  "Rehabilitación cardiopulmonar",
  "Terapia respiratoria",
  "Terapia física",
] as const;

export type Vitals = {
  pa?: string;
  fc?: string;
  fr?: string;
  spo2?: string;
  o2?: string;
  temp?: string;
  dolor?: string;
  antropometria?: string;
};

export const VITAL_ROWS: { label: string; keys: (keyof Vitals)[]; placeholders: string[] }[] = [
  { label: "PA (mmHg)", keys: ["pa"], placeholders: ["120/80"] },
  { label: "FC (lpm) / FR (rpm)", keys: ["fc", "fr"], placeholders: ["FC", "FR"] },
  { label: "SpO₂ (%) y aire/O₂", keys: ["spo2", "o2"], placeholders: ["%", "Aire ambiente / O₂ L/min"] },
  { label: "Temperatura / dolor 0–10", keys: ["temp", "dolor"], placeholders: ["°C", "0–10"] },
  { label: "Peso/talla/IMC o glucemia (si aplica)", keys: ["antropometria"], placeholders: ["kg / cm / IMC / mg/dL"] },
];

export function asVitals(v: unknown): Vitals {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Vitals) : {};
}

/** Age in full years at a reference date (defaults to today). Returns null without birth date. */
export function calcAge(birthDate: string | null | undefined, at: Date = new Date()): number | null {
  if (!birthDate) return null;
  const [y, m, d] = birthDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  let age = at.getFullYear() - y;
  const beforeBirthday = at.getMonth() + 1 < m || (at.getMonth() + 1 === m && at.getDate() < d);
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/** Fields carried forward from the previous session when a new evolution is opened. */
export function carryForward(prev: Encounter | undefined): Partial<Encounter> {
  if (!prev) return { encounter_type: "Primera vez" };
  return {
    encounter_type: "Seguimiento",
    modality_address: prev.modality_address,
    services: prev.services,
    referral: prev.referral,
    professional: prev.professional,
    provider_info: prev.provider_info,
    reps_services: prev.reps_services,
    location: prev.location,
    history: prev.history,
    objectives: prev.objectives,
  };
}

export const DOC_CODE = "HC-RCP-01 / Versión 1.0";

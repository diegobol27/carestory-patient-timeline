# CareStory — Línea base de Supabase

**Proyecto:** HistoriasClinicasAPP  
**Project ID:** dvohsvrctrdwwbxwjlml  
**URL:** https://dvohsvrctrdwwbxwjlml.supabase.co  
**Fecha de referencia:** 2026-11-07

## 1. Propósito

Este documento registra la estructura conocida de la base de datos existente de CareStory. Se establece como referencia para controlar y documentar los cambios futuros.

Esta línea base es documental. No es una migración ejecutable y no debe aplicarse mediante `supabase db push`, ni utilizarse para reconstruir o sobrescribir la base de datos actual.

## 2. Tablas existentes

### public.patients

| Campo | Tipo |
|---|---|
| id | uuid |
| owner_id | uuid |
| hc_number | text |
| doc_type | text |
| doc_type_other | text |
| doc_number | text |
| full_name | text |
| birth_date | date |
| sex | text |
| address | text |
| municipality | text |
| phone | text |
| email | text |
| insurer | text |
| guardian_name | text |
| guardian_relation | text |
| guardian_phone | text |
| created_at | timestamptz |
| updated_at | timestamptz |

### public.encounters

| Campo | Tipo |
|---|---|
| id | uuid |
| patient_id | uuid |
| owner_id | uuid |
| encounter_date | date |
| start_time | text |
| end_time | text |
| encounter_type | text |
| modality_address | text |
| services | text[] |
| referral | text |
| professional | text |
| provider_info | text |
| reps_services | text |
| location | text |
| reason | text |
| history | text |
| systems_review | text |
| vitals_initial | jsonb |
| objectives | text |
| evolution | text |
| vitals_final | jsonb |
| education | text |
| observations | text |
| created_at | timestamptz |
| updated_at | timestamptz |

### public.profiles

| Campo | Tipo |
|---|---|
| id | uuid |
| full_name | text |
| profession | text |
| registro | text |
| created_at | timestamptz |
| updated_at | timestamptz |

## 3. Relaciones y restricciones

- `patients`: clave primaria `patients_pkey`.
- `encounters`: clave primaria `encounters_pkey`.
- `profiles`: clave primaria `profiles_pkey`.
- `encounters.patient_id` referencia `patients.id`, con eliminación en cascada.
- `profiles.id` referencia `auth.users.id`, con eliminación en cascada.
- Índice `encounters_patient_idx` sobre `(patient_id, encounter_date DESC)`.

## 4. Funciones y triggers identificados

Funciones:
- `public.handle_new_user()`.
- `public.touch_updated_at()`.

Triggers:
- `encounters_touch`: actualiza `updated_at` antes de actualizar un encuentro.
- `patients_touch`: actualiza `updated_at` antes de actualizar un paciente.

La función `handle_new_user()` existe. El disparador correspondiente en `auth.users` no se verificó en el volcado del esquema público.

## 5. Seguridad — estado observado

- RLS está habilitado en `patients`, `encounters` y `profiles`.
- Se identificaron cinco definiciones de políticas en el esquema público:
  - `patients`: una política.
  - `encounters`: una política.
  - `profiles`: tres políticas.

Este documento registra el estado observado. No implica aprobación para modificar políticas, permisos o estructura de seguridad.

## 6. Estado del sistema de migraciones

- El proyecto no tenía migraciones registradas en el historial de Supabase CLI al momento de la revisión.
- La estructura actual existe previamente al control de versiones de migraciones.
- Este documento constituye la referencia inicial, no una migración aplicada.
- La carpeta `supabase/migrations/` se reserva para cambios futuros, versionados y revisados.

## 7. Reglas para cambios futuros

1. No modificar directamente la estructura de producción desde Lovable.
2. Todo cambio estructural debe tener un archivo SQL de migración con fecha y descripción.
3. Revisar el SQL antes de ejecutarlo.
4. Obtener autorización antes de aplicar cualquier cambio en Supabase.
5. Realizar una copia de seguridad antes de cambios estructurales.
6. No ejecutar migraciones automáticamente desde GoDaddy.
7. No sobrescribir la configuración específica de GoDaddy.
8. Mantener la rama `main` para desarrollo y `preparacion-godaddy` para preparación de producción.
9. No crear ramas ni repositorios adicionales sin una decisión expresa.

## 8. Restricciones de esta línea base

No se realizaron modificaciones en tablas, registros, relaciones, políticas, permisos ni funciones de la base de datos.

La información corresponde al esquema consultado el 7 de noviembre de 2026. Cualquier cambio posterior deberá documentarse como una nueva versión.

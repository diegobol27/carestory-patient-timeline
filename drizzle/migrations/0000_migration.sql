CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  profession text,
  registro text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  hc_number text,
  doc_type text,
  doc_type_other text,
  doc_number text,
  full_name text NOT NULL,
  birth_date date,
  sex text,
  address text,
  municipality text,
  phone text,
  email text,
  insurer text,
  guardian_name text,
  guardian_relation text,
  guardian_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner all patients" ON public.patients FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER patients_touch BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.encounters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  encounter_date date NOT NULL DEFAULT current_date,
  start_time text,
  end_time text,
  encounter_type text,
  modality_address text,
  services text[] NOT NULL DEFAULT '{}',
  referral text,
  professional text,
  provider_info text,
  reps_services text,
  location text,
  reason text,
  history text,
  systems_review text,
  vitals_initial jsonb NOT NULL DEFAULT '{}'::jsonb,
  objectives text,
  evolution text,
  vitals_final jsonb NOT NULL DEFAULT '{}'::jsonb,
  education text,
  observations text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.encounters TO authenticated;
GRANT ALL ON public.encounters TO service_role;
ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner all encounters" ON public.encounters FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER encounters_touch BEFORE UPDATE ON public.encounters FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE INDEX encounters_patient_idx ON public.encounters(patient_id, encounter_date DESC);
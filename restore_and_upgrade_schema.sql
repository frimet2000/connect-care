-- ==========================================
-- COMPLETE SYSTEM RESTORATION & UPGRADE
-- ==========================================

-- 1. Create Enums (Idempotent)
DO $$ BEGIN
    CREATE TYPE public.profession_type AS ENUM ('speech_therapy', 'physiotherapy', 'occupational_therapy', 'nutrition', 'psychotherapy');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.age_range AS ENUM ('infant', 'toddler', 'child_young', 'child_old', 'teen', 'adult', 'senior');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Profiles Table (if missing)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('therapist', 'parent')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 3. Create Therapists Table (if missing)
CREATE TABLE IF NOT EXISTS public.therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  profession profession_type NOT NULL,
  license_number TEXT,
  years_experience INTEGER DEFAULT 0,
  bio TEXT,
  avatar_url TEXT,
  address TEXT,
  city TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  home_visits BOOLEAN DEFAULT false,
  home_visits_radius_km INTEGER,
  specializations TEXT[] DEFAULT '{}',
  session_duration_minutes INTEGER DEFAULT 45,
  health_funds TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on therapists
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Therapists are viewable by everyone" ON public.therapists FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert their own therapist profile" ON public.therapists FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update their own therapist profile" ON public.therapists FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

GRANT ALL ON public.therapists TO authenticated;
GRANT ALL ON public.therapists TO service_role;

-- 4. Create Therapist Schedules (The new dynamic table)
DROP TABLE IF EXISTS public.therapist_schedules CASCADE;

CREATE TABLE public.therapist_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
    weekly_schedule JSONB DEFAULT '[]'::jsonb,
    scheduling_mode TEXT DEFAULT 'slots',
    availability_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(therapist_id)
);

ALTER TABLE public.therapist_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view schedules" ON public.therapist_schedules
    FOR SELECT USING (true);

CREATE POLICY "Therapists can manage their own schedule" ON public.therapist_schedules
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM public.therapists WHERE id = therapist_id
    ));

GRANT ALL ON public.therapist_schedules TO authenticated;
GRANT SELECT ON public.therapist_schedules TO anon;
GRANT ALL ON public.therapist_schedules TO service_role;

-- 5. RPC Function
CREATE OR REPLACE FUNCTION public.save_therapist_schedule(
    p_therapist_id UUID,
    p_weekly_schedule JSONB,
    p_scheduling_mode TEXT,
    p_availability_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
    INSERT INTO public.therapist_schedules (
        therapist_id, 
        weekly_schedule, 
        scheduling_mode, 
        availability_text,
        updated_at
    )
    VALUES (
        p_therapist_id,
        p_weekly_schedule,
        p_scheduling_mode,
        p_availability_text,
        now()
    )
    ON CONFLICT (therapist_id) 
    DO UPDATE SET
        weekly_schedule = EXCLUDED.weekly_schedule,
        scheduling_mode = EXCLUDED.scheduling_mode,
        availability_text = EXCLUDED.availability_text,
        updated_at = now()
    RETURNING to_jsonb(therapist_schedules.*) INTO v_result;

    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_therapist_schedule TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_therapist_schedule TO service_role;

-- 6. Cache Reload
NOTIFY pgrst, 'reload schema';

-- MASTER SCHEMA REBUILD - Connect Care
-- This script safely rebuilds/upgrades the necessary tables and functions.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CORE TABLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    user_type TEXT DEFAULT 'patient',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.therapists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    profession TEXT NOT NULL,
    city TEXT,
    address TEXT,
    years_experience INTEGER,
    session_duration_minutes INTEGER DEFAULT 45,
    bio TEXT,
    license_number TEXT,
    avatar_url TEXT,
    specializations TEXT[],
    health_funds TEXT[],
    weekly_schedule JSONB DEFAULT '[]'::jsonb,
    availability_text TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.therapist_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
    weekly_schedule JSONB DEFAULT '[]'::jsonb,
    availability_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(therapist_id)
);

-- 3. PERMISSIONS & RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_schedules ENABLE ROW LEVEL SECURITY;

-- Profiles: Viewable by all, editable by owner
DROP POLICY IF EXISTS "Profiles select" ON public.profiles;
CREATE POLICY "Profiles select" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Profiles update" ON public.profiles;
CREATE POLICY "Profiles update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Therapists: Viewable by all, editable by owner
DROP POLICY IF EXISTS "Therapists select" ON public.therapists;
CREATE POLICY "Therapists select" ON public.therapists FOR SELECT USING (true);
DROP POLICY IF EXISTS "Therapists insert" ON public.therapists;
CREATE POLICY "Therapists insert" ON public.therapists FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Therapists update" ON public.therapists;
CREATE POLICY "Therapists update" ON public.therapists FOR UPDATE USING (auth.uid() = user_id);

-- Schedules: Viewable by all, editable by owner
DROP POLICY IF EXISTS "Schedules select" ON public.therapist_schedules;
CREATE POLICY "Schedules select" ON public.therapist_schedules FOR SELECT USING (true);
-- Insert/Update handled via RPC primarily, but policies needed for RPC
DROP POLICY IF EXISTS "Schedules update" ON public.therapist_schedules;
CREATE POLICY "Schedules update" ON public.therapist_schedules FOR ALL USING (
    EXISTS (SELECT 1 FROM public.therapists WHERE id = therapist_id AND user_id = auth.uid())
);

GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.therapists TO authenticated;
GRANT SELECT ON public.therapists TO anon;
GRANT ALL ON public.therapist_schedules TO authenticated;
GRANT SELECT ON public.therapist_schedules TO anon;

-- 4. RPC FUNCTION - The "Dynamic" and "Resilient" part
CREATE OR REPLACE FUNCTION public.save_full_therapist_profile(
    p_name TEXT,
    p_profession TEXT,
    p_city TEXT,
    p_address TEXT,
    p_bio TEXT,
    p_license_number TEXT,
    p_years_experience INTEGER,
    p_specializations TEXT[],
    p_session_duration INTEGER,
    p_health_funds TEXT[],
    p_avatar_url TEXT,
    p_weekly_schedule JSONB,
    p_availability_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_therapist_id UUID;
    v_result JSONB;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Update Profile
    UPDATE public.profiles SET full_name = p_name, updated_at = now() WHERE id = v_user_id;

    -- 2. Upsert Therapist
    INSERT INTO public.therapists (
        user_id, profession, city, address, bio, license_number, 
        years_experience, specializations, session_duration_minutes, 
        health_funds, avatar_url, weekly_schedule, availability_text, updated_at
    )
    VALUES (
        v_user_id, p_profession, p_city, p_address, p_bio, p_license_number,
        p_years_experience, p_specializations, p_session_duration,
        p_health_funds, p_avatar_url, p_weekly_schedule, p_availability_text, now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        profession = EXCLUDED.profession,
        city = EXCLUDED.city,
        address = EXCLUDED.address,
        bio = EXCLUDED.bio,
        license_number = EXCLUDED.license_number,
        years_experience = EXCLUDED.years_experience,
        specializations = EXCLUDED.specializations,
        session_duration_minutes = EXCLUDED.session_duration_minutes,
        health_funds = EXCLUDED.health_funds,
        avatar_url = EXCLUDED.avatar_url,
        weekly_schedule = EXCLUDED.weekly_schedule,
        availability_text = EXCLUDED.availability_text,
        updated_at = now()
    RETURNING id INTO v_therapist_id;

    -- 3. Sync to dedicated schedules table
    INSERT INTO public.therapist_schedules (therapist_id, weekly_schedule, availability_text, updated_at)
    VALUES (v_therapist_id, p_weekly_schedule, p_availability_text, now())
    ON CONFLICT (therapist_id) DO UPDATE SET
        weekly_schedule = EXCLUDED.weekly_schedule,
        availability_text = EXCLUDED.availability_text,
        updated_at = now();

    SELECT jsonb_build_object('success', true, 'therapist_id', v_therapist_id) INTO v_result;
    RETURN v_result;
END;
$$;

-- 5. RELOAD CACHE
NOTIFY pgrst, 'reload schema';

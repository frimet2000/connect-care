-- Create ENUM types if they don't exist (idempotent)
DO $$ BEGIN
    CREATE TYPE public.profession_type AS ENUM ('speech_therapy', 'physiotherapy', 'occupational_therapy', 'nutrition', 'psychotherapy');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.appointment_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.age_range AS ENUM ('toddlers', 'children', 'teens', 'adults', 'seniors');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure therapists table exists
CREATE TABLE IF NOT EXISTS public.therapists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    profession public.profession_type NOT NULL,
    city TEXT,
    address TEXT,
    years_experience INTEGER,
    session_duration_minutes INTEGER DEFAULT 45,
    bio TEXT,
    license_number TEXT,
    website TEXT,
    avatar_url TEXT,
    specializations TEXT[],
    target_audience TEXT[],
    languages TEXT[],
    availability_text TEXT,
    weekly_schedule JSONB DEFAULT '[]'::jsonb,
    home_visits BOOLEAN DEFAULT false,
    treats_remotely BOOLEAN DEFAULT false,
    accepts_btl BOOLEAN DEFAULT false,
    health_funds TEXT[],
    price_per_session INTEGER,
    instant_booking BOOLEAN DEFAULT false,
    available_today BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Create therapist_schedules table if not exists (Smart Dynamic Table)
CREATE TABLE IF NOT EXISTS public.therapist_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
    weekly_schedule JSONB DEFAULT '[]'::jsonb,
    availability_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(therapist_id)
);

-- Ensure scheduling_mode is removed if it exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'therapist_schedules' AND column_name = 'scheduling_mode') THEN
        ALTER TABLE public.therapist_schedules DROP COLUMN scheduling_mode;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapist_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Therapists are viewable by everyone" ON public.therapists;
CREATE POLICY "Therapists are viewable by everyone" ON public.therapists FOR SELECT USING (true);

DROP POLICY IF EXISTS "Therapists can insert their own data" ON public.therapists;
CREATE POLICY "Therapists can insert their own data" ON public.therapists FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Therapists can update own data" ON public.therapists;
CREATE POLICY "Therapists can update own data" ON public.therapists FOR UPDATE USING (auth.uid() = user_id);

-- RLS for therapist_schedules
DROP POLICY IF EXISTS "Schedules are viewable by everyone" ON public.therapist_schedules;
CREATE POLICY "Schedules are viewable by everyone" ON public.therapist_schedules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Therapists can insert their own schedule" ON public.therapist_schedules;
CREATE POLICY "Therapists can insert their own schedule" ON public.therapist_schedules FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.therapists WHERE id = therapist_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Therapists can update their own schedule" ON public.therapist_schedules;
CREATE POLICY "Therapists can update their own schedule" ON public.therapist_schedules FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.therapists WHERE id = therapist_id AND user_id = auth.uid())
);

-- Create RPC function for safe schedule saving
CREATE OR REPLACE FUNCTION public.save_therapist_schedule(
    p_therapist_id UUID,
    p_weekly_schedule JSONB,
    p_availability_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_schedule_id UUID;
    v_result JSONB;
BEGIN
    -- Check if user owns this therapist record
    IF NOT EXISTS (
        SELECT 1 FROM public.therapists 
        WHERE id = p_therapist_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Not authorized to update this schedule';
    END IF;

    -- Insert or Update
    INSERT INTO public.therapist_schedules (therapist_id, weekly_schedule, availability_text, updated_at)
    VALUES (p_therapist_id, p_weekly_schedule, p_availability_text, now())
    ON CONFLICT (therapist_id) 
    DO UPDATE SET 
        weekly_schedule = EXCLUDED.weekly_schedule,
        availability_text = EXCLUDED.availability_text,
        updated_at = now()
    RETURNING to_jsonb(public.therapist_schedules.*) INTO v_result;

    RETURN v_result;
END;
$$;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';

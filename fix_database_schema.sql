-- Fix database schema for ConnectCare application
-- This script adds missing tables and columns required by the application

-- 1. Add missing columns to therapists table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'therapists' AND column_name = 'weekly_schedule') THEN
        ALTER TABLE public.therapists ADD COLUMN weekly_schedule JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'therapists' AND column_name = 'availability_text') THEN
        ALTER TABLE public.therapists ADD COLUMN availability_text TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'therapists' AND column_name = 'scheduling_mode') THEN
        ALTER TYPE public.scheduling_mode AS ENUM ('slots', 'reception_days');
        ALTER TABLE public.therapists ADD COLUMN scheduling_mode scheduling_mode DEFAULT 'slots';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'therapists' AND column_name = 'reception_text') THEN
        ALTER TABLE public.therapists ADD COLUMN reception_text TEXT;
    END IF;
END $$;

-- 2. Add new values to profession_type enum if they don't exist
DO $$ 
BEGIN
    BEGIN
        ALTER TYPE public.profession_type ADD VALUE IF NOT EXISTS 'nutrition';
    EXCEPTION
        WHEN duplicate_object THEN null;
    END;

    BEGIN
        ALTER TYPE public.profession_type ADD VALUE IF NOT EXISTS 'psychotherapy';
    EXCEPTION
        WHEN duplicate_object THEN null;
    END;
END $$;

-- 3. Create the therapist_schedules table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.therapist_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
    weekly_schedule JSONB DEFAULT '[]'::jsonb,
    scheduling_mode TEXT DEFAULT 'slots',
    availability_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(therapist_id)
);

-- 4. Add RLS policies to ensure security for the therapist_schedules table
ALTER TABLE public.therapist_schedules ENABLE ROW LEVEL SECURITY;

-- Allow therapists to view and update their own schedule
CREATE POLICY "Therapists can view their own schedule" ON public.therapist_schedules
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM public.therapists WHERE id = therapist_id
    ));

CREATE POLICY "Therapists can insert their own schedule" ON public.therapist_schedules
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM public.therapists WHERE id = therapist_id
    ));

CREATE POLICY "Therapists can update their own schedule" ON public.therapist_schedules
    FOR UPDATE USING (auth.uid() IN (
        SELECT user_id FROM public.therapists WHERE id = therapist_id
    ));

-- Allow public read access for profiles
CREATE POLICY "Public can view schedules" ON public.therapist_schedules
    FOR SELECT USING (true);

-- 5. Grant access to authenticated users
GRANT ALL ON public.therapist_schedules TO authenticated;
GRANT SELECT ON public.therapist_schedules TO anon;

-- 6. Force schema cache reload
NOTIFY pgrst, 'reload schema';

-- 7. Verify the changes were applied
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('therapists', 'therapist_schedules')
    AND column_name IN ('weekly_schedule', 'availability_text', 'scheduling_mode', 'reception_text')
ORDER BY table_name, column_name;
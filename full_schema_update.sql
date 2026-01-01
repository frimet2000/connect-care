-- ==========================================
-- 1. ENUM UPDATES (Safe)
-- ==========================================
ALTER TYPE public.profession_type ADD VALUE IF NOT EXISTS 'nutrition';
ALTER TYPE public.profession_type ADD VALUE IF NOT EXISTS 'psychotherapy';

-- ==========================================
-- 2. TABLE RECONSTRUCTION
-- ==========================================
-- Drop existing table to start fresh (Data loss is expected per user request)
DROP TABLE IF EXISTS public.therapist_schedules CASCADE;

-- Create a robust, dynamic table for therapist schedules
-- Using JSONB for 'weekly_schedule' allows flexible structure changes without schema migration
CREATE TABLE public.therapist_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
    
    -- Core schedule data stored as JSONB for maximum flexibility
    weekly_schedule JSONB DEFAULT '[]'::jsonb,
    
    -- Configuration fields
    scheduling_mode TEXT DEFAULT 'slots', -- 'slots' | 'on_request'
    availability_text TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Ensure one schedule per therapist
    UNIQUE(therapist_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.therapist_schedules ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies

-- Public View Policy
CREATE POLICY "Public can view schedules" ON public.therapist_schedules
    FOR SELECT USING (true);

-- Therapist Manage Policy
CREATE POLICY "Therapists can manage their own schedule" ON public.therapist_schedules
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM public.therapists WHERE id = therapist_id
    ));

-- Grant Permissions
GRANT ALL ON public.therapist_schedules TO authenticated;
GRANT SELECT ON public.therapist_schedules TO anon;
GRANT ALL ON public.therapist_schedules TO service_role;

-- ==========================================
-- 3. RPC FUNCTION (Secure Save)
-- ==========================================
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
    -- Perform Upsert
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.save_therapist_schedule TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_therapist_schedule TO service_role;

-- ==========================================
-- 4. CACHE RELOAD
-- ==========================================
NOTIFY pgrst, 'reload schema';

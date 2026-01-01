-- Drop existing tables to start fresh
DROP TABLE IF EXISTS public.therapist_schedules CASCADE;

-- Create a robust, dynamic table for therapist schedules
-- Using JSONB for 'weekly_schedule' allows flexible structure changes without schema migration
CREATE TABLE public.therapist_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
    
    -- Core schedule data stored as JSONB for maximum flexibility
    -- Structure: Array of { day: string, slots: string[], active: boolean, ... }
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

-- 1. View Policy: Anyone can view schedules (public profile)
CREATE POLICY "Public can view schedules" ON public.therapist_schedules
    FOR SELECT USING (true);

-- 2. Manage Policy: Therapists can manage ONLY their own schedule
-- Uses a simple check against auth.uid() matching the linked therapist's user_id
CREATE POLICY "Therapists can manage their own schedule" ON public.therapist_schedules
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM public.therapists WHERE id = therapist_id
    ));

-- Grant Permissions
GRANT ALL ON public.therapist_schedules TO authenticated;
GRANT SELECT ON public.therapist_schedules TO anon;
GRANT ALL ON public.therapist_schedules TO service_role;

-- Force Schema Cache Reload (Critical for PostgREST visibility)
NOTIFY pgrst, 'reload schema';

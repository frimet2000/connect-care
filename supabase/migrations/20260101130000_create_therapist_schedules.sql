-- Create a new table for therapist schedules to ensure dynamic data persistence
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

-- Add RLS policies to ensure security
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

-- Grant access to authenticated users
GRANT ALL ON public.therapist_schedules TO authenticated;
GRANT SELECT ON public.therapist_schedules TO anon;

-- Drop the table if it exists (forcing cleanup)
DROP TABLE IF EXISTS public.therapist_schedules CASCADE;

-- Recreate the table
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

-- Enable RLS
ALTER TABLE public.therapist_schedules ENABLE ROW LEVEL SECURITY;

-- Recreate Policies
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

CREATE POLICY "Public can view schedules" ON public.therapist_schedules
    FOR SELECT USING (true);

-- Grant Permissions
GRANT ALL ON public.therapist_schedules TO authenticated;
GRANT SELECT ON public.therapist_schedules TO anon;
GRANT ALL ON public.therapist_schedules TO service_role;

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';

-- 1. Create the missing therapist_schedules table
CREATE TABLE IF NOT EXISTS public.therapist_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id UUID NOT NULL REFERENCES public.therapists(id) ON DELETE CASCADE,
    weekly_schedule JSONB DEFAULT '[]'::jsonb,
    availability_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(therapist_id)
);

-- 2. Add missing columns to the main therapists table (as a redundant fallback)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'therapists' AND column_name = 'weekly_schedule') THEN
        ALTER TABLE public.therapists ADD COLUMN weekly_schedule JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'therapists' AND column_name = 'availability_text') THEN
        ALTER TABLE public.therapists ADD COLUMN availability_text TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'therapists' AND column_name = 'is_active') THEN
        ALTER TABLE public.therapists ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. Enable RLS and Grant Permissions
ALTER TABLE public.therapist_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Schedules are viewable by everyone" ON public.therapist_schedules;
CREATE POLICY "Schedules are viewable by everyone" ON public.therapist_schedules FOR SELECT USING (true);

DROP POLICY IF EXISTS "Therapists can manage their own schedule" ON public.therapist_schedules;
CREATE POLICY "Therapists can manage their own schedule" ON public.therapist_schedules 
FOR ALL USING (
    EXISTS (SELECT 1 FROM public.therapists WHERE id = therapist_id AND user_id = auth.uid())
);

GRANT ALL ON public.therapist_schedules TO authenticated;
GRANT SELECT ON public.therapist_schedules TO anon;
GRANT ALL ON public.therapist_schedules TO service_role;

-- 4. Reload the PostgREST schema cache
NOTIFY pgrst, 'reload schema';

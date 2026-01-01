-- 1. Ensure columns exist (running again to be 100% sure)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'therapists' AND column_name = 'weekly_schedule') THEN
        ALTER TABLE public.therapists ADD COLUMN weekly_schedule JSONB DEFAULT '[]'::jsonb;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'therapists' AND column_name = 'availability_text') THEN
        ALTER TABLE public.therapists ADD COLUMN availability_text TEXT;
    END IF;
END $$;

-- 2. Ensure permissions are explicit for these tables
GRANT ALL ON public.therapists TO authenticated;
GRANT ALL ON public.therapists TO service_role;
GRANT ALL ON public.therapist_schedules TO authenticated;
GRANT ALL ON public.therapist_schedules TO service_role;

-- 3. FORCE PostgREST cache reload (Aggressive)
-- This is the critical part to fix the 404/400 cache errors
NOTIFY pgrst, 'reload schema';

-- 4. Verification Check
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'therapists' 
AND column_name IN ('weekly_schedule', 'availability_text');

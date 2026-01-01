-- 1. Physically "vibrate" the therapists table to force cache invalidation
ALTER TABLE public.therapists RENAME COLUMN availability_text TO availability_text_temp;
ALTER TABLE public.therapists RENAME COLUMN availability_text_temp TO availability_text;

ALTER TABLE public.therapists RENAME COLUMN weekly_schedule TO weekly_schedule_temp;
ALTER TABLE public.therapists RENAME COLUMN weekly_schedule_temp TO weekly_schedule;

-- 2. Grant permissions again (just to be safe)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;

-- 3. Trigger multiple reload notifications
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');

-- 4. Verify again in the same transaction
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'therapists' 
AND column_name IN ('weekly_schedule', 'availability_text');

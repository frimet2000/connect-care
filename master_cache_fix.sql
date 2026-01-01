-- 1. Create a physical change that PostgREST cannot ignore
ALTER TABLE public.therapists ADD COLUMN IF NOT EXISTS pgrst_force_refresh text;
ALTER TABLE public.therapists DROP COLUMN pgrst_force_refresh;

-- 2. Ensure ALL permissions are correct for EVERY role
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 3. Double reload
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');

-- 4. Verification Check
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'therapists' 
AND column_name IN ('weekly_schedule', 'availability_text');

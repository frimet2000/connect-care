-- 1. Create a "tickle" table to force schema cache invalidation
CREATE TABLE IF NOT EXISTS public.pgrst_tickle (id int);
DROP TABLE public.pgrst_tickle;

-- 2. Grant explicit permissions again, just in case
GRANT ALL ON public.therapists TO authenticated;
GRANT ALL ON public.therapists TO anon;
GRANT ALL ON public.therapists TO service_role;

GRANT ALL ON public.therapist_schedules TO authenticated;
GRANT ALL ON public.therapist_schedules TO anon;
GRANT ALL ON public.therapist_schedules TO service_role;

-- 3. The standard reload notification
NOTIFY pgrst, 'reload schema';

-- 4. Final verification of the specific column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'therapists' 
AND column_name = 'availability_text';

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';

-- Verify table permissions just in case
GRANT ALL ON public.therapist_schedules TO authenticated;
GRANT SELECT ON public.therapist_schedules TO anon;
GRANT ALL ON public.therapist_schedules TO service_role;

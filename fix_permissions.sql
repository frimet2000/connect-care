
-- Grant permissions to ensure the table is accessible
GRANT ALL ON public.therapist_schedules TO authenticated;
GRANT SELECT ON public.therapist_schedules TO anon;
GRANT ALL ON public.therapist_schedules TO service_role;

-- Reload the schema cache to ensure PostgREST sees the new table
NOTIFY pgrst, 'reload schema';

-- Force schema cache reload explicitly
NOTIFY pgrst, 'reload schema';

-- Verify table existence
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'therapist_schedules'
);

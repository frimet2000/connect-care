-- Run this to see exactly what columns exist in your table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'therapists' 
AND table_schema = 'public'
ORDER BY column_name;

-- Also check if the schedules table actually exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'therapist_schedules'
);

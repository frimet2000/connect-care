-- Check if the function exists and see its signature
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname ILIKE '%save_therapist_profile%';

-- Check permissions on the function
SELECT 
    routine_name, 
    grantee, 
    privilege_type
FROM information_schema.routine_privileges 
WHERE routine_name ILIKE '%save_therapist_profile%';

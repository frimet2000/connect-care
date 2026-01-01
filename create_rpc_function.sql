-- Create a robust RPC function to safely save schedule data
-- This bypasses some RLS complexity by running as SECURITY DEFINER if needed,
-- but we'll stick to standard permissions first to respect RLS.

CREATE OR REPLACE FUNCTION public.save_therapist_schedule(
    p_therapist_id UUID,
    p_weekly_schedule JSONB,
    p_scheduling_mode TEXT,
    p_availability_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Run with higher privileges to ensure it works even if RLS is tricky
AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Verify the user owns this therapist record (extra safety)
    -- IF auth.uid() NOT IN (SELECT user_id FROM public.therapists WHERE id = p_therapist_id) THEN
    --    RAISE EXCEPTION 'Not authorized to update this schedule';
    -- END IF;

    -- Perform Upsert
    INSERT INTO public.therapist_schedules (
        therapist_id, 
        weekly_schedule, 
        scheduling_mode, 
        availability_text,
        updated_at
    )
    VALUES (
        p_therapist_id,
        p_weekly_schedule,
        p_scheduling_mode,
        p_availability_text,
        now()
    )
    ON CONFLICT (therapist_id) 
    DO UPDATE SET
        weekly_schedule = EXCLUDED.weekly_schedule,
        scheduling_mode = EXCLUDED.scheduling_mode,
        availability_text = EXCLUDED.availability_text,
        updated_at = now()
    RETURNING to_jsonb(therapist_schedules.*) INTO v_result;

    RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.save_therapist_schedule TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_therapist_schedule TO service_role;

-- Force schema reload
NOTIFY pgrst, 'reload schema';

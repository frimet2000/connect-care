-- Create a v2 RPC function to bypass potential cache issues with the previous name
CREATE OR REPLACE FUNCTION public.update_therapist_schedule_v2(
    p_therapist_id UUID,
    p_weekly_schedule JSONB,
    p_scheduling_mode TEXT,
    p_availability_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSONB;
BEGIN
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
GRANT EXECUTE ON FUNCTION public.update_therapist_schedule_v2 TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_therapist_schedule_v2 TO service_role;

-- Force schema reload
NOTIFY pgrst, 'reload schema';

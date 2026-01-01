-- 1. Create a function that accepts ONE unnamed JSONB parameter
-- This is a special PostgREST feature that bypasses parameter naming issues.
CREATE OR REPLACE FUNCTION public.save_therapist_profile_final(params jsonb)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_therapist_id UUID;
    v_result JSONB;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 1. Update Profile (Name)
    UPDATE public.profiles 
    SET full_name = (params->>'p_name'), 
        updated_at = now() 
    WHERE id = v_user_id;

    -- 2. Upsert Therapist
    INSERT INTO public.therapists (
        user_id, profession, city, address, bio, license_number, 
        years_experience, specializations, session_duration_minutes, 
        health_funds, avatar_url, weekly_schedule, availability_text, updated_at
    )
    VALUES (
        v_user_id, 
        (params->>'p_profession'), 
        (params->>'p_city'), 
        (params->>'p_address'), 
        (params->>'p_bio'), 
        (params->>'p_license_number'),
        (params->>'p_years_experience')::INTEGER, 
        ARRAY(SELECT jsonb_array_elements_text(params->'p_specializations')), 
        (params->>'p_session_duration')::INTEGER,
        ARRAY(SELECT jsonb_array_elements_text(params->'p_health_funds')), 
        (params->>'p_avatar_url'), 
        (params->'p_weekly_schedule'), 
        (params->>'p_availability_text'), 
        now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        profession = EXCLUDED.profession,
        city = EXCLUDED.city,
        address = EXCLUDED.address,
        bio = EXCLUDED.bio,
        license_number = EXCLUDED.license_number,
        years_experience = EXCLUDED.years_experience,
        specializations = EXCLUDED.specializations,
        session_duration_minutes = EXCLUDED.session_duration_minutes,
        health_funds = EXCLUDED.health_funds,
        avatar_url = EXCLUDED.avatar_url,
        weekly_schedule = EXCLUDED.weekly_schedule,
        availability_text = EXCLUDED.availability_text,
        updated_at = now()
    RETURNING id INTO v_therapist_id;

    -- 3. Sync to schedules table
    INSERT INTO public.therapist_schedules (therapist_id, weekly_schedule, availability_text, updated_at)
    VALUES (v_therapist_id, (params->'p_weekly_schedule'), (params->>'p_availability_text'), now())
    ON CONFLICT (therapist_id) DO UPDATE SET
        weekly_schedule = EXCLUDED.weekly_schedule,
        availability_text = EXCLUDED.availability_text,
        updated_at = now();

    SELECT jsonb_build_object('success', true, 'therapist_id', v_therapist_id) INTO v_result;
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Internal error in saved function: %', SQLERRM;
END;
$$;

-- 2. Grant Permissions
GRANT EXECUTE ON FUNCTION public.save_therapist_profile_final TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_therapist_profile_final TO anon;
GRANT EXECUTE ON FUNCTION public.save_therapist_profile_final TO service_role;

-- 3. Force reload
NOTIFY pgrst, 'reload schema';

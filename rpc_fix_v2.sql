-- 1. Rename the function to force a clean cache entry
CREATE OR REPLACE FUNCTION public.save_therapist_profile_v4(
    p_name TEXT,
    p_profession TEXT,
    p_city TEXT,
    p_address TEXT,
    p_bio TEXT,
    p_license_number TEXT,
    p_years_experience INTEGER,
    p_specializations TEXT[],
    p_session_duration INTEGER,
    p_health_funds TEXT[],
    p_avatar_url TEXT,
    p_weekly_schedule JSONB,
    p_availability_text TEXT
)
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

    -- Update Profile
    UPDATE public.profiles SET full_name = p_name, updated_at = now() WHERE id = v_user_id;

    -- Upsert Therapist
    INSERT INTO public.therapists (
        user_id, profession, city, address, bio, license_number, 
        years_experience, specializations, session_duration_minutes, 
        health_funds, avatar_url, weekly_schedule, availability_text, updated_at
    )
    VALUES (
        v_user_id, p_profession, p_city, p_address, p_bio, p_license_number,
        p_years_experience, p_specializations, p_session_duration,
        p_health_funds, p_avatar_url, p_weekly_schedule, p_availability_text, now()
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

    -- Sync to dedicated schedules table
    INSERT INTO public.therapist_schedules (therapist_id, weekly_schedule, availability_text, updated_at)
    VALUES (v_therapist_id, p_weekly_schedule, p_availability_text, now())
    ON CONFLICT (therapist_id) DO UPDATE SET
        weekly_schedule = EXCLUDED.weekly_schedule,
        availability_text = EXCLUDED.availability_text,
        updated_at = now();

    SELECT jsonb_build_object('success', true, 'therapist_id', v_therapist_id) INTO v_result;
    RETURN v_result;
END;
$$;

-- 2. EXPLICIT PERMISSIONS (CRITICAL)
GRANT EXECUTE ON FUNCTION public.save_therapist_profile_v4 TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_therapist_profile_v4 TO anon;
GRANT EXECUTE ON FUNCTION public.save_therapist_profile_v4 TO service_role;

-- 3. Force reload
NOTIFY pgrst, 'reload schema';

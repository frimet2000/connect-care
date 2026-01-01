-- Add new values to profession_type enum
-- PostgreSQL doesn't support adding multiple values in one transaction easily inside a migration if not careful, 
-- but we can use ALTER TYPE.
ALTER TYPE public.profession_type ADD VALUE IF NOT EXISTS 'nutrition';
ALTER TYPE public.profession_type ADD VALUE IF NOT EXISTS 'psychotherapy';

-- Create scheduling_mode enum
CREATE TYPE public.scheduling_mode AS ENUM ('slots', 'reception_days');

-- Add scheduling_mode column to therapists table
ALTER TABLE public.therapists 
ADD COLUMN scheduling_mode scheduling_mode DEFAULT 'slots';

-- Add reception_text column for manual description of availability (optional, for reception_days mode)
ALTER TABLE public.therapists
ADD COLUMN reception_text TEXT;

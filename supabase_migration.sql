-- Enable JSONB support if not already enabled (standard in Postgres)
-- Add new columns to therapists table

ALTER TABLE public.therapists 
ADD COLUMN IF NOT EXISTS weekly_schedule JSONB,
ADD COLUMN IF NOT EXISTS scheduling_mode TEXT DEFAULT 'slots',
ADD COLUMN IF NOT EXISTS availability_text TEXT;

-- Update profession_type enum
ALTER TYPE public.profession_type ADD VALUE IF NOT EXISTS 'nutrition';
ALTER TYPE public.profession_type ADD VALUE IF NOT EXISTS 'psychotherapy';

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'therapists' 
  AND column_name IN ('weekly_schedule', 'scheduling_mode', 'availability_text');

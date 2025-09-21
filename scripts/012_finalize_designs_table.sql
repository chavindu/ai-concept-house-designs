-- Add missing columns to designs table
-- Run this in your Supabase SQL editor

-- Add missing columns
ALTER TABLE public.designs 
ADD COLUMN IF NOT EXISTS specifications jsonb,
ADD COLUMN IF NOT EXISTS description_en text,
ADD COLUMN IF NOT EXISTS description_si text,
ADD COLUMN IF NOT EXISTS is_watermarked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS perspective text DEFAULT 'front';

-- Update the points_cost default to 1 (it's currently 10)
ALTER TABLE public.designs ALTER COLUMN points_cost SET DEFAULT 1;

-- Verify the updated structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'designs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

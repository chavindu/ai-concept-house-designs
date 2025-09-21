-- Add missing columns to designs table if they don't exist
-- Run this in your Supabase SQL editor

-- Add building_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'designs' 
        AND column_name = 'building_type'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.designs ADD COLUMN building_type text;
    END IF;
END $$;

-- Add thumbnail_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'designs' 
        AND column_name = 'thumbnail_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.designs ADD COLUMN thumbnail_url text;
    END IF;
END $$;

-- Check the current structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'designs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

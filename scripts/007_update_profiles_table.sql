-- Add missing columns to existing profiles table
-- Run this if you already have a profiles table

-- Add daily_points_claimed column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'daily_points_claimed'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN daily_points_claimed date;
    END IF;
END $$;

-- Add language_preference column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'language_preference'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN language_preference text default 'en' check (language_preference in ('en', 'si'));
    END IF;
END $$;

-- Update default points to 10 for new users (if needed)
-- This only affects new users, existing users keep their current points
ALTER TABLE public.profiles ALTER COLUMN points SET DEFAULT 10;

-- Update the trigger function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, points, daily_points_claimed, language_preference)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    10, -- Free users get 10 lifetime points
    NULL, -- No daily points claimed yet
    'en' -- Default language
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

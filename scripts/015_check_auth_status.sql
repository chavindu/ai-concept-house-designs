-- Check if users exist in auth.users table
-- Run this in your Supabase SQL Editor

-- Check auth users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- Check if profiles exist for these users
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.points,
  u.email as auth_email,
  u.created_at as auth_created_at,
  u.email_confirmed_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

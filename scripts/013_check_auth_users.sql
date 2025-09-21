-- Check auth users and create test users
-- Run this in your Supabase SQL Editor

-- Check if there are any users in auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- If no users exist, you need to create them through Supabase Dashboard or API
-- The profiles table only stores additional user data, not authentication credentials

-- To create a test user, you can either:
-- 1. Use Supabase Dashboard > Authentication > Users > Add User
-- 2. Use the registration form in your app
-- 3. Use Supabase Admin API (requires service role key)

-- Check if the trigger is working to create profiles automatically
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.points,
  u.email as auth_email,
  u.created_at as auth_created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC;

-- Create test users for development
-- Run this in your Supabase SQL Editor

-- Note: You cannot directly insert into auth.users table
-- You need to use Supabase Dashboard or Admin API

-- Method 1: Use Supabase Dashboard
-- Go to Authentication > Users > Add User
-- Create users with these credentials:

-- Test User 1:
-- Email: admin@bitlab.lk
-- Password: admin123
-- Email Confirmed: Yes

-- Test User 2:
-- Email: chavindu@bitlab.lk  
-- Password: chavindu123
-- Email Confirmed: Yes

-- Method 2: Use Admin API (if you have service role key)
-- You can create users programmatically using the Admin API

-- Method 3: Use the registration form
-- Go to /auth/register and create new accounts

-- After creating users in auth.users, the trigger should automatically create profiles
-- Check if the trigger is working:
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

-- Check if tables exist and their structure
-- Run this in your Supabase SQL editor to verify the setup

-- Check if profiles table exists
select 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns 
where table_name = 'profiles' 
and table_schema = 'public'
order by ordinal_position;

-- Check if designs table exists
select 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns 
where table_name = 'designs' 
and table_schema = 'public'
order by ordinal_position;

-- Check if points_transactions table exists
select 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns 
where table_name = 'points_transactions' 
and table_schema = 'public'
order by ordinal_position;

-- Check RLS policies
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies 
where schemaname = 'public'
order by tablename, policyname;

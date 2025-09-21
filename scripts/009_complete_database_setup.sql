-- Complete database setup script
-- Run this in your Supabase SQL editor

-- 1. Create profiles table (if not exists)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  points integer default 10,
  role text default 'user'::text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  daily_points_claimed date,
  language_preference text default 'en'::text
);

-- 2. Create designs table
create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  prompt text not null,
  style text,
  building_type text,
  specifications jsonb,
  image_url text,
  thumbnail_url text,
  description_en text,
  description_si text,
  is_public boolean default false,
  is_watermarked boolean default false,
  status text default 'generating' check (status in ('generating', 'completed', 'failed')),
  points_cost integer default 1,
  perspective text default 'front',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create points_transactions table
create table if not exists public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  type text not null check (type in ('earned', 'purchased', 'deduction')),
  description text,
  reference_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.designs enable row level security;
alter table public.points_transactions enable row level security;

-- 5. Create RLS policies for profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- 6. Create RLS policies for designs
create policy "designs_select_own" on public.designs for select using (auth.uid() = user_id);
create policy "designs_select_public" on public.designs for select using (is_public = true);
create policy "designs_insert_own" on public.designs for insert with check (auth.uid() = user_id);
create policy "designs_update_own" on public.designs for update using (auth.uid() = user_id);
create policy "designs_delete_own" on public.designs for delete using (auth.uid() = user_id);

-- 7. Create RLS policies for points_transactions
create policy "points_transactions_select_own" on public.points_transactions for select using (auth.uid() = user_id);
create policy "points_transactions_insert_own" on public.points_transactions for insert with check (auth.uid() = user_id);

-- 8. Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- 9. Create trigger for new user registration
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. Insert some sample data for testing
insert into public.designs (
  user_id,
  title,
  prompt,
  style,
  building_type,
  image_url,
  thumbnail_url,
  description_en,
  description_si,
  is_public,
  is_watermarked,
  status
) values (
  (select id from auth.users limit 1),
  'Sample Modern House',
  'A beautiful modern house design',
  'Modern',
  'residential',
  '/modern-house.png',
  '/modern-house.png',
  'A stunning modern house with clean lines and contemporary design',
  'නවීන රේඛා සහ නවීන නිර්මාණයක් සහිත අලංකාර නවීන ගෘහයක්',
  true,
  false,
  'completed'
) on conflict do nothing;

-- 11. Create indexes for better performance
create index if not exists idx_designs_user_id on public.designs(user_id);
create index if not exists idx_designs_is_public on public.designs(is_public);
create index if not exists idx_designs_status on public.designs(status);
create index if not exists idx_points_transactions_user_id on public.points_transactions(user_id);

-- 12. Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on public.profiles to anon, authenticated;
grant all on public.designs to anon, authenticated;
grant all on public.points_transactions to anon, authenticated;

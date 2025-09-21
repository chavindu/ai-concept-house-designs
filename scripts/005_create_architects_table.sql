-- Create architects table for architect profiles
create table if not exists public.architects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  bio text,
  specializations text[] default '{}',
  location text,
  experience_years integer default 0,
  rating numeric(3,2) default 0.0,
  hourly_rate integer default 0,
  calendly_url text,
  portfolio_images text[] default '{}',
  certifications text[] default '{}',
  languages text[] default '{}',
  is_verified boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.architects enable row level security;

-- Create policies
create policy "architects_select_all"
  on public.architects for select
  using (is_active = true);

create policy "architects_insert_own"
  on public.architects for insert
  with check (auth.uid() = user_id);

create policy "architects_update_own"
  on public.architects for update
  using (auth.uid() = user_id);

-- Create consultations table for booking tracking
create table if not exists public.consultations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  architect_id uuid not null references public.architects(id) on delete cascade,
  consultation_date timestamp with time zone,
  duration_minutes integer default 60,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes text,
  meeting_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for consultations
alter table public.consultations enable row level security;

-- Create policies for consultations
create policy "consultations_select_own"
  on public.consultations for select
  using (auth.uid() = user_id);

create policy "consultations_insert_own"
  on public.consultations for insert
  with check (auth.uid() = user_id);

create policy "consultations_update_own"
  on public.consultations for update
  using (auth.uid() = user_id);

-- Create architect reviews table
create table if not exists public.architect_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  architect_id uuid not null references public.architects(id) on delete cascade,
  consultation_id uuid references public.consultations(id) on delete set null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, architect_id, consultation_id)
);

-- Enable RLS for reviews
alter table public.architect_reviews enable row level security;

-- Create policies for reviews
create policy "architect_reviews_select_all"
  on public.architect_reviews for select
  using (true);

create policy "architect_reviews_insert_own"
  on public.architect_reviews for insert
  with check (auth.uid() = user_id);

create policy "architect_reviews_update_own"
  on public.architect_reviews for update
  using (auth.uid() = user_id);

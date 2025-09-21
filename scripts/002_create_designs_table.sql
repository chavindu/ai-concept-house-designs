-- Create designs table for storing generated house designs
create table if not exists public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  prompt text not null,
  style text,
  image_url text,
  is_public boolean default false,
  points_cost integer default 10,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.designs enable row level security;

-- Create policies
create policy "designs_select_own"
  on public.designs for select
  using (auth.uid() = user_id);

create policy "designs_select_public"
  on public.designs for select
  using (is_public = true);

create policy "designs_insert_own"
  on public.designs for insert
  with check (auth.uid() = user_id);

create policy "designs_update_own"
  on public.designs for update
  using (auth.uid() = user_id);

create policy "designs_delete_own"
  on public.designs for delete
  using (auth.uid() = user_id);

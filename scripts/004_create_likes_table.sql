-- Create likes table for design interactions
create table if not exists public.design_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  design_id uuid not null references public.designs(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, design_id)
);

-- Enable RLS
alter table public.design_likes enable row level security;

-- Create policies
create policy "design_likes_select_all"
  on public.design_likes for select
  using (true);

create policy "design_likes_insert_own"
  on public.design_likes for insert
  with check (auth.uid() = user_id);

create policy "design_likes_delete_own"
  on public.design_likes for delete
  using (auth.uid() = user_id);

-- Add likes count function
create or replace function get_design_likes_count(design_id uuid)
returns integer
language sql
stable
as $$
  select count(*)::integer
  from public.design_likes
  where design_likes.design_id = $1;
$$;

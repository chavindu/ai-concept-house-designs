-- Create points transactions table for tracking point usage
create table if not exists public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  type text not null check (type in ('earned', 'deduction', 'purchased')),
  description text,
  reference_id uuid, -- Can reference designs, payments, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.points_transactions enable row level security;

-- Create policies
create policy "points_transactions_select_own"
  on public.points_transactions for select
  using (auth.uid() = user_id);

create policy "points_transactions_insert_own"
  on public.points_transactions for insert
  with check (auth.uid() = user_id);

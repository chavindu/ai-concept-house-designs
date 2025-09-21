-- Create payments table for tracking point purchases
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null,
  amount integer not null, -- Amount in cents/paisa
  points integer not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'cancelled')),
  payment_method text default 'payhere',
  payhere_payment_id text,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.payments enable row level security;

-- Create policies
create policy "payments_select_own"
  on public.payments for select
  using (auth.uid() = user_id);

create policy "payments_insert_own"
  on public.payments for insert
  with check (auth.uid() = user_id);

-- Admin can view all payments
create policy "payments_select_admin"
  on public.payments for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'superadmin')
    )
  );

-- Create payment analytics view for admins
create or replace view public.payment_analytics as
select
  date_trunc('day', created_at) as date,
  count(*) as total_payments,
  count(*) filter (where status = 'completed') as successful_payments,
  sum(amount) filter (where status = 'completed') as total_revenue,
  sum(points) filter (where status = 'completed') as total_points_sold
from public.payments
group by date_trunc('day', created_at)
order by date desc;

-- Grant access to payment analytics for admins
grant select on public.payment_analytics to authenticated;

-- Create RLS policy for payment analytics
create policy "payment_analytics_admin_only"
  on public.payment_analytics for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'superadmin')
    )
  );

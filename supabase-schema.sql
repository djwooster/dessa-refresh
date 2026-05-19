-- Run this in Supabase SQL Editor

create table if not exists yearly_setups (
  id uuid primary key default gen_random_uuid(),
  is_default boolean not null default true,
  group_name text,
  year text not null default '2025-2026',
  window_count int not null,
  dates text[] not null,
  assessment_type text not null check (assessment_type in ('screener', 'full')),
  conditional_assignment boolean not null default true,
  t_score text not null default '40',
  reset_behavior text not null default 'rescreen' check (reset_behavior in ('rescreen', 'skip')),
  same_config_all_windows boolean not null default true,
  site_leader_manage boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists yearly_setup_sites (
  id uuid primary key default gen_random_uuid(),
  setup_id uuid references yearly_setups(id) on delete cascade,
  site_name text not null
);

create table if not exists yearly_setup_window_configs (
  id uuid primary key default gen_random_uuid(),
  setup_id uuid references yearly_setups(id) on delete cascade,
  window_index int not null,
  conditional_assignment boolean not null default true,
  t_score text not null default '40',
  reset_behavior text not null default 'rescreen' check (reset_behavior in ('rescreen', 'skip'))
);

-- Allow all operations (no auth yet — lock down with RLS once auth is added)
alter table yearly_setups enable row level security;
alter table yearly_setup_sites enable row level security;
alter table yearly_setup_window_configs enable row level security;

create policy "allow all" on yearly_setups for all using (true) with check (true);
create policy "allow all" on yearly_setup_sites for all using (true) with check (true);
create policy "allow all" on yearly_setup_window_configs for all using (true) with check (true);

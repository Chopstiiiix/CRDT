-- ============================================================
-- RoyalTrack — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up all tables.
-- ============================================================

-- 1. Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  name          text,
  avatar_url    text,
  currency      text default 'USD',
  notif_payments    boolean default true,
  notif_statements  boolean default true,
  notif_news        boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile"   on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- 2. PRO Connections
create table if not exists pro_connections (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  pro_id          text not null,
  account_id_enc  text not null,
  account_id_iv   text not null,
  account_id_tag  text not null,
  last_synced_at  timestamptz,
  created_at      timestamptz default now(),
  unique(user_id, pro_id)
);

alter table pro_connections enable row level security;
create policy "Users can view own PROs"   on pro_connections for select using (auth.uid() = user_id);
create policy "Users can insert own PROs" on pro_connections for insert with check (auth.uid() = user_id);
create policy "Users can delete own PROs" on pro_connections for delete using (auth.uid() = user_id);

-- 3. Monthly Royalty Data
create table if not exists royalty_monthly (
  id              uuid primary key default gen_random_uuid(),
  connection_id   uuid not null references pro_connections(id) on delete cascade,
  month           text not null,
  performance     integer default 0,
  mechanical      integer default 0,
  sync            integer default 0,
  digital         integer default 0
);

alter table royalty_monthly enable row level security;
create policy "Users can view own royalties" on royalty_monthly for select
  using (connection_id in (select id from pro_connections where user_id = auth.uid()));

-- 4. Catalogue Works
create table if not exists catalogue_works (
  id              uuid primary key default gen_random_uuid(),
  connection_id   uuid not null references pro_connections(id) on delete cascade,
  title           text not null,
  iswc            text,
  registered      text,
  writers         integer default 1,
  total_earned    numeric default 0,
  last_payment    numeric default 0,
  status          text check (status in ('active', 'pending', 'inactive')) default 'active',
  usage_type      text check (usage_type in ('Performance', 'Mechanical', 'Sync', 'Digital'))
);

alter table catalogue_works enable row level security;
create policy "Users can view own catalogue" on catalogue_works for select
  using (connection_id in (select id from pro_connections where user_id = auth.uid()));

-- 5. Statements
create table if not exists statements (
  id                      uuid primary key default gen_random_uuid(),
  connection_id           uuid not null references pro_connections(id) on delete cascade,
  period                  text not null,
  issued                  text,
  total                   numeric default 0,
  status                  text check (status in ('paid', 'processing')) default 'processing',
  breakdown_performance   integer default 0,
  breakdown_mechanical    integer default 0,
  breakdown_sync          integer default 0,
  breakdown_digital       integer default 0
);

alter table statements enable row level security;
create policy "Users can view own statements" on statements for select
  using (connection_id in (select id from pro_connections where user_id = auth.uid()));

-- 6. Top Countries
create table if not exists top_countries (
  id              uuid primary key default gen_random_uuid(),
  connection_id   uuid not null references pro_connections(id) on delete cascade,
  country_name    text not null,
  pct             integer default 0
);

alter table top_countries enable row level security;
create policy "Users can view own countries" on top_countries for select
  using (connection_id in (select id from pro_connections where user_id = auth.uid()));

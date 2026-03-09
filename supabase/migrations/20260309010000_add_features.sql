-- ============================================================
-- Feature migration: co-writer splits, sync licensing, currencies
-- ============================================================

-- Co-writer splits per catalogue work
create table if not exists co_writer_splits (
  id              uuid primary key default gen_random_uuid(),
  work_id         uuid not null references catalogue_works(id) on delete cascade,
  writer_name     text not null,
  role            text check (role in ('Composer', 'Lyricist', 'Arranger', 'Publisher')) default 'Composer',
  split_pct       numeric not null check (split_pct >= 0 and split_pct <= 100),
  pro_affiliation text,
  ipi_number      text
);

alter table co_writer_splits enable row level security;
create policy "Users can view own splits" on co_writer_splits for select
  using (work_id in (
    select cw.id from catalogue_works cw
    join pro_connections pc on cw.connection_id = pc.id
    where pc.user_id = auth.uid()
  ));

-- Sync licensing tracker
create table if not exists sync_licenses (
  id              uuid primary key default gen_random_uuid(),
  connection_id   uuid not null references pro_connections(id) on delete cascade,
  work_title      text not null,
  licensee        text not null,
  project_type    text check (project_type in ('Film', 'TV', 'Commercial', 'Video Game', 'Trailer', 'Web/Streaming', 'Other')) default 'Other',
  territory       text default 'Worldwide',
  fee             numeric default 0,
  currency        text default 'USD',
  start_date      text,
  end_date        text,
  status          text check (status in ('active', 'pending', 'expired', 'negotiating')) default 'pending',
  notes           text,
  created_at      timestamptz default now()
);

alter table sync_licenses enable row level security;
create policy "Users can view own licenses" on sync_licenses for select
  using (connection_id in (select id from pro_connections where user_id = auth.uid()));

-- Add email notification preferences to profiles
alter table profiles add column if not exists email_notif_payments boolean default true;
alter table profiles add column if not exists email_notif_threshold numeric default 0;

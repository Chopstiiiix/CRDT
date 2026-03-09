-- ============================================================
-- Admin system: role column + suspended flag on profiles
-- ============================================================

alter table profiles add column if not exists role text default 'user' check (role in ('user', 'admin'));
alter table profiles add column if not exists suspended boolean default false;
alter table profiles add column if not exists suspended_reason text;
alter table profiles add column if not exists suspended_at timestamptz;

-- Set admin for the owner
update profiles set role = 'admin' where email = 'malcolmolagundoye@gmail.com';

-- Allow admin to read all profiles (bypass RLS via service key on backend)
-- The backend uses supabaseAdmin (service role) so RLS is bypassed for admin routes.

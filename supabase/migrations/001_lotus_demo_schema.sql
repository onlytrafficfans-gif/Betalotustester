-- LOTUS App Builder demo schema
-- Run this in the Supabase SQL editor for the project configured by
-- VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  theme_mode text not null default 'dark' check (theme_mode in ('dark', 'light')),
  has_seen_hints boolean not null default false,
  api_keys jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Untitled App',
  schema jsonb,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  content text,
  size bigint not null default 0,
  type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_skills (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  prompt text not null default '',
  category text not null default 'custom',
  type text not null default 'skill',
  tags jsonb not null default '[]'::jsonb,
  icon text not null default 'Zap',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id, user_id)
);

create table if not exists public.skill_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_id text not null,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
alter table public.projects enable row level security;
alter table public.user_files enable row level security;
alter table public.user_skills enable row level security;
alter table public.skill_usage enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can delete own profile" on public.user_profiles;
create policy "Users can delete own profile"
  on public.user_profiles for delete
  using (auth.uid() = id);

drop policy if exists "Users can read own projects" on public.projects;
create policy "Users can read own projects"
  on public.projects for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own projects" on public.projects;
create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own projects" on public.projects;
create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own projects" on public.projects;
create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own files" on public.user_files;
create policy "Users can read own files"
  on public.user_files for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own files" on public.user_files;
create policy "Users can insert own files"
  on public.user_files for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own files" on public.user_files;
create policy "Users can update own files"
  on public.user_files for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own files" on public.user_files;
create policy "Users can delete own files"
  on public.user_files for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own skills" on public.user_skills;
create policy "Users can read own skills"
  on public.user_skills for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own skills" on public.user_skills;
create policy "Users can insert own skills"
  on public.user_skills for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own skills" on public.user_skills;
create policy "Users can update own skills"
  on public.user_skills for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own skills" on public.user_skills;
create policy "Users can delete own skills"
  on public.user_skills for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own skill usage" on public.skill_usage;
create policy "Users can insert own skill usage"
  on public.skill_usage for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own skill usage" on public.skill_usage;
create policy "Users can read own skill usage"
  on public.skill_usage for select
  using (auth.uid() = user_id);

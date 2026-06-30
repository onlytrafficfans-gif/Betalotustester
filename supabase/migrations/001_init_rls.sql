-- Migration: 001_init_rls
-- Enables Row Level Security on all user-owned tables and adds
-- policies that restrict every query to the authenticated owner.
-- Must be applied BEFORE granting any anon/public access.

-- ============================================================
-- user_profiles
-- ============================================================
ALTER TABLE IF EXISTS public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Only the owning user may read their own profile row.
CREATE POLICY "user_profiles: owner select"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Only the owning user may update their own profile row.
CREATE POLICY "user_profiles: owner update"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only the owning user may insert their own profile row.
-- (Usually handled by a trigger; kept here for safety.)
CREATE POLICY "user_profiles: owner insert"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Deletes are blocked by default (no policy = deny).


-- ============================================================
-- projects
-- ============================================================
ALTER TABLE IF EXISTS public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects: owner select"
  ON public.projects
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "projects: owner insert"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects: owner update"
  ON public.projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects: owner delete"
  ON public.projects
  FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================================
-- user_files
-- ============================================================
ALTER TABLE IF EXISTS public.user_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_files: owner select"
  ON public.user_files
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_files: owner insert"
  ON public.user_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_files: owner update"
  ON public.user_files
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_files: owner delete"
  ON public.user_files
  FOR DELETE
  USING (auth.uid() = user_id);

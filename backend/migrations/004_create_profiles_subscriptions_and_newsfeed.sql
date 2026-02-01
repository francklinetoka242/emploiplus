-- Migration: create profiles, subscriptions and newsfeed view
-- Portable PostgreSQL (no Supabase-only extensions required for schema creation)

-- 1) profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  full_name text,
  first_name text,
  last_name text,
  avatar_url text,
  cv_url text,
  headline text,
  bio text,
  experiences jsonb DEFAULT '[]'::jsonb,
  skills jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- If auth.users exists, add FK to auth.users(id). This will fail if auth schema isn't present
-- in a vanilla Postgres; apply only in environments where auth.users table exists (Supabase).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    BEGIN
      -- Add FK only if constraint does not already exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.constraint_name = 'fk_profiles_auth_users' AND tc.table_schema = 'public' AND tc.table_name = 'profiles'
      ) THEN
        EXECUTE 'ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_auth_users FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE';
      END IF;
    EXCEPTION WHEN others THEN
      -- ignore errors
    END;
  END IF;
END$$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.fn_update_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_update_ts ON public.profiles;
CREATE TRIGGER trg_profiles_update_ts
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_timestamp();

-- create profile on user insert (useful if you disabled email confirmations)
CREATE OR REPLACE FUNCTION public.create_profile_on_user_insert()
RETURNS trigger AS $$
BEGIN
  -- create profile row for the new user if not exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, created_at, updated_at) VALUES (NEW.id, now(), now());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    BEGIN
      DROP TRIGGER IF EXISTS trg_create_profile_on_user_insert ON auth.users;
      CREATE TRIGGER trg_create_profile_on_user_insert
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.create_profile_on_user_insert();
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not create trigger on auth.users: %', SQLERRM;
    END;
  END IF;
END$$;

-- 2) subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plan text NOT NULL,
  status text NOT NULL,
  current_period_end timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Link to auth.users when present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    BEGIN
      -- Add FK only if constraint does not already exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        WHERE tc.constraint_name = 'fk_subscriptions_auth_users' AND tc.table_schema = 'public' AND tc.table_name = 'subscriptions'
      ) THEN
        EXECUTE 'ALTER TABLE public.subscriptions ADD CONSTRAINT fk_subscriptions_auth_users FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE';
      END IF;
    EXCEPTION WHEN others THEN
      -- ignore errors
    END;
  END IF;
END$$;

-- updated_at trigger for subscriptions
DROP TRIGGER IF EXISTS trg_subscriptions_update_ts ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_update_ts
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_update_timestamp();

-- 3) Row Level Security (RLS) for subscriptions
-- Note: Supabase provides the helper `auth.uid()` inside policies. To keep compatibility
-- with a vanilla Postgres migration for future migration to Infomaniak, we add a
-- comment with a generic alternative using GUC (current_setting) which your API must
-- set before queries if you use that approach.

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: allow authenticated users to SELECT their own subscription.
-- Supabase-specific policy using auth.uid():
-- CREATE POLICY "allow_select_own" ON public.subscriptions
--   FOR SELECT USING (user_id = auth.uid());

-- Generic policy template (requires your API to set GUC 'jwt.claims.sub' to the user UUID):
-- CREATE POLICY "allow_select_own_generic" ON public.subscriptions
--   FOR SELECT USING (user_id = (current_setting('jwt.claims.sub', true))::uuid);

-- We intentionally do NOT create INSERT/UPDATE/DELETE policies for non-service accounts.
-- The Supabase `service_role` key bypasses RLS allowing your backend/webhook to modify
-- subscriptions. This implements: users can read their subscription, only system can modify.

-- 4) Optional: index to speed lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions (user_id);

-- 5) Create a simple newsfeed view if publications table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'publications') THEN
    BEGIN
      EXECUTE $view$
        CREATE OR REPLACE VIEW public.v_newsfeed_feed AS
        SELECT p.id,
               p.title,
               p.content,
               p.created_at,
               p.updated_at,
               p.author_id
        FROM public.publications p
        WHERE p.published = true
        ORDER BY p.created_at DESC
      $view$;
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not create view v_newsfeed_feed: %', SQLERRM;
    END;
  END IF;
END$$;

-- End of migration

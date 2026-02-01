-- Migration: create profiles table and trigger to sync auth.users -> public.profiles
-- Apply this in Supabase SQL Editor (Dashboard > SQL Editor)

-- 1) Create profiles table (id is UUID matching auth.users.id)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  user_type text,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2) Create function to insert into profiles when a new auth.user is created
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger AS $$
BEGIN
  -- Insert a lightweight profile row; ignore conflicts
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Create trigger on auth.users (Supabase managed auth schema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_handle_auth_user_created'
  ) THEN
    CREATE TRIGGER trigger_handle_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();
  END IF;
END$$;

-- 4) Optionally: grant minimal rights
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- END

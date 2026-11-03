-- ============================================================================
-- MANA Venues Auth & User Profile Trigger Fix & Backfill
-- Paste and Run in Supabase SQL Editor: https://supabase.com/dashboard/project/efhmmsprizhptpecllrh/sql
-- ============================================================================

-- 1. Ensure public schema permissions are open to Supabase auth roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 2. Clean up & configure profiles table policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone (authenticated or anon) to read profiles (needed for auditoriums & reviews)
DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
DROP POLICY IF EXISTS profiles_own_select ON public.profiles;
CREATE POLICY profiles_select_all ON public.profiles
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Allow authenticated users to insert their own profile
DROP POLICY IF EXISTS profiles_insert_policy ON public.profiles;
CREATE POLICY profiles_insert_policy ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() OR auth.uid() IS NULL);

-- Allow authenticated users to update their own profile
DROP POLICY IF EXISTS profiles_own_update ON public.profiles;
CREATE POLICY profiles_own_update ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 3. Replace handle_new_user with explicit public schema qualification & search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = CASE 
      WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name 
      ELSE public.profiles.full_name 
    END,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone);
    
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Prevent user signup from blocking if profile insert encounters edge case
  RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. Re-bind Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Backfill existing users who signed up before the trigger was fixed
INSERT INTO public.profiles (id, email, full_name, phone, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
  raw_user_meta_data->>'phone',
  COALESCE(raw_user_meta_data->>'role', 'customer')
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET
  full_name = CASE 
    WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name 
    ELSE public.profiles.full_name 
  END,
  phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

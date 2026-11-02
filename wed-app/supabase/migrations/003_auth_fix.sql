-- ============================================================================
-- WedBook Auth & User Profile Trigger Fix
-- Safe & idempotent script for Supabase SQL Editor
-- ============================================================================

-- 1. Ensure public schema permissions are open to Supabase auth roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 2. Explicit Policy to allow profile insertion
DROP POLICY IF EXISTS profiles_insert_policy ON public.profiles;
CREATE POLICY profiles_insert_policy ON public.profiles
  FOR INSERT
  WITH CHECK (true);

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
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
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


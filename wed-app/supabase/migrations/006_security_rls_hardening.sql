-- =============================================================================
-- Migration: 006_security_rls_hardening.sql
-- Description:
--   1. Prevent privilege escalation via `profiles.role` self-update
--   2. Enforce strict IDOR ownership on `availability_blocks`, `bookings`, `auditoriums`
--   3. Enforce `role = 'admin'` on admin-only operations via `is_admin()`
-- =============================================================================

-- 1. Authoritative Admin Helper (reads `profiles.role`, never client `user_metadata`)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 2. Profiles: Users can read/update only their own profile and CANNOT change `role`
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_own_select ON public.profiles;
CREATE POLICY profiles_own_select ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS profiles_own_update ON public.profiles;
CREATE POLICY profiles_own_update ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND (
      public.is_admin()
      OR role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    )
  );

DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_admin_all ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Bookings: Strict IDOR protection using `auth.uid()`
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS bookings_customer_select ON public.bookings;
CREATE POLICY bookings_customer_select ON public.bookings
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS bookings_customer_insert ON public.bookings;
CREATE POLICY bookings_customer_insert ON public.bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS bookings_vendor_select ON public.bookings;
CREATE POLICY bookings_vendor_select ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    auditorium_id IN (
      SELECT id FROM public.auditoriums WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS bookings_admin_all ON public.bookings;
CREATE POLICY bookings_admin_all ON public.bookings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Availability Blocks: Fix cross-vendor IDOR (vendors can only modify their own venues)
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS availability_blocks_vendor_insert ON public.availability_blocks;
CREATE POLICY availability_blocks_vendor_insert ON public.availability_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    status = 'blocked_external'
    AND (
      vendor_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.auditoriums
        WHERE id = availability_blocks.vendor_id
          AND owner_id = auth.uid()
      )
      OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS availability_blocks_vendor_delete ON public.availability_blocks;
CREATE POLICY availability_blocks_vendor_delete ON public.availability_blocks
  FOR DELETE
  TO authenticated
  USING (
    status = 'blocked_external'
    AND (
      vendor_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.auditoriums
        WHERE id = availability_blocks.vendor_id
          AND owner_id = auth.uid()
      )
      OR public.is_admin()
    )
  );

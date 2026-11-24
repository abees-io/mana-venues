-- =============================================================================
-- Migration: 005_date_booking_and_ical_sync.sql
-- Description: Date-booking, atomic double-booking lock, and 2-way iCal sync
-- Timezone convention: Pure DATE ('YYYY-MM-DD') in Asia/Kolkata (IST)
-- =============================================================================

-- 1. Add iCal synchronization columns to auditoriums (listings)
ALTER TABLE public.auditoriums
  ADD COLUMN IF NOT EXISTS ical_import_url TEXT,
  ADD COLUMN IF NOT EXISTS ical_last_synced_at TIMESTAMPTZ;

-- Also add to profiles in case vendor operates as an artisan/planner/service vendor
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ical_import_url TEXT,
  ADD COLUMN IF NOT EXISTS ical_last_synced_at TIMESTAMPTZ;

-- 2. Create availability_blocks table
CREATE TABLE IF NOT EXISTS public.availability_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL, -- references auditorium id or vendor profile id
  event_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('held', 'booked', 'blocked_external')),
  booking_id UUID,
  hold_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_vendor_event_date UNIQUE (vendor_id, event_date)
);

CREATE INDEX IF NOT EXISTS idx_availability_blocks_vendor_date
  ON public.availability_blocks (vendor_id, event_date);

CREATE INDEX IF NOT EXISTS idx_availability_blocks_status
  ON public.availability_blocks (status);

CREATE INDEX IF NOT EXISTS idx_availability_blocks_hold_expires
  ON public.availability_blocks (hold_expires_at)
  WHERE status = 'held';

-- 3. Row Level Security (RLS)
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;

-- 3.1 Public SELECT policy:
-- Anyone can see blocks so calendar can disable dates, but only reveals vendor_id, event_date, status
DROP POLICY IF EXISTS availability_blocks_public_select ON public.availability_blocks;
CREATE POLICY availability_blocks_public_select ON public.availability_blocks
  FOR SELECT
  USING (true);

-- 3.2 Authenticated vendor INSERT:
-- Vendors can block dates manually or via external iCal for venues they own or their own vendor ID
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
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'vendor')
      )
    )
  );

-- 3.3 Authenticated vendor DELETE:
-- Vendors can unblock their own blocked_external rows
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
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- 3.4 Service role full access
DROP POLICY IF EXISTS availability_blocks_service_role ON public.availability_blocks;
CREATE POLICY availability_blocks_service_role ON public.availability_blocks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Atomic Double-Booking Lock RPC Function
-- Holds dates for 15 minutes. If ANY date is already booked, blocked_external,
-- or holds an active unexpired hold, rolls back the entire transaction.
DROP FUNCTION IF EXISTS public.hold_booking_dates(uuid, date[], uuid);
DROP FUNCTION IF EXISTS public.hold_booking_dates(uuid, date[]);
DROP FUNCTION IF EXISTS public.hold_booking_dates;

CREATE OR REPLACE FUNCTION public.hold_booking_dates(
  p_vendor_id UUID,
  p_dates DATE[],
  p_booking_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date DATE;
  v_existing_status TEXT;
  v_hold_expires TIMESTAMPTZ;
  v_conflicts DATE[] := ARRAY[]::DATE[];
  v_now TIMESTAMPTZ := now();
  v_new_expires TIMESTAMPTZ := now() + interval '15 minutes';
BEGIN
  -- Basic validation
  IF p_dates IS NULL OR array_length(p_dates, 1) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No dates provided for booking hold'
    );
  END IF;

  -- 1. Check every date in p_dates for active collision
  FOREACH v_date IN ARRAY p_dates LOOP
    SELECT status, hold_expires_at
      INTO v_existing_status, v_hold_expires
      FROM public.availability_blocks
      WHERE vendor_id = p_vendor_id
        AND event_date = v_date
      FOR UPDATE; -- Row-level lock to prevent race conditions

    IF FOUND THEN
      -- If it's booked or blocked_external, it's definitely a conflict
      IF v_existing_status IN ('booked', 'blocked_external') THEN
        v_conflicts := array_append(v_conflicts, v_date);
      -- If it's held by another booking and hasn't expired yet, it's a conflict
      ELSIF v_existing_status = 'held' AND v_hold_expires > v_now THEN
        v_conflicts := array_append(v_conflicts, v_date);
      END IF;
    END IF;
  END LOOP;

  -- If any conflicting date was found, abort atomically and return conflict details
  IF array_length(v_conflicts, 1) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'One or more requested dates are already booked or held',
      'conflicts', v_conflicts
    );
  END IF;

  -- 2. Clear out any expired holds for these specific dates first
  DELETE FROM public.availability_blocks
  WHERE vendor_id = p_vendor_id
    AND event_date = ANY(p_dates)
    AND status = 'held'
    AND hold_expires_at <= v_now;

  -- 3. Upsert / Insert the new 15-minute 'held' records
  FOREACH v_date IN ARRAY p_dates LOOP
    INSERT INTO public.availability_blocks (
      vendor_id,
      event_date,
      status,
      booking_id,
      hold_expires_at,
      created_at
    )
    VALUES (
      p_vendor_id,
      v_date,
      'held',
      p_booking_id,
      v_new_expires,
      v_now
    )
    ON CONFLICT (vendor_id, event_date)
    DO UPDATE SET
      status = 'held',
      booking_id = EXCLUDED.booking_id,
      hold_expires_at = EXCLUDED.hold_expires_at,
      created_at = EXCLUDED.created_at;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'hold_expires_at', v_new_expires,
    'held_dates', p_dates,
    'vendor_id', p_vendor_id,
    'booking_id', p_booking_id
  );
END;
$$;

-- Grant execution to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.hold_booking_dates(UUID, DATE[], UUID) TO anon, authenticated, service_role;

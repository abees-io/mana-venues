-- WedBook Initial Schema Migration
-- Idempotent script for Supabase SQL Editor

-- ============================================================================
-- Section 1: Extensions
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Section 2: Profiles Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- Section 3: Cities Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL DEFAULT 'Kerala',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- Section 4: Auditoriums Table & Indexes
-- ============================================================================
CREATE TABLE IF NOT EXISTS auditoriums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  seating_capacity INT NOT NULL DEFAULT 0,
  floating_capacity INT DEFAULT 0,
  base_price_per_day NUMERIC(12,2) NOT NULL DEFAULT 0,
  photos JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auditoriums_city ON auditoriums(city_id);
CREATE INDEX IF NOT EXISTS idx_auditoriums_owner ON auditoriums(owner_id);
CREATE INDEX IF NOT EXISTS idx_auditoriums_verified ON auditoriums(verified);

-- ============================================================================
-- Section 5: Pricing Slots Table & Indexes
-- ============================================================================
CREATE TABLE IF NOT EXISTS pricing_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditorium_id UUID NOT NULL REFERENCES auditoriums(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  custom_price NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
  UNIQUE(auditorium_id, date)
);

CREATE INDEX IF NOT EXISTS idx_pricing_slots_auditorium_date ON pricing_slots(auditorium_id, date);

-- ============================================================================
-- Section 6: Bookings Table & Indexes
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  auditorium_id UUID REFERENCES auditoriums(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  advance_paid NUMERIC(12,2) DEFAULT 0,
  booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled')),
  payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_auditorium ON bookings(auditorium_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);

-- ============================================================================
-- Section 7: Enable Row-Level Security (RLS)
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoriums ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Section 8: Helper Function for Admin Check
-- ============================================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- Section 9: Row-Level Security Policies (DROP IF EXISTS + CREATE)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Cities Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS cities_public_select ON cities;
CREATE POLICY cities_public_select ON cities
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS cities_admin_all ON cities;
CREATE POLICY cities_admin_all ON cities
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ----------------------------------------------------------------------------
-- Auditoriums Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS auditoriums_public_select ON auditoriums;
CREATE POLICY auditoriums_public_select ON auditoriums
  FOR SELECT
  USING (verified = true);

DROP POLICY IF EXISTS auditoriums_vendor_select ON auditoriums;
CREATE POLICY auditoriums_vendor_select ON auditoriums
  FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS auditoriums_vendor_update ON auditoriums;
CREATE POLICY auditoriums_vendor_update ON auditoriums
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS auditoriums_vendor_insert ON auditoriums;
CREATE POLICY auditoriums_vendor_insert ON auditoriums
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS auditoriums_admin_all ON auditoriums;
CREATE POLICY auditoriums_admin_all ON auditoriums
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ----------------------------------------------------------------------------
-- Pricing Slots Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS pricing_slots_public_select ON pricing_slots;
CREATE POLICY pricing_slots_public_select ON pricing_slots
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS pricing_slots_vendor_insert ON pricing_slots;
CREATE POLICY pricing_slots_vendor_insert ON pricing_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auditorium_id IN (
      SELECT id FROM auditoriums WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS pricing_slots_vendor_update ON pricing_slots;
CREATE POLICY pricing_slots_vendor_update ON pricing_slots
  FOR UPDATE
  TO authenticated
  USING (
    auditorium_id IN (
      SELECT id FROM auditoriums WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    auditorium_id IN (
      SELECT id FROM auditoriums WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS pricing_slots_vendor_delete ON pricing_slots;
CREATE POLICY pricing_slots_vendor_delete ON pricing_slots
  FOR DELETE
  TO authenticated
  USING (
    auditorium_id IN (
      SELECT id FROM auditoriums WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS pricing_slots_admin_all ON pricing_slots;
CREATE POLICY pricing_slots_admin_all ON pricing_slots
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ----------------------------------------------------------------------------
-- Profiles Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_own_select ON profiles;
CREATE POLICY profiles_own_select ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_own_update ON profiles;
CREATE POLICY profiles_own_update ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS profiles_admin_all ON profiles;
CREATE POLICY profiles_admin_all ON profiles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ----------------------------------------------------------------------------
-- Bookings Policies
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS bookings_customer_select ON bookings;
CREATE POLICY bookings_customer_select ON bookings
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS bookings_customer_insert ON bookings;
CREATE POLICY bookings_customer_insert ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS bookings_vendor_select ON bookings;
CREATE POLICY bookings_vendor_select ON bookings
  FOR SELECT
  TO authenticated
  USING (
    auditorium_id IN (
      SELECT id FROM auditoriums WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS bookings_admin_all ON bookings;
CREATE POLICY bookings_admin_all ON bookings
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- Section 10: Auto-create Profile on Auth Sign Up Trigger
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

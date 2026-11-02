---
phase: 1
plan: 2
wave: 1
depends_on: []
files_modified:
  - wed-app/supabase/migrations/001_initial_schema.sql
autonomous: true

must_haves:
  truths:
    - "All 5 tables created with correct columns, types, and constraints"
    - "RLS is ENABLED on every table"
    - "All 12 RLS policies are present"
    - "Admin policies use (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'"
    - "Vendor policies use owner_id = auth.uid() or join to auditoriums"
  artifacts:
    - "wed-app/supabase/migrations/001_initial_schema.sql exists"
    - "File is runnable in Supabase SQL Editor without errors"
---

# Plan 1.2: Supabase Database Schema + RLS Migration

<objective>
Write the complete, runnable SQL migration file creating all 5 tables with proper constraints, indexes, and 12 Row-Level Security policies.

Purpose: The entire data layer is defined in one idempotent SQL file that can be pasted into Supabase SQL Editor.
Output: `wed-app/supabase/migrations/001_initial_schema.sql`
</objective>

<context>
Load for context:
- .gsd/SPEC.md (Database Schema and RLS sections)
</context>

<tasks>

<task type="auto">
  <name>Write complete SQL migration with all tables, indexes, RLS policies, and functions</name>
  <files>wed-app/supabase/migrations/001_initial_schema.sql</files>
  <action>
    Create the file with this exact structure (order matters for FK references):

    **Section 1 — Enable UUID extension:**
    ```sql
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    ```

    **Section 2 — profiles table:**
    ```sql
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','vendor','admin')),
      avatar_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    ```
    Add trigger: after INSERT on auth.users → auto-insert into profiles with email from auth.users.

    **Section 3 — cities table:**
    ```sql
    CREATE TABLE IF NOT EXISTS cities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      state TEXT NOT NULL DEFAULT 'Kerala',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    ```

    **Section 4 — auditoriums table:**
    ```sql
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
      photos JSONB DEFAULT '[]',
      description TEXT,
      amenities JSONB DEFAULT '[]',
      verified BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_auditoriums_city ON auditoriums(city_id);
    CREATE INDEX IF NOT EXISTS idx_auditoriums_owner ON auditoriums(owner_id);
    CREATE INDEX IF NOT EXISTS idx_auditoriums_verified ON auditoriums(verified);
    ```

    **Section 5 — pricing_slots table:**
    ```sql
    CREATE TABLE IF NOT EXISTS pricing_slots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      auditorium_id UUID NOT NULL REFERENCES auditoriums(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      custom_price NUMERIC(12,2),
      status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','booked','blocked')),
      UNIQUE(auditorium_id, date)
    );
    CREATE INDEX IF NOT EXISTS idx_pricing_slots_auditorium_date ON pricing_slots(auditorium_id, date);
    ```

    **Section 6 — bookings table:**
    ```sql
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
      auditorium_id UUID REFERENCES auditoriums(id) ON DELETE SET NULL,
      date DATE NOT NULL,
      total_amount NUMERIC(12,2) NOT NULL,
      advance_paid NUMERIC(12,2) DEFAULT 0,
      booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending','confirmed','cancelled')),
      payment_id TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_auditorium ON bookings(auditorium_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
    ```

    **Section 7 — Enable RLS on all tables:**
    ```sql
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
    ALTER TABLE auditoriums ENABLE ROW LEVEL SECURITY;
    ALTER TABLE pricing_slots ENABLE ROW LEVEL SECURITY;
    ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
    ```

    **Section 8 — Helper function for admin check:**
    ```sql
    CREATE OR REPLACE FUNCTION is_admin()
    RETURNS BOOLEAN AS $$
      SELECT EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
      );
    $$ LANGUAGE sql SECURITY DEFINER;
    ```

    **Section 9 — RLS Policies (DROP IF EXISTS + CREATE for idempotency):**

    Cities policies:
    - `cities_public_select`: SELECT WHERE is_active = true — for ALL (authenticated and anon)

    Auditoriums policies:
    - `auditoriums_public_select`: SELECT WHERE verified = true — for ALL
    - `auditoriums_vendor_update`: UPDATE WHERE owner_id = auth.uid()
    - `auditoriums_admin_all`: ALL WHERE is_admin()

    Pricing_slots policies:
    - `pricing_slots_public_select`: SELECT — for ALL
    - `pricing_slots_vendor_insert`: INSERT WHERE auditorium_id IN (SELECT id FROM auditoriums WHERE owner_id = auth.uid())
    - `pricing_slots_vendor_update`: UPDATE same condition
    - `pricing_slots_vendor_delete`: DELETE same condition
    - `pricing_slots_admin_all`: ALL WHERE is_admin()

    Profiles policies:
    - `profiles_own_select`: SELECT WHERE id = auth.uid()
    - `profiles_own_update`: UPDATE WHERE id = auth.uid()
    - `profiles_admin_all`: ALL WHERE is_admin()

    Bookings policies:
    - `bookings_customer_select`: SELECT WHERE customer_id = auth.uid()
    - `bookings_customer_insert`: INSERT WITH CHECK (customer_id = auth.uid())
    - `bookings_vendor_select`: SELECT WHERE auditorium_id IN (SELECT id FROM auditoriums WHERE owner_id = auth.uid())
    - `bookings_admin_all`: ALL WHERE is_admin()

    Use DROP POLICY IF EXISTS before each CREATE POLICY for idempotency.

    **Section 10 — Auto-create profile trigger:**
    ```sql
    CREATE OR REPLACE FUNCTION handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO profiles (id, email, full_name)
      VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    ```

    AVOID: Using `SERIAL` — always use UUID with gen_random_uuid() per Supabase conventions.
    AVOID: Forgetting SECURITY DEFINER on helper functions — without it, RLS recursion breaks.
  </action>
  <verify>
    Paste the SQL into Supabase SQL Editor → Run → Should complete with 0 errors.
    Then check: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
    Should return: profiles, cities, auditoriums, pricing_slots, bookings
  </verify>
  <done>
    All 5 tables created, RLS enabled on all, 16 policies created, auto-profile trigger active,
    is_admin() function exists.
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] 001_initial_schema.sql runs without errors in Supabase SQL Editor
- [ ] `SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';` returns ≥ 12
- [ ] `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';` returns 1 row
- [ ] Creating a test user via Supabase Auth → auto-creates a row in profiles
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>


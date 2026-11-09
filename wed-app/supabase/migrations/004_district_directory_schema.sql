-- ============================================================================
-- Migration: 004_district_directory_schema.sql
-- Project: Mana Venues (Kerala Multi-District Wedding Auditoriums Directory)
-- Idempotent schema migration for Supabase / PostgreSQL
-- ============================================================================

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Ensure Table Structure with all required fields
CREATE TABLE IF NOT EXISTS public.auditoriums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    district TEXT NOT NULL,
    city TEXT,
    address TEXT,
    phone_number TEXT,
    starting_price DECIMAL(10, 2) NOT NULL DEFAULT 40000.00,
    capacity INTEGER NOT NULL DEFAULT 500,
    latitude FLOAT,
    longitude FLOAT,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_claimed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Idempotent column additions for existing installations
DO $$ 
BEGIN
    -- name (sync with title if previously existed)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'name') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'title') THEN
            ALTER TABLE public.auditoriums ADD COLUMN name TEXT;
            UPDATE public.auditoriums SET name = title WHERE name IS NULL;
            ALTER TABLE public.auditoriums ALTER COLUMN name SET NOT NULL;
        ELSE
            ALTER TABLE public.auditoriums ADD COLUMN name TEXT NOT NULL DEFAULT 'Auditorium';
        END IF;
    END IF;

    -- district
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'district') THEN
        ALTER TABLE public.auditoriums ADD COLUMN district TEXT NOT NULL DEFAULT 'Ernakulam';
    END IF;

    -- city
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'city') THEN
        ALTER TABLE public.auditoriums ADD COLUMN city TEXT;
    END IF;

    -- phone_number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'phone_number') THEN
        ALTER TABLE public.auditoriums ADD COLUMN phone_number TEXT;
    END IF;

    -- starting_price
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'starting_price') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'base_price_per_day') THEN
            ALTER TABLE public.auditoriums ADD COLUMN starting_price DECIMAL(10, 2) DEFAULT 40000.00;
            UPDATE public.auditoriums SET starting_price = base_price_per_day WHERE starting_price IS NULL;
        ELSE
            ALTER TABLE public.auditoriums ADD COLUMN starting_price DECIMAL(10, 2) NOT NULL DEFAULT 40000.00;
        END IF;
    END IF;

    -- capacity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'capacity') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'seating_capacity') THEN
            ALTER TABLE public.auditoriums ADD COLUMN capacity INTEGER DEFAULT 500;
            UPDATE public.auditoriums SET capacity = seating_capacity WHERE capacity IS NULL;
        ELSE
            ALTER TABLE public.auditoriums ADD COLUMN capacity INTEGER NOT NULL DEFAULT 500;
        END IF;
    END IF;

    -- latitude / longitude
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'latitude') THEN
        ALTER TABLE public.auditoriums ADD COLUMN latitude FLOAT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'longitude') THEN
        ALTER TABLE public.auditoriums ADD COLUMN longitude FLOAT;
    END IF;

    -- is_verified
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'is_verified') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'verified') THEN
            ALTER TABLE public.auditoriums ADD COLUMN is_verified BOOLEAN DEFAULT false;
            UPDATE public.auditoriums SET is_verified = verified WHERE is_verified IS NULL;
        ELSE
            ALTER TABLE public.auditoriums ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;
        END IF;
    END IF;

    -- is_claimed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'auditoriums' AND column_name = 'is_claimed') THEN
        ALTER TABLE public.auditoriums ADD COLUMN is_claimed BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- 3. Optimized Indexes for Directory Queries
CREATE INDEX IF NOT EXISTS idx_auditoriums_district ON public.auditoriums (district);
CREATE INDEX IF NOT EXISTS idx_auditoriums_district_city ON public.auditoriums (district, city);
CREATE INDEX IF NOT EXISTS idx_auditoriums_slug ON public.auditoriums (slug);
CREATE INDEX IF NOT EXISTS idx_auditoriums_pricing ON public.auditoriums (starting_price);
CREATE INDEX IF NOT EXISTS idx_auditoriums_verified_claimed ON public.auditoriums (is_verified, is_claimed);

-- 4. Row Level Security (RLS) Policies
ALTER TABLE public.auditoriums ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous read access to all venues
DROP POLICY IF EXISTS "Public can view all auditoriums" ON public.auditoriums;
CREATE POLICY "Public can view all auditoriums"
ON public.auditoriums
FOR SELECT
USING (true);

-- Allow seeding and insertion (using Service Role key or bootstrap key)
DROP POLICY IF EXISTS "Allow bootstrap insert for auditoriums" ON public.auditoriums;
CREATE POLICY "Allow bootstrap insert for auditoriums"
ON public.auditoriums
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow bootstrap update for auditoriums" ON public.auditoriums;
CREATE POLICY "Allow bootstrap update for auditoriums"
ON public.auditoriums
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow service role full admin rights (seeding and pipeline automation)
DROP POLICY IF EXISTS "Service role full access on auditoriums" ON public.auditoriums;
CREATE POLICY "Service role full access on auditoriums"
ON public.auditoriums
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


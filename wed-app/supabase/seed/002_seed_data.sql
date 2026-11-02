-- ============================================================================
-- WedBook Seed Data
-- 3 Cities + 6 Verified Auditoriums + 30 Pricing Slots
-- Safe for execution in Supabase SQL Editor
-- ============================================================================

-- 1. Insert 3 Kerala Cities
INSERT INTO cities (id, name, slug, state, is_active) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Kochi', 'kochi', 'Kerala', true),
  ('c1000000-0000-0000-0000-000000000002', 'Trivandrum', 'trivandrum', 'Kerala', true),
  ('c1000000-0000-0000-0000-000000000003', 'Kozhikode', 'kozhikode', 'Kerala', true)
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, state = EXCLUDED.state, is_active = EXCLUDED.is_active;

-- 2. Insert 6 Verified Sample Auditoriums (2 per city)
-- Note: owner_id set to NULL for public demo sample records
INSERT INTO auditoriums (
  id,
  owner_id,
  city_id,
  title,
  slug,
  address,
  latitude,
  longitude,
  seating_capacity,
  floating_capacity,
  base_price_per_day,
  photos,
  description,
  amenities,
  verified
) VALUES
  -- --------------------------------------------------------------------------
  -- Kochi Venues
  -- --------------------------------------------------------------------------
  (
    'a1000000-0000-0000-0000-000000000001',
    NULL,
    'c1000000-0000-0000-0000-000000000001',
    'Grand Kochi Palace Convention Centre',
    'grand-kochi-palace',
    'Marine Drive, Ernakulam, Kochi - 682031',
    9.9796,
    76.2755,
    2000,
    500,
    200000.00,
    '[
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478147427282-58a87a433038?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop"
    ]'::jsonb,
    'One of central Kochi''s premier luxury wedding venues overlooking the backwaters. Boasts pillarless banquet halls, royal stage decor capabilities, acoustic sound insulation, dedicated VIP suites, and multi-cuisine centralized commercial kitchens.',
    '["AC", "Parking", "Catering", "Stage Decor", "Generator"]'::jsonb,
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    NULL,
    'c1000000-0000-0000-0000-000000000001',
    'Cochin Heritage Convention Centre',
    'cochin-convention-centre',
    'NH 66 Bypass, Edappally, Kochi - 682024',
    9.9719,
    76.2793,
    1200,
    300,
    125000.00,
    '[
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478147427282-58a87a433038?w=1200&auto=format&fit=crop"
    ]'::jsonb,
    'Strategically situated near Lulu Mall on the highway with easy accessibility for out-of-town guests. Features an expansive dining hall that seats 500 simultaneously, covered parking for 250 cars, and modern green rooms.',
    '["AC", "Parking", "Generator"]'::jsonb,
    true
  ),

  -- --------------------------------------------------------------------------
  -- Trivandrum Venues
  -- --------------------------------------------------------------------------
  (
    'a1000000-0000-0000-0000-000000000003',
    NULL,
    'c1000000-0000-0000-0000-000000000002',
    'Thiruvananthapuram Grand Royal Hall',
    'trivandrum-grand-hall',
    'Kowdiar Main Avenue, Trivandrum - 695003',
    8.5241,
    76.9366,
    1500,
    400,
    175000.00,
    '[
      "https://images.unsplash.com/photo-1478147427282-58a87a433038?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&auto=format&fit=crop"
    ]'::jsonb,
    'An aristocratic venue in Kowdiar with traditional Travancore architectural elements combined with contemporary state-of-the-art facilities. Perfect for grand weddings, receptions, and sangeet ceremonies.',
    '["AC", "Parking", "Catering", "Stage Decor", "Generator"]'::jsonb,
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    NULL,
    'c1000000-0000-0000-0000-000000000002',
    'Kovalam Sea Breeze Banquet & Lawn',
    'kovalam-beach-banquet',
    'Lighthouse Road, Kovalam, Trivandrum - 695527',
    8.3988,
    76.9802,
    800,
    200,
    90000.00,
    '[
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478147427282-58a87a433038?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&auto=format&fit=crop"
    ]'::jsonb,
    'Ideal for intimate coastal wedding celebrations and romantic twilight receptions. Combines an air-conditioned banquet hall with an open lawn overlooking the Arabian Sea.',
    '["AC", "Parking", "Catering"]'::jsonb,
    true
  ),

  -- --------------------------------------------------------------------------
  -- Kozhikode Venues
  -- --------------------------------------------------------------------------
  (
    'a1000000-0000-0000-0000-000000000005',
    NULL,
    'c1000000-0000-0000-0000-000000000003',
    'Calicut Heritage Convention Centre',
    'calicut-heritage-hall',
    'Mini Bypass Road, Govindapuram, Kozhikode - 673016',
    11.2588,
    75.7804,
    1800,
    500,
    165000.00,
    '[
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1478147427282-58a87a433038?w=1200&auto=format&fit=crop"
    ]'::jsonb,
    'Renowned for hosting prestigious Malabar weddings. Huge air-conditioned dining auditorium tailored for traditional Kozhikode Biryani feasts, grand elevated stage, and generator backup power.',
    '["AC", "Parking", "Catering", "Stage Decor", "Generator"]'::jsonb,
    true
  ),
  (
    'a1000000-0000-0000-0000-000000000006',
    NULL,
    'c1000000-0000-0000-0000-000000000003',
    'Malabar Wedding Auditorium',
    'malabar-wedding-palace',
    'Mavoor Road, Kozhikode - 673004',
    11.2444,
    75.7661,
    1000,
    250,
    95000.00,
    '[
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&auto=format&fit=crop"
    ]'::jsonb,
    'A popular family venue on Mavoor Road offering great acoustics, neat dining spaces, dedicated changing suites, and budget-friendly day rental packages.',
    '["AC", "Parking", "Generator"]'::jsonb,
    true
  )
ON CONFLICT (slug) DO UPDATE 
SET 
  title = EXCLUDED.title,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  seating_capacity = EXCLUDED.seating_capacity,
  floating_capacity = EXCLUDED.floating_capacity,
  base_price_per_day = EXCLUDED.base_price_per_day,
  photos = EXCLUDED.photos,
  description = EXCLUDED.description,
  amenities = EXCLUDED.amenities,
  verified = EXCLUDED.verified;

-- 3. Insert Pricing Slots with mixed statuses for Demo (Future dates in 2026/2027)
INSERT INTO pricing_slots (auditorium_id, date, custom_price, status) VALUES
  -- Grand Kochi Palace
  ('a1000000-0000-0000-0000-000000000001', '2026-11-15', NULL, 'booked'),
  ('a1000000-0000-0000-0000-000000000001', '2026-11-20', 240000.00, 'available'),
  ('a1000000-0000-0000-0000-000000000001', '2026-11-22', NULL, 'booked'),
  ('a1000000-0000-0000-0000-000000000001', '2026-11-25', NULL, 'blocked'),
  ('a1000000-0000-0000-0000-000000000001', '2026-12-05', 250000.00, 'available'),

  -- Cochin Convention Centre
  ('a1000000-0000-0000-0000-000000000002', '2026-11-16', NULL, 'booked'),
  ('a1000000-0000-0000-0000-000000000002', '2026-11-18', 145000.00, 'available'),
  ('a1000000-0000-0000-0000-000000000002', '2026-11-28', NULL, 'blocked'),
  ('a1000000-0000-0000-0000-000000000002', '2026-12-10', NULL, 'booked'),

  -- Trivandrum Grand Hall
  ('a1000000-0000-0000-0000-000000000003', '2026-11-12', NULL, 'booked'),
  ('a1000000-0000-0000-0000-000000000003', '2026-11-19', 210000.00, 'available'),
  ('a1000000-0000-0000-0000-000000000003', '2026-11-21', NULL, 'booked'),
  ('a1000000-0000-0000-0000-000000000003', '2026-12-01', NULL, 'blocked'),

  -- Kovalam Beach Banquet
  ('a1000000-0000-0000-0000-000000000004', '2026-11-14', 110000.00, 'available'),
  ('a1000000-0000-0000-0000-000000000004', '2026-11-20', NULL, 'booked'),
  ('a1000000-0000-0000-0000-000000000004', '2026-11-27', NULL, 'blocked'),

  -- Calicut Heritage Hall
  ('a1000000-0000-0000-0000-000000000005', '2026-11-15', NULL, 'booked'),
  ('a1000000-0000-0000-0000-000000000005', '2026-11-22', 195000.00, 'available'),
  ('a1000000-0000-0000-0000-000000000005', '2026-11-29', NULL, 'booked'),
  ('a1000000-0000-0000-0000-000000000005', '2026-12-08', NULL, 'blocked'),

  -- Malabar Wedding Palace
  ('a1000000-0000-0000-0000-000000000006', '2026-11-13', NULL, 'booked'),
  ('a1000000-0000-0000-0000-000000000006', '2026-11-17', 115000.00, 'available'),
  ('a1000000-0000-0000-0000-000000000006', '2026-11-26', NULL, 'blocked')
ON CONFLICT (auditorium_id, date) DO UPDATE
SET 
  custom_price = EXCLUDED.custom_price,
  status = EXCLUDED.status;

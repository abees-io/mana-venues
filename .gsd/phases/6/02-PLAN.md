---
phase: 6
plan: 2
wave: 2
depends_on: [6.1, 2.3]
files_modified:
  - wed-app/src/hooks/useGSAP.ts
  - wed-app/src/pages/HomePage.tsx (GSAP wiring)
  - wed-app/src/components/gallery/PhotoGallery.tsx (GSAP polish)
  - wed-app/supabase/seed/002_seed_data.sql
autonomous: true

must_haves:
  truths:
    - "useGSAP hook wraps gsap.context() for safe cleanup in React StrictMode"
    - "Hero section has entrance animation: text slides up + fades in"
    - "Auditorium card grid has stagger reveal: cards enter from bottom sequentially"
    - "Gallery crossfade is smooth (opacity tween)"
    - "Seed data: 3 cities + 6 auditoriums with realistic Kerala prices and Unsplash photos"
    - "All 6 seed auditoriums have verified=true so they appear in public feed"
  artifacts:
    - "wed-app/src/hooks/useGSAP.ts"
    - "wed-app/supabase/seed/002_seed_data.sql"
---

# Plan 6.2: GSAP Animations + Complete Seed Data

<objective>
Wire all GSAP animations with a clean React hook, polish gallery and hero transitions, and write the complete seed SQL for 3 cities + 6 auditoriums.

Purpose: The app must look polished and have data to demo out of the box.
Output: useGSAP utility hook, animation wiring, complete seed SQL.
</objective>

<context>
Load for context:
- .gsd/SPEC.md (seed data section, animation requirements)
- wed-app/src/pages/HomePage.tsx
- wed-app/src/components/gallery/PhotoGallery.tsx
</context>

<tasks>

<task type="auto">
  <name>Create useGSAP hook and wire all animations</name>
  <files>
    wed-app/src/hooks/useGSAP.ts
    wed-app/src/pages/HomePage.tsx
    wed-app/src/components/gallery/PhotoGallery.tsx
  </files>
  <action>
    **`useGSAP.ts`:**
    ```ts
    import { useEffect, useRef } from 'react'
    import gsap from 'gsap'
    import { ScrollTrigger } from 'gsap/ScrollTrigger'

    gsap.registerPlugin(ScrollTrigger)

    export function useGSAP(
      callback: (context: gsap.Context) => void,
      deps: React.DependencyList = []
    ) {
      const contextRef = useRef<gsap.Context | null>(null)

      useEffect(() => {
        contextRef.current = gsap.context(callback)
        return () => contextRef.current?.revert()
      }, deps) // eslint-disable-line react-hooks/exhaustive-deps

      return contextRef
    }
    ```

    **HomePage.tsx** — wire GSAP:
    1. Hero entrance (runs once on mount):
       ```ts
       useGSAP((ctx) => {
         ctx.add(() => {
           gsap.from('.hero-title', { y: 50, opacity: 0, duration: 0.9, ease: 'power3.out' })
           gsap.from('.hero-subtitle', { y: 30, opacity: 0, duration: 0.7, delay: 0.3, ease: 'power2.out' })
           gsap.from('.hero-search', { y: 20, opacity: 0, duration: 0.6, delay: 0.5 })
           gsap.from('.city-chip', { scale: 0.8, opacity: 0, stagger: 0.1, delay: 0.7 })
         })
       }, [])
       ```
    2. Card grid ScrollTrigger reveal (runs when data loads):
       ```ts
       useGSAP((ctx) => {
         if (!auditoriums?.length) return
         ctx.add(() => {
           gsap.from('.auditorium-card', {
             opacity: 0, y: 40, stagger: 0.08, duration: 0.5,
             ease: 'power2.out',
             scrollTrigger: { trigger: '.cards-grid', start: 'top 80%' }
           })
         })
       }, [auditoriums])
       ```
    Add class `hero-title`, `hero-subtitle`, `hero-search`, `city-chip` to respective hero elements.
    Add class `cards-grid` to grid wrapper, `auditorium-card` to each card wrapper div.

    **PhotoGallery.tsx** — clean up GSAP context on unmount (already done in Plan 3.1 — verify cleanup uses `gsap.context().revert()`).

    AVOID: Using `gsap.from()` without cleanup — always wrap in gsap.context() via useGSAP hook.
    AVOID: Animating on every re-render — check deps carefully.
  </action>
  <verify>
    Load / → hero text slides up. Scroll down → cards stagger in sequentially.
    Navigate to auditorium detail → click thumbnail → crossfade smooth.
    React StrictMode: animations don't double-fire or leave artifacts.
  </verify>
  <done>All animations work without React StrictMode glitches. useGSAP hook properly cleans up contexts. Scroll-triggered card reveal works.</done>
</task>

<task type="auto">
  <name>Write complete seed SQL for 3 cities and 6 auditoriums</name>
  <files>
    wed-app/supabase/seed/002_seed_data.sql
  </files>
  <action>
    Write a complete, runnable SQL seed file. Use INSERT ... ON CONFLICT DO NOTHING for idempotency.

    **Cities (3 rows):**
    ```sql
    INSERT INTO cities (id, name, slug, state, is_active) VALUES
      ('c1000000-0000-0000-0000-000000000001', 'Kochi', 'kochi', 'Kerala', true),
      ('c1000000-0000-0000-0000-000000000002', 'Trivandrum', 'trivandrum', 'Kerala', true),
      ('c1000000-0000-0000-0000-000000000003', 'Kozhikode', 'kozhikode', 'Kerala', true)
    ON CONFLICT (slug) DO NOTHING;
    ```

    **Auditoriums (6 rows — 2 per city):**

    Kochi:
    1. Grand Kochi Palace
       - slug: 'grand-kochi-palace'
       - seating: 2000, floating: 500
       - base_price: 200000
       - amenities: ["AC","Parking","Catering","Stage Decor","Generator"]
       - description: "One of Kochi's most prestigious wedding venues..."
       - photos: Unsplash wedding venue photos
       - verified: true
       - lat/lng: 9.9312, 76.2673

    2. Cochin Convention Centre
       - slug: 'cochin-convention-centre'
       - seating: 1200, floating: 300
       - base_price: 125000
       - amenities: ["AC","Parking","Generator"]
       - verified: true
       - lat/lng: 9.9719, 76.2793

    Trivandrum:
    3. Thiruvananthapuram Grand Hall
       - slug: 'trivandrum-grand-hall'
       - seating: 1500, floating: 400
       - base_price: 175000
       - amenities: ["AC","Parking","Catering","Stage Decor","Generator"]
       - verified: true
       - lat/lng: 8.5241, 76.9366

    4. Kovalam Beach Banquet
       - slug: 'kovalam-beach-banquet'
       - seating: 800, floating: 200
       - base_price: 90000
       - amenities: ["AC","Parking","Catering"]
       - verified: true
       - lat/lng: 8.3988, 76.9802

    Kozhikode:
    5. Calicut Heritage Hall
       - slug: 'calicut-heritage-hall'
       - seating: 1800, floating: 500
       - base_price: 165000
       - amenities: ["AC","Parking","Catering","Stage Decor","Generator"]
       - verified: true
       - lat/lng: 11.2588, 75.7804

    6. Malabar Wedding Palace
       - slug: 'malabar-wedding-palace'
       - seating: 1000, floating: 250
       - base_price: 95000
       - amenities: ["AC","Parking","Generator"]
       - verified: true
       - lat/lng: 11.2444, 75.7661

    **Photos array for each** (use these specific Unsplash URLs):
    ```sql
    '["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
      "https://images.unsplash.com/photo-1478147427282-58a87a433038?w=800",
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800"]'
    ```
    (Vary 1-2 photo URLs between venues for visual variety using different Unsplash photo IDs.)

    **Pricing slots for demo purposes (next 30 days):**
    Insert ~5 slots per auditorium:
    - 2 dates: status='booked'
    - 1 date: status='blocked'
    - 2 dates: custom_price (20% markup over base)

    **NOTE:** Do NOT seed users or profiles — Supabase Auth manages user creation.

    AVOID: Using NOW() + interval in static seed data for dates — use hardcoded future dates (e.g., '2025-12-15', '2025-12-20'). Adjust to be after current date 2026-11-02 → use '2026-11-15', '2026-11-20', etc.
  </action>
  <verify>
    Run seed SQL in Supabase SQL Editor.
    `SELECT COUNT(*) FROM auditoriums WHERE verified = true;` → 6
    `SELECT COUNT(*) FROM pricing_slots;` → ~30
    Load / in browser → 6 cards visible (after selecting a city or all-cities view).
  </verify>
  <done>
    3 cities, 6 verified auditoriums with real photos, descriptions, and amenities.
    ~30 pricing slots with mixed statuses. App works end-to-end with seed data.
  </done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Hero entrance animation smooth (no flicker, no double-fire in StrictMode)
- [ ] Card stagger reveal visible on scroll
- [ ] Gallery crossfade uses gsap.context() cleanup
- [ ] Seed SQL runs without errors
- [ ] 6 auditoriums visible across 3 cities in the feed
- [ ] Pricing slots show correct statuses in calendar (booked=red, blocked=gray)
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>


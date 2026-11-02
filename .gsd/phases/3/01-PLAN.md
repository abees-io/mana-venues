---
phase: 3
plan: 1
wave: 1
depends_on: [2.3]
files_modified:
  - wed-app/src/pages/AuditoriumDetailPage.tsx
  - wed-app/src/components/gallery/PhotoGallery.tsx
  - wed-app/src/components/detail/SpecsGrid.tsx
  - wed-app/src/components/detail/AmenitiesList.tsx
  - wed-app/src/components/detail/MapPlaceholder.tsx
autonomous: true

must_haves:
  truths:
    - "PhotoGallery shows main image + thumbnail row; clicking thumbnail swaps main image with GSAP crossfade"
    - "SpecsGrid displays seating capacity, floating capacity, base price, address"
    - "AmenitiesList renders amenity icons with labels"
    - "MapPlaceholder shows Google Maps-style iframe embed (iframe with placeholder src)"
    - "Page fetches auditorium by slug using useAuditoriumDetail hook"
  artifacts:
    - "wed-app/src/pages/AuditoriumDetailPage.tsx"
    - "wed-app/src/components/gallery/PhotoGallery.tsx"
---

# Plan 3.1: Auditorium Detail Page — Gallery, Specs, Map

<objective>
Build the AuditoriumDetailPage with a GSAP-powered photo gallery, specs grid, amenities, vendor contact info, and map placeholder.

Purpose: This is the page users convert on — full venue showcase before booking.
Output: AuditoriumDetailPage + gallery + specs + map sub-components.
</objective>

<context>
Load for context:
- .gsd/SPEC.md (detail page requirements)
- wed-app/src/lib/types.ts (Auditorium type)
- wed-app/src/lib/utils.ts
- wed-app/src/hooks/useAuditoriumDetail.ts
</context>

<tasks>

<task type="auto">
  <name>Build PhotoGallery component with GSAP crossfade transitions</name>
  <files>
    wed-app/src/components/gallery/PhotoGallery.tsx
  </files>
  <action>
    **`PhotoGallery.tsx`:**
    Props: `{ photos: string[], title: string }`

    Layout:
    ```
    ┌────────────────────────────────────────┐
    │  Main Image (aspect-video, object-cover │
    │  rounded-xl, max-h-[500px])             │
    ├───┬───┬───┬───────────────────────────┐
    │ T1│ T2│ T3│  +N more (overlay button) │
    └───┴───┴───┴───────────────────────────┘
    ```
    State: `activeIndex: number` (default 0)
    On thumbnail click:
    1. GSAP: `gsap.to(mainImageRef.current, { opacity: 0, duration: 0.2, onComplete: () => { setActiveIndex(i); gsap.to(mainImageRef.current, { opacity: 1, duration: 0.3 }) } })`
    Thumbnails: max 4 visible; if photos.length > 4, last thumbnail shows "+N" overlay.
    Lightbox: clicking "+N" or main image opens a full-screen modal with left/right arrows and keyboard navigation.

    Fallback: if photos array is empty, show 3 Unsplash placeholder URLs for wedding venues.

    AVOID: Using a gallery library — implement with GSAP and simple state.
    AVOID: Lazy loading the main image — it's above the fold.
  </action>
  <verify>Render gallery with 5 photo URLs. Click thumbnail 3 → main image cross-fades. Click +1 overlay → lightbox opens. Keyboard ArrowRight navigates.</verify>
  <done>Gallery crossfade works. Lightbox opens/closes. Keyboard navigation works. Fallback photos shown if empty.</done>
</task>

<task type="auto">
  <name>Build AuditoriumDetailPage with all sub-sections</name>
  <files>
    wed-app/src/pages/AuditoriumDetailPage.tsx
    wed-app/src/components/detail/SpecsGrid.tsx
    wed-app/src/components/detail/AmenitiesList.tsx
    wed-app/src/components/detail/MapPlaceholder.tsx
  </files>
  <action>
    **`AuditoriumDetailPage.tsx`:**
    Fetches via `useAuditoriumDetail(slug)` from URL params.
    Shows loading skeleton if isLoading, error state if error.

    Layout (two-column on desktop, stacked on mobile):
    ```
    LEFT (flex-1):                    RIGHT (sticky, 380px):
    ┌─────────────────────────┐       ┌──────────────────────┐
    │ PhotoGallery            │       │ Booking Widget        │
    ├─────────────────────────┤       │ (Plan 3.2+3.3)        │
    │ Title + City badge      │       │ [Book Now] button     │
    │ ★★★★☆ (placeholder)     │       └──────────────────────┘
    ├─────────────────────────┤
    │ SpecsGrid               │
    ├─────────────────────────┤
    │ Description (full text) │
    ├─────────────────────────┤
    │ AmenitiesList           │
    ├─────────────────────────┤
    │ MapPlaceholder          │
    └─────────────────────────┘
    ```

    **`SpecsGrid.tsx`:**
    Props: `{ auditorium: Auditorium }`
    2x2 grid of stat cards:
    - 👥 Seating Capacity: `auditorium.seating_capacity.toLocaleString()`
    - 🎉 Floating Capacity: `auditorium.floating_capacity`
    - 💰 Starting From: `formatCurrency(auditorium.base_price_per_day)` + "/day"
    - 📍 Address: `auditorium.address`

    **`AmenitiesList.tsx`:**
    Props: `{ amenities: string[] }`
    Map amenity name to Lucide icon:
    - "AC" → `Wind`; "Parking" → `ParkingSquare`; "Catering" → `UtensilsCrossed`;
      "Stage Decor" → `Sparkles`; "Generator" → `Zap`
    Grid: 2 cols, each item shows icon + label.

    **`MapPlaceholder.tsx`:**
    Props: `{ address: string, latitude?: number, longitude?: number }`
    If lat/lng provided: render `<iframe>` with OpenStreetMap embed URL:
    `https://www.openstreetmap.org/export/embed.html?bbox=...&marker={lat},{lng}`
    Else: show styled placeholder div with MapPin icon and address text + "View on Maps" link.
    Rounded corners, overflow-hidden, h-[300px].

    AVOID: Embedding Google Maps (requires billing API key) — use OpenStreetMap for free.
  </action>
  <verify>Navigate to /auditorium/grand-kochi-palace → page loads with gallery, specs (capacity/price), amenity icons, description, map placeholder. Right panel shows price + Book Now button.</verify>
  <done>Detail page renders all 6 sections. Two-column layout on desktop. Booking widget placeholder on right panel.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Gallery crossfade transition works (GSAP)
- [ ] Lightbox opens on main image click with keyboard navigation
- [ ] SpecsGrid shows all 4 stat cards
- [ ] AmenitiesList shows correct icons for each amenity
- [ ] MapPlaceholder renders OpenStreetMap iframe if lat/lng present
- [ ] Page shows loading skeleton during data fetch
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>


---
phase: 2
plan: 3
wave: 2
depends_on: [2.1, 2.2]
files_modified:
  - wed-app/src/components/cards/AuditoriumCard.tsx
  - wed-app/src/components/cards/AuditoriumCardSkeleton.tsx
  - wed-app/src/pages/HomePage.tsx
autonomous: true

must_haves:
  truths:
    - "AuditoriumCard shows thumbnail, title, city, capacity, starting price, and amenity badges"
    - "Cards link to /auditorium/:slug"
    - "Skeleton cards show during loading (3 placeholder cards)"
    - "HomePage shows hero section + card grid, reads from useAuditoriums hook"
    - "GSAP entrance animation on card grid (stagger reveal)"
  artifacts:
    - "wed-app/src/components/cards/AuditoriumCard.tsx"
    - "wed-app/src/pages/HomePage.tsx"
---

# Plan 2.3: AuditoriumCard Component + HomePage Feed

<objective>
Build the AuditoriumCard component with all display data, loading skeleton, and the HomePage with hero banner and card grid wired to useAuditoriums.

Purpose: This is what users see first — the browsing feed.
Output: AuditoriumCard, AuditoriumCardSkeleton, updated HomePage.
</objective>

<context>
Load for context:
- .gsd/SPEC.md (customer interface section)
- wed-app/src/lib/types.ts (Auditorium type)
- wed-app/src/lib/utils.ts (formatCurrency, formatDate, cn)
- wed-app/src/hooks/useAuditoriums.ts
- wed-app/src/store/cityStore.ts
</context>

<tasks>

<task type="auto">
  <name>Build AuditoriumCard and skeleton loading component</name>
  <files>
    wed-app/src/components/cards/AuditoriumCard.tsx
    wed-app/src/components/cards/AuditoriumCardSkeleton.tsx
  </files>
  <action>
    **`AuditoriumCard.tsx`:**
    Props: `{ auditorium: Auditorium }`
    Layout (mobile-first, hover shadow):
    ```
    ┌─────────────────────────────┐
    │  [Thumbnail 16:9 image]     │
    │  [Capacity badge top-right] │
    ├─────────────────────────────┤
    │  Title (1 line truncate)    │
    │  📍 City, State             │
    │  Amenity chips (max 3 + +N) │
    │  ★ Starting from ₹X,XX,XXX │
    └─────────────────────────────┘
    ```
    - Thumbnail: `auditorium.photos[0]` or fallback to a deterministic Unsplash URL
      (`https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400`)
    - Image: `object-cover`, `aspect-video`, `rounded-t-xl`
    - Capacity badge: absolute top-right, `bg-brand-primary/90 text-white text-xs px-2 py-1 rounded-bl-xl`
    - Amenity chips: small pills, max 3 shown, if more show "+N more"
    - Price: `formatCurrency(auditorium.base_price_per_day)` with "/day" suffix
    - Entire card is `<Link to={/auditorium/${auditorium.slug}}>`
    - Hover: `hover:shadow-xl hover:-translate-y-1 transition-all duration-200`

    **`AuditoriumCardSkeleton.tsx`:**
    Same layout with `animate-pulse` gray blocks replacing content.
    Export `AuditoriumCardSkeletonList` that renders 6 skeletons in a grid.

    AVOID: Inline style for image — use Tailwind aspect ratio and object-cover.
  </action>
  <verify>Render `<AuditoriumCard auditorium={mockAuditorium} />` in a test route — all 5 sections visible, image loads, link navigates to /auditorium/test-slug</verify>
  <done>Card renders all required data sections. Skeleton matches card layout. Link navigates correctly.</done>
</task>

<task type="auto">
  <name>Build HomePage with hero banner and live auditorium feed grid</name>
  <files>
    wed-app/src/pages/HomePage.tsx
  </files>
  <action>
    **`HomePage.tsx`:**

    **Section 1 — Hero Banner:**
    Full-width gradient hero: `bg-gradient-to-br from-brand-primary to-brand-dark`
    Text: "Find Your Perfect Wedding Venue" in white, large font
    Subtitle: "Discover stunning auditoriums across Kerala"
    Centered search bar (re-uses search logic from Header but larger)
    City selector chips row: shows all 3 cities as quick-select pills
    GSAP: Hero text fades in + slides up on mount (`gsap.from('.hero-text', {y:40, opacity:0, duration:0.8})`)

    **Section 2 — Feed Header:**
    "Venues in [SelectedCity]" heading with count badge
    "Change City" link that opens LocationModal

    **Section 3 — Card Grid:**
    `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
    - Uses `useAuditoriums(selectedCity?.slug, filters)`
    - Shows `AuditoriumCardSkeletonList` while loading
    - Shows error state with retry button if fetch fails
    - Shows empty state "No venues found in [city]" with illustration if 0 results
    - Maps auditoriums → `<AuditoriumCard>`
    GSAP: `gsap.from('.auditorium-card', { opacity:0, y:30, stagger:0.1, duration:0.5 })` after data loads

    **No filter panel yet** — that's Plan 2.4.

    Use `useEffect` to trigger GSAP animations after data state changes.
    AVOID: Running GSAP before DOM elements mount — use `useLayoutEffect` with gsap.context() for cleanup.
  </action>
  <verify>Navigate to / → hero renders with gradient, city selector chips visible. After seed data: 2 Kochi cards render with images, prices, amenity chips. Cards link to detail pages.</verify>
  <done>HomePage shows hero + 6 auditorium cards (after seed data). GSAP stagger visible on load. Loading skeleton shown during fetch.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] AuditoriumCard renders thumbnail, title, city, capacity badge, amenities, price
- [ ] Skeleton shows during loading
- [ ] Cards navigate to /auditorium/:slug on click
- [ ] Hero gradient renders with GSAP text animation
- [ ] Card grid responsive: 1 col mobile, 2 col tablet, 3 col desktop
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>


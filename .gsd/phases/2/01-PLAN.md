---
phase: 2
plan: 1
wave: 1
depends_on: [1.3]
files_modified:
  - wed-app/src/components/layout/Header.tsx
  - wed-app/src/components/layout/BottomNav.tsx
  - wed-app/src/components/layout/Layout.tsx
  - wed-app/src/components/modals/LocationModal.tsx
autonomous: true

must_haves:
  truths:
    - "Header shows logo, city badge, search bar, and auth buttons"
    - "LocationModal opens on city badge click, lists all active cities from Supabase"
    - "Selecting a city updates Zustand store and closes modal"
    - "BottomNav only visible on screens < md breakpoint (Tailwind md:hidden)"
    - "Layout wraps all customer pages"
  artifacts:
    - "wed-app/src/components/layout/Header.tsx"
    - "wed-app/src/components/modals/LocationModal.tsx"
---

# Plan 2.1: Global Layout — Header, BottomNav, LocationModal

<objective>
Build the persistent global layout shell: responsive Header with city selector, LocationModal that fetches cities from Supabase, and a mobile-only sticky BottomNav.

Purpose: Every customer page shares this shell; it's the first thing users see.
Output: Layout.tsx, Header.tsx, BottomNav.tsx, LocationModal.tsx
</objective>

<context>
Load for context:
- .gsd/SPEC.md (feature modules → Customer Interface section)
- wed-app/src/lib/types.ts
- wed-app/src/lib/utils.ts
- wed-app/src/contexts/AuthContext.tsx
</context>

<tasks>

<task type="auto">
  <name>Build Header component with logo, city selector, search, and auth menu</name>
  <files>
    wed-app/src/components/layout/Header.tsx
    wed-app/src/components/layout/Layout.tsx
  </files>
  <action>
    **`Header.tsx`:**
    - Logo: text "WedBook" in brand-primary color with a small Ring icon (Lucide)
    - City selector button: shows current city from Zustand store (Phase 2.2 will provide it;
      use a local fallback `useCityStore` import that won't break if store not yet populated)
    - Search bar: controlled input with Search icon, placeholder "Search venues, cities..."
      On submit → navigate to `/city/${currentCity}?q=${query}`
    - Right section: if `user` from `useAuth()`:
        - Avatar dropdown (ChevronDown icon): shows Profile link, sign out
      else:
        - "Login" outline button + "Register" filled button (brand-primary)
    - Sticky top, z-50, white bg, shadow-sm
    - Full responsive: on mobile collapses search bar to icon-only (SearchIcon button)

    **`Layout.tsx`:**
    Renders: `<Header />` + `<main className="min-h-screen">{children}</main>` + `<BottomNav />`
    Accepts `children: ReactNode`.

    Use Lucide icons: `MapPin`, `Search`, `User`, `ChevronDown`, `LogOut`.
    AVOID: Hardcoding city name — always read from store (default to "Kochi" if not set).
  </action>
  <verify>npm run dev → header visible with logo, city badge, search input, login/register buttons</verify>
  <done>Header renders with all sections; Layout wraps App router outlet</done>
</task>

<task type="auto">
  <name>Build LocationModal and mobile BottomNav</name>
  <files>
    wed-app/src/components/modals/LocationModal.tsx
    wed-app/src/components/layout/BottomNav.tsx
  </files>
  <action>
    **`LocationModal.tsx`:**
    Props: `{ isOpen: boolean, onClose: () => void }`
    - Fetches cities on mount: `supabase.from('cities').select('*').eq('is_active', true)`
    - Shows loading skeleton (3 placeholder rows) while fetching
    - Renders city list with MapPin icon, city name, state
    - On city click: calls `useCityStore.getState().setCity(city)` then `onClose()`
    - Modal overlay: fixed inset-0, bg-black/50, backdrop-blur-sm
    - Modal panel: white card, max-w-sm, centered, slide-up animation (CSS transition)
    - Close button (X icon) top-right
    - Keyboard: pressing Escape calls onClose

    **`BottomNav.tsx`:**
    Fixed bottom, full width, white bg, border-top, `md:hidden` class.
    4 tabs with icons + labels:
    - Home (House icon) → `/`
    - Search (Search icon) → `/city/${currentCity}`
    - Bookings (Calendar icon) → `/profile` (if logged in, else /auth/login)
    - Profile (User icon) → `/profile` (if logged in, else /auth/login)
    Active tab highlighted with brand-primary color.

    AVOID: Fetching cities on every modal open — cache with React Query (staleTime: Infinity).
  </action>
  <verify>Click city badge in header → modal opens, lists 3 cities. Select Trivandrum → badge updates. Resize to mobile → BottomNav appears</verify>
  <done>Modal fetches and displays cities. City selection updates header badge. BottomNav mobile-only</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Header renders on all pages (/ route)
- [ ] LocationModal opens and closes correctly
- [ ] City selection updates the header badge
- [ ] BottomNav hidden on desktop (≥768px), visible on mobile
- [ ] Auth buttons show Login/Register when logged out, avatar menu when logged in
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>


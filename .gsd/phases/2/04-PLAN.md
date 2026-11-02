---
phase: 2
plan: 4
wave: 2
depends_on: [2.2, 2.3]
files_modified:
  - wed-app/src/components/filters/FilterPanel.tsx
  - wed-app/src/components/filters/PriceRangeSlider.tsx
  - wed-app/src/components/filters/CapacityFilter.tsx
  - wed-app/src/components/filters/AmenityFilter.tsx
  - wed-app/src/pages/CityPage.tsx
autonomous: true

must_haves:
  truths:
    - "FilterPanel integrates with filterStore (Zustand)"
    - "Price range slider uses dual-thumb slider (native range or custom)"
    - "Amenity checkboxes list: AC, Parking, Catering, Stage Decor, Generator"
    - "Capacity presets: Any, 100-500, 500-1000, 1000-2000, 2000+"
    - "CityPage shows filter panel + filtered auditorium grid + city header"
    - "Filter changes re-trigger useAuditoriums query automatically"
  artifacts:
    - "wed-app/src/components/filters/FilterPanel.tsx"
    - "wed-app/src/pages/CityPage.tsx"
---

# Plan 2.4: Filter Panel + CityPage

<objective>
Build the filter sidebar (capacity presets, price range slider, amenity checkboxes) connected to filterStore, and the CityPage that shows filters + filtered auditorium grid.

Purpose: Discovery and filtering is the core UX of the platform.
Output: FilterPanel (composite), CityPage.
</objective>

<context>
Load for context:
- wed-app/src/store/filterStore.ts
- wed-app/src/hooks/useAuditoriums.ts
- wed-app/src/lib/utils.ts
</context>

<tasks>

<task type="auto">
  <name>Build FilterPanel and sub-components</name>
  <files>
    wed-app/src/components/filters/FilterPanel.tsx
    wed-app/src/components/filters/PriceRangeSlider.tsx
    wed-app/src/components/filters/CapacityFilter.tsx
    wed-app/src/components/filters/AmenityFilter.tsx
  </files>
  <action>
    **`CapacityFilter.tsx`:**
    Radio button group with presets:
    - "Any" (0–5000), "Up to 500", "500–1000", "1000–2000", "2000+" 
    On select → `setCapacityRange(min, max)` in filterStore.
    Active preset: brand-primary highlighted pill style.

    **`PriceRangeSlider.tsx`:**
    Two stacked `<input type="range">` elements for min/max price.
    Ranges: ₹0 to ₹5,00,000, step ₹5,000.
    Show current values formatted with formatCurrency.
    On change → debounce 300ms → `setPriceRange(min, max)`.
    AVOID: Using an external slider library — native range inputs styled with Tailwind accent-brand-primary.

    **`AmenityFilter.tsx`:**
    Checkbox list for: `['AC', 'Parking', 'Catering', 'Stage Decor', 'Generator']`
    Each checkbox calls `toggleAmenity(amenity)` on change.
    Selected amenities shown with checkmark icon.

    **`FilterPanel.tsx`:**
    Collapsible sidebar (on mobile: slide-in drawer triggered by filter button).
    Sections with dividers:
    1. "Guest Capacity" → `<CapacityFilter />`
    2. "Daily Budget" → `<PriceRangeSlider />`
    3. "Amenities" → `<AmenityFilter />`
    4. "Clear All Filters" button → `resetFilters()`
    Desktop: sticky sidebar, 280px wide.
    Mobile: full-screen drawer with close button.

    AVOID: Prop drilling filter state — components read directly from filterStore.
  </action>
  <verify>
    Render FilterPanel in isolation. Click capacity preset "500-1000" → filterStore.capacityMin = 500.
    Drag price slider → formatCurrency output updates below slider.
    Check AC checkbox → filterStore.amenities = ['AC'].
  </verify>
  <done>All filter components update filterStore correctly. Clear All resets to defaults.</done>
</task>

<task type="auto">
  <name>Build CityPage with filter panel + auditorium grid</name>
  <files>
    wed-app/src/pages/CityPage.tsx
  </files>
  <action>
    **`CityPage.tsx`:**
    Reads `slug` param from URL using `useParams()`.
    Fetches city details: `useCities()` → find city by slug → set as selected city in cityStore.

    Layout (desktop):
    ```
    ┌──────────┬──────────────────────────┐
    │ Filter   │  City Header             │
    │ Panel    │  "Venues in Kochi (6)"   │
    │ (280px)  │  Sort: Price ↑↓ / Newest │
    │          ├──────────────────────────┤
    │          │  Grid of AuditoriumCards │
    └──────────┴──────────────────────────┘
    ```
    Mobile layout: Filter behind a "Filter" button (SlidersHorizontal icon) that opens FilterPanel drawer.
    "Filter" button shows active filter count badge.

    City header: city name + state, MapPin icon, "X venues found" count.
    Sort dropdown: "Price: Low to High", "Price: High to Low", "Capacity: Large First"
    Sort is local state — sorts the returned array client-side.

    Data: `useAuditoriums(slug, filters)` where filters from filterStore.
    Passes to `<AuditoriumCard>` grid (same grid as HomePage).
    Empty state: "No venues match your filters" with "Clear Filters" button.

    AVOID: Fetching city details separately — derive from useCities cache.
  </action>
  <verify>
    Navigate to /city/kochi → shows Kochi header, filter panel on desktop.
    Apply "500-1000" capacity filter → query re-fires, grid updates.
    Sort "Price: Low to High" → cards reorder client-side.
  </verify>
  <done>CityPage shows filtered grid. Filter panel updates results live. Sort works client-side.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Capacity filter presets update filterStore and re-trigger query
- [ ] Price range slider debounces and updates results
- [ ] Amenity filter checkboxes work
- [ ] Clear All resets all filter state
- [ ] CityPage filter panel is drawer on mobile, sidebar on desktop
- [ ] Sort dropdown reorders cards client-side without refetch
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>


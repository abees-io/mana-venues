---
phase: 2
plan: 2
wave: 1
depends_on: [1.3]
files_modified:
  - wed-app/src/store/cityStore.ts
  - wed-app/src/store/filterStore.ts
  - wed-app/src/hooks/useAuditoriums.ts
  - wed-app/src/hooks/useCities.ts
  - wed-app/src/hooks/useAuditoriumDetail.ts
autonomous: true

must_haves:
  truths:
    - "Zustand cityStore persists selected city to localStorage"
    - "filterStore holds capacity range, price range, and amenity filter state"
    - "useAuditoriums hook returns paginated auditoriums filtered by city + filters"
    - "useCities hook returns all active cities (cached)"
    - "All hooks are typed with DB types from src/lib/types.ts"
  artifacts:
    - "wed-app/src/store/cityStore.ts"
    - "wed-app/src/store/filterStore.ts"
    - "wed-app/src/hooks/useAuditoriums.ts"
---

# Plan 2.2: Zustand Stores + Supabase Data Hooks

<objective>
Build the global state stores (city selection, active filters) and React Query data hooks for fetching auditoriums, cities, and detail data from Supabase.

Purpose: Decouples data fetching from components; enables the filter panel and feed to share state.
Output: 2 Zustand stores + 3 typed React Query hooks.
</objective>

<context>
Load for context:
- .gsd/SPEC.md (feature modules, filter specs)
- wed-app/src/lib/supabase.ts
- wed-app/src/lib/types.ts
</context>

<tasks>

<task type="auto">
  <name>Create Zustand stores for city and filter state</name>
  <files>
    wed-app/src/store/cityStore.ts
    wed-app/src/store/filterStore.ts
  </files>
  <action>
    **`src/store/cityStore.ts`:**
    ```ts
    interface CityStore {
      selectedCity: { id: string; name: string; slug: string } | null
      setCity: (city: CityStore['selectedCity']) => void
      clearCity: () => void
    }
    ```
    Use Zustand `persist` middleware → localStorage key: `wedbook_city`.
    Default to null (user picks city on first visit via modal).

    **`src/store/filterStore.ts`:**
    ```ts
    interface FilterStore {
      capacityMin: number        // default 0
      capacityMax: number        // default 5000
      priceMin: number           // default 0
      priceMax: number           // default 500000
      amenities: string[]        // selected amenities
      setCapacityRange: (min: number, max: number) => void
      setPriceRange: (min: number, max: number) => void
      toggleAmenity: (amenity: string) => void
      resetFilters: () => void
    }
    ```
    Do NOT persist filters — they reset on navigation.

    AVOID: Using `immer` middleware — simple object spread is sufficient for these small stores.
  </action>
  <verify>In browser devtools: import useCityStore, call setCity({id:'x',name:'Kochi',slug:'kochi'}) → localStorage shows wedbook_city key; refresh page → city persists</verify>
  <done>Both stores exported with full typed interface. cityStore persists. filterStore resets on new instance.</done>
</task>

<task type="auto">
  <name>Build React Query hooks for auditoriums and cities</name>
  <files>
    wed-app/src/hooks/useAuditoriums.ts
    wed-app/src/hooks/useCities.ts
    wed-app/src/hooks/useAuditoriumDetail.ts
    wed-app/src/hooks/usePricingSlots.ts
  </files>
  <action>
    Set up QueryClient in `src/lib/queryClient.ts` with defaults:
    ```ts
    new QueryClient({ defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1 } } })
    ```

    **`useAuditoriums.ts`:**
    ```ts
    function useAuditoriums(citySlug?: string, filters?: FilterState)
    ```
    Query key: `['auditoriums', citySlug, filters]`
    Supabase query:
    ```ts
    let q = supabase
      .from('auditoriums')
      .select('*, cities(name, slug)')
      .eq('verified', true)
    if (citySlug) q = q.eq('cities.slug', citySlug)  // NOTE: use inner join approach
    if (filters?.capacityMin) q = q.gte('seating_capacity', filters.capacityMin)
    if (filters?.capacityMax < 5000) q = q.lte('seating_capacity', filters.capacityMax)
    if (filters?.priceMin) q = q.gte('base_price_per_day', filters.priceMin)
    if (filters?.priceMax < 500000) q = q.lte('base_price_per_day', filters.priceMax)
    if (filters?.amenities.length > 0) {
      // Use Supabase JSONB contains: .contains('amenities', filters.amenities)
    }
    ```
    Returns `{ data: Auditorium[], isLoading, error }`.

    **`useCities.ts`:**
    Query key: `['cities']`
    `supabase.from('cities').select('*').eq('is_active', true).order('name')`
    staleTime: Infinity (cities rarely change).

    **`useAuditoriumDetail.ts`:**
    Args: `slug: string`
    Query key: `['auditorium', slug]`
    `supabase.from('auditoriums').select('*, cities(*), profiles(full_name,phone)').eq('slug', slug).single()`

    **`usePricingSlots.ts`:**
    Args: `auditoriumId: string, monthStart: Date, monthEnd: Date`
    Query key: `['pricing_slots', auditoriumId, monthStart]`
    Fetch slots between dates. Merge with base_price_per_day for dates without custom slot.

    AVOID: Fetching all auditoriums in a single query without city filter — always pass citySlug.
    AVOID: Disabling query when filter changes — React Query re-fetches automatically on key change.
  </action>
  <verify>
    Add temporary `useAuditoriums('kochi')` call in HomePage stub and console.log result.
    After seed data inserted: should log array of 2 Kochi auditoriums.
  </verify>
  <done>All 4 hooks export typed return values. useAuditoriums filters by city+capacity+price+amenities. useCities cached indefinitely.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] cityStore.setCity() persists across refresh
- [ ] filterStore.resetFilters() resets all values to defaults
- [ ] useAuditoriums called with 'kochi' returns 2 items (after seed data from Phase 6.2)
- [ ] useCities returns all 3 cities
- [ ] TypeScript compiles clean: `npx tsc --noEmit`
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>


---
phase: 1
plan: 1
wave: 1
depends_on: []
files_modified:
  - wed-app/package.json
  - wed-app/vite.config.ts
  - wed-app/tsconfig.json
  - wed-app/tsconfig.node.json
  - wed-app/index.html
  - wed-app/tailwind.config.ts
  - wed-app/postcss.config.js
  - wed-app/.env.example
autonomous: true
user_setup:
  - service: supabase
    why: "Database and auth backend"
    env_vars:
      - name: VITE_SUPABASE_URL
        source: "Supabase Dashboard → Project Settings → API → Project URL"
      - name: VITE_SUPABASE_ANON_KEY
        source: "Supabase Dashboard → Project Settings → API → anon public key"
  - service: razorpay
    why: "Payment processing"
    env_vars:
      - name: VITE_RAZORPAY_KEY_ID
        source: "Razorpay Dashboard → Settings → API Keys → Key ID (Test Mode)"

must_haves:
  truths:
    - "npm run dev starts without errors"
    - "Tailwind classes apply correctly (test with bg-blue-500 div)"
    - ".env.example documents all 3 required variables"
  artifacts:
    - "wed-app/package.json exists with all dependencies"
    - "wed-app/tailwind.config.ts extends theme with brand colors"
---

# Plan 1.1: Vite + React + Tailwind + Dependencies Scaffold

<objective>
Bootstrap the `wed-app` Vite + React + TypeScript project with all production dependencies installed and Tailwind CSS configured with the WedBook brand theme.

Purpose: Establish the foundation every other phase builds on.
Output: Runnable dev server, configured Tailwind, all packages in package.json.
</objective>

<context>
Load for context:
- .gsd/SPEC.md (tech stack and env vars sections)
</context>

<tasks>

<task type="auto">
  <name>Scaffold Vite React TypeScript project with all dependencies</name>
  <files>
    wed-app/package.json
    wed-app/vite.config.ts
    wed-app/tsconfig.json
    wed-app/tsconfig.node.json
    wed-app/index.html
    wed-app/src/main.tsx
    wed-app/src/App.tsx
    wed-app/src/vite-env.d.ts
  </files>
  <action>
    Run from `c:\Users\ABHI\OneDrive\Documents\WEDS`:
    ```
    npm create vite@latest wed-app -- --template react-ts
    cd wed-app
    npm install
    ```
    Then install ALL production dependencies in one command:
    ```
    npm install @supabase/supabase-js @tanstack/react-query zustand react-router-dom react-hook-form @hookform/resolvers zod gsap @capacitor/core @capacitor/android lucide-react razorpay clsx tailwind-merge date-fns
    ```
    Then dev dependencies:
    ```
    npm install -D tailwindcss postcss autoprefixer @types/node
    ```
    AVOID: Installing shadcn/ui CLI yet — it needs Tailwind configured first.
    AVOID: Using `&&` chaining — run each command separately in PowerShell.
  </action>
  <verify>cat wed-app/package.json | grep -E "(supabase|gsap|zustand|razorpay)"</verify>
  <done>package.json lists all required deps; npm install exits 0</done>
</task>

<task type="auto">
  <name>Configure Tailwind CSS with WedBook brand theme</name>
  <files>
    wed-app/tailwind.config.ts
    wed-app/postcss.config.js
    wed-app/src/index.css
    wed-app/.env.example
  </files>
  <action>
    Initialize Tailwind:
    ```
    npx tailwindcss init -p --ts
    ```
    Configure `tailwind.config.ts`:
    - content: `["./index.html", "./src/**/*.{ts,tsx}"]`
    - Extend theme with WedBook brand palette:
      ```js
      colors: {
        brand: {
          primary: '#8B1A4A',    // deep rose/maroon (wedding)
          secondary: '#D4AF37',  // gold
          accent: '#FDF0F5',     // blush pink background
          dark: '#1A0A10',       // near-black
        }
      }
      ```
    - Add `fontFamily.sans` override to include `['Inter', 'sans-serif']`

    In `src/index.css`:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    @layer base {
      body { @apply bg-brand-accent text-brand-dark; }
    }
    ```

    Create `.env.example`:
    ```
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key-here
    VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here
    ```

    Update `src/App.tsx` to a minimal placeholder with a branded div to verify Tailwind works.
    AVOID: Adding Tailwind JIT config — it's on by default in v3.
  </action>
  <verify>Run `npm run dev` inside wed-app — browser renders without errors; inspect element shows Tailwind classes applied</verify>
  <done>Dev server runs on localhost:5173, Tailwind brand colors visible, .env.example committed</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] `npm run dev` starts without errors from wed-app directory
- [ ] Tailwind brand colors render in browser (bg-brand-primary div shows deep rose)
- [ ] All deps present in package.json: supabase, gsap, zustand, razorpay, react-router-dom, date-fns
- [ ] .env.example has all 3 VITE_ variables documented
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>


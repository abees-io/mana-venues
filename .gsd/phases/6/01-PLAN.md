---
phase: 6
plan: 1
wave: 1
depends_on: [1.1]
files_modified:
  - wed-app/capacitor.config.ts
  - wed-app/package.json
autonomous: true
user_setup:
  - service: android-studio
    why: "Required to build the Android APK/AAB"
    dashboard_config:
      - task: "Install Android Studio (latest stable)"
        location: "https://developer.android.com/studio"
      - task: "Set ANDROID_HOME environment variable"
        location: "Android Studio → SDK Manager → Android SDK Location"
      - task: "After plan runs: open Android Studio project"
        location: "File → Open → wed-app/android/"

must_haves:
  truths:
    - "capacitor.config.ts exists with correct appId, appName, webDir"
    - "@capacitor/core and @capacitor/android are installed"
    - "npx cap init runs without errors"
    - "npx cap add android creates the android/ directory"
    - "npx cap sync copies web build to android assets"
  artifacts:
    - "wed-app/capacitor.config.ts"
    - "wed-app/android/ directory (after cap add android)"
---

# Plan 6.1: Capacitor v6 Mobile Configuration for Android

<objective>
Configure Capacitor v6 for Android build. Create capacitor.config.ts, init the project, add Android platform, and prepare the native project for Android Studio compilation.

Purpose: The app must be compilable as a native Android APK without code changes.
Output: capacitor.config.ts, android/ platform directory, build scripts.
</objective>

<context>
Load for context:
- .gsd/SPEC.md (mobile section)
- wed-app/package.json (existing deps)
- wed-app/vite.config.ts
</context>

<tasks>

<task type="auto">
  <name>Create Capacitor config and initialize Android platform</name>
  <files>
    wed-app/capacitor.config.ts
    wed-app/package.json (scripts section)
  </files>
  <action>
    **`capacitor.config.ts`:**
    ```ts
    import type { CapacitorConfig } from '@capacitor/cli';

    const config: CapacitorConfig = {
      appId: 'com.wedbook.booking',
      appName: 'WedBook',
      webDir: 'dist',
      bundledWebRuntime: false,
      server: {
        // For development: uncomment and set your local IP
        // url: 'http://192.168.x.x:5173',
        // cleartext: true,
      },
      plugins: {
        SplashScreen: {
          launchShowDuration: 2000,
          backgroundColor: '#8B1A4A',
          showSpinner: false,
        },
        StatusBar: {
          style: 'dark',
          backgroundColor: '#8B1A4A',
        },
        Keyboard: {
          resize: 'body',
          style: 'dark',
          resizeOnFullScreen: true,
        },
      },
      android: {
        buildOptions: {
          keystorePath: undefined,
          keystoreAlias: undefined,
        },
      },
    };

    export default config;
    ```

    **`package.json`** — Add these scripts:
    ```json
    "mobile:build": "npm run build && npx cap sync android",
    "mobile:open": "npx cap open android",
    "mobile:run": "npx cap run android",
    "cap:sync": "npx cap sync"
    ```

    Run sequentially (separate PowerShell calls from wed-app dir):
    1. `npm install @capacitor/cli @capacitor/core @capacitor/android @capacitor/splash-screen @capacitor/status-bar @capacitor/keyboard`
    2. `npx cap init WedBook com.wedbook.booking --web-dir dist`
    3. `npm run build`
    4. `npx cap add android`
    5. `npx cap sync android`

    AVOID: Using `&&` chaining in PowerShell — run each command separately.
    AVOID: Skipping `npm run build` before `cap sync` — Capacitor copies from `dist/`.
    AVOID: Setting server.url in production config — only for live reload during development.
  </action>
  <verify>
    - `ls wed-app/android` → shows AndroidManifest.xml, app/, build.gradle etc.
    - `cat wed-app/capacitor.config.ts` → appId is 'com.wedbook.booking'
    - `npx cap sync` from wed-app → exits 0 with "Sync finished in X.Xs"
  </verify>
  <done>capacitor.config.ts correct. android/ platform directory exists. cap sync succeeds.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] `capacitor.config.ts` has appId: 'com.wedbook.booking'
- [ ] `android/` directory created with valid Android project structure
- [ ] `npx cap sync` succeeds from wed-app directory
- [ ] `npm run mobile:open` opens Android Studio (if installed)
- [ ] package.json has all 4 mobile scripts
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>


import { Capacitor } from '@capacitor/core'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'
import { supabase } from './supabase'

let isInitialized = false

/**
 * Initializes the Capacitor GoogleAuth native plugin on Android/iOS.
 * Reads Web Client ID from VITE_GOOGLE_WEB_CLIENT_ID or NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID.
 */
export async function initializeNativeGoogleAuth(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  if (isInitialized) return

  const clientId =
    import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID ||
    import.meta.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    ''

  try {
    GoogleAuth.initialize({
      clientId: clientId || undefined,
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    })
    isInitialized = true
  } catch (err) {
    console.warn('Native GoogleAuth initialization error:', err)
  }
}

export interface SignInWithGoogleOptions {
  redirectTo?: string
  role?: 'customer' | 'vendor'
}

export interface SignInWithGoogleResult {
  data: unknown
  isNative: boolean
}

/**
 * Unified Google Sign-In:
 * - On Native Android (Capacitor): Uses @codetrix-studio/capacitor-google-auth to fetch
 *   the Google idToken natively and exchanges it via `supabase.auth.signInWithIdToken()`.
 *   (Bypasses Google's block on embedded WebViews).
 * - On Web: Uses `supabase.auth.signInWithOAuth()` redirecting to `/auth/callback`.
 */
export async function signInWithGoogle(
  options?: SignInWithGoogleOptions
): Promise<SignInWithGoogleResult> {
  const isNative = Capacitor.isNativePlatform()

  if (isNative) {
    // ─── Native Android Flow (Capacitor) ───
    await initializeNativeGoogleAuth()

    const googleUser = await GoogleAuth.signIn()
    const idToken =
      googleUser?.authentication?.idToken ||
      (googleUser as unknown as { idToken?: string })?.idToken

    if (!idToken) {
      throw new Error('Google Sign-In failed: No ID Token received from Google account.')
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    })

    if (error) throw error

    // If a role preference was specified, sync it to user metadata
    if (options?.role && data.user) {
      try {
        await supabase.auth.updateUser({
          data: { role: options.role },
        })
      } catch (roleErr) {
        console.warn('Could not set role metadata on native sign-in:', roleErr)
      }
    }

    return { data, isNative: true }
  } else {
    // ─── Web OAuth Flow ───
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const defaultRedirect = `${origin}/auth/callback`
    const redirectTo = options?.redirectTo || defaultRedirect

    // Save intent in sessionStorage so callback handler can route accordingly
    if (typeof window !== 'undefined' && options?.role) {
      sessionStorage.setItem('mana_auth_intent_role', options.role)
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) throw error
    return { data, isNative: false }
  }
}

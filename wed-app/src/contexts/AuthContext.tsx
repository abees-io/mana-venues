import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ session: boolean }>
  signOut: () => Promise<void>
  updateProfile: (updates: { full_name?: string; phone?: string; avatar_url?: string }) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const buildFallbackProfile = (targetUser: User): Profile => {
    const meta = (targetUser.user_metadata || {}) as Record<string, unknown>
    return {
      id: targetUser.id,
      email: targetUser.email || '',
      full_name: (meta.full_name as string) || (meta.name as string) || '',
      phone: (meta.phone as string) || null,
      role: ((meta.role as string) || 'customer') as 'customer' | 'vendor' | 'admin',
      avatar_url: (meta.avatar_url as string) || null,
      created_at: targetUser.created_at || new Date().toISOString(),
    }
  }

  const fetchProfile = async (userId: string, currentUser?: User | null) => {
    const targetUser = currentUser || user
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error || !data) {
        if (targetUser) {
          const fallback = buildFallbackProfile(targetUser)
          // Try self-heal in public.profiles table
          try {
            const { data: createdProfile } = await supabase
              .from('profiles')
              .upsert(fallback)
              .select()
              .single()

            if (createdProfile) {
              setProfile(createdProfile as Profile)
              return
            }
          } catch {
            // Silently fallback if table RLS restricts direct insert
          }
          // Set in-memory profile from user metadata so UI is never blank
          setProfile(fallback)
          return
        }
        setProfile(null)
      } else {
        // Merge with targetUser metadata if DB fields were empty
        const meta = (targetUser?.user_metadata || {}) as Record<string, unknown>
        setProfile({
          ...data,
          full_name: data.full_name || (meta.full_name as string) || '',
          phone: data.phone || (meta.phone as string) || null,
        } as Profile)
      }
    } catch (err) {
      console.warn('Unexpected error fetching profile:', err)
      if (targetUser) {
        setProfile(buildFallbackProfile(targetUser))
      } else {
        setProfile(null)
      }
    }
  }

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, user)
    }
  }

  const updateProfile = async (updates: {
    full_name?: string
    phone?: string
    avatar_url?: string
  }) => {
    if (!user) throw new Error('Not authenticated')

    // 1. Update Supabase Auth user metadata (always permitted for current user)
    const { data: authData, error: authError } = await supabase.auth.updateUser({
      data: updates,
    })
    if (authError) throw authError
    if (authData?.user) {
      setUser(authData.user)
    }

    // 2. Try upserting in public.profiles table
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email || '',
        full_name: updates.full_name ?? profile?.full_name ?? '',
        phone: updates.phone ?? profile?.phone ?? null,
        role: profile?.role || 'customer',
        avatar_url: updates.avatar_url ?? profile?.avatar_url ?? null,
      })
    } catch (err) {
      console.warn('Could not update profiles table directly:', err)
    }

    // 3. Update local profile state immediately
    setProfile((prev) => {
      const base = prev || buildFallbackProfile(user)
      return {
        ...base,
        ...updates,
      }
    })
  }

  useEffect(() => {
    let isMounted = true

    // Initialize active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id, session.user).finally(() => {
          if (isMounted) setLoading(false)
        })
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id, session.user)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ): Promise<{ session: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    })
    if (error) throw error
    return { session: !!data.session }
  }

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

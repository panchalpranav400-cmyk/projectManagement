import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

const GUEST_STORAGE_KEY = 'flowboard.guest_mode'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  guest: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  continueAsGuest: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [guest, setGuest] = useState(() => {
    try {
      return localStorage.getItem(GUEST_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function signUp(email: string, password: string, name: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    return { error: error?.message ?? null }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  function continueAsGuest() {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, '1')
    } catch {
      // storage unavailable — guest flag just won't survive a refresh
    }
    setGuest(true)
  }

  async function signOut() {
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY)
    } catch {
      // ignore
    }
    setGuest(false)
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, guest, signUp, signIn, signOut, continueAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

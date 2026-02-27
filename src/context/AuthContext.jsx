import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      // Handle magic link callback: redirect to my-purchases after sign-in
      // This fixes HashRouter + Supabase Auth conflict where access_token replaces the route
      if (event === 'SIGNED_IN' && session?.user) {
        const hash = window.location.hash
        // If we landed on root with access_token (magic link callback), redirect to my-purchases
        if (hash.includes('access_token') || hash === '#' || hash === '#/' || hash === '') {
          // Use setTimeout to ensure state is updated before redirect
          setTimeout(() => {
            window.location.hash = '#/my-purchases'
          }, 100)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signInWithMagicLink = async (email, redirectTo) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        emailRedirectTo: redirectTo || window.location.origin
      }
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signInWithMagicLink,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

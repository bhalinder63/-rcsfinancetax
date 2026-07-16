import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (!newSession) {
        setProfile(null)
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return
    let cancelled = false
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (!cancelled) {
          setProfile(data)
          setProfileError(error ? `${error.code ?? ''} ${error.message}`.trim() : '')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ session, profile, profileError, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

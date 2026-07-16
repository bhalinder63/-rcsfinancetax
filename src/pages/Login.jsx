import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/Button.jsx'
import logoIcon from '../assets/rcslogoicon.png'
import logoWordmark from '../assets/rcslogo.png'

const inputClasses =
  'w-full rounded-md border border-gold/25 bg-night px-4 py-3 text-base text-cream placeholder:text-muted-3 transition-colors focus:border-gold/60 focus-visible:outline-offset-0'

export default function Login() {
  const [mode, setMode] = useState('signin') // signin | signup
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { session, profile, profileError, loading } = useAuth()
  const navigate = useNavigate()

  // Already signed in (or just signed in): go to the right home
  useEffect(() => {
    if (!loading && profile) {
      navigate(profile.role === 'admin' ? '/admin' : '/portal', { replace: true })
    }
  }, [profile, loading, navigate])

  // Signed in but no profile row could be loaded — surface it instead of
  // silently staying on the login page.
  useEffect(() => {
    if (!loading && session && !profile) {
      setError(
        profileError
          ? `Profile load failed: ${profileError}`
          : 'Signed in, but your profile row is missing (no database error). Please contact us.',
      )
    }
  }, [loading, session, profile, profileError])

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name, phone: form.phone } },
        })
        if (err) throw err
        if (!data.session) {
          setNotice('Account created. Please check your email to confirm, then sign in.')
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })
        if (err) throw err
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[radial-gradient(900px_540px_at_50%_10%,#141a2a_0%,#0a0d14_55%,#07090d_100%)] p-4">
      <div className="w-full max-w-[440px]">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <img src={logoIcon} alt="RCS crest" className="h-12 w-auto" />
          <img src={logoWordmark} alt="RCS Finance & Tax Experts" className="h-8 w-auto" />
        </Link>

        <div className="rounded-xl border border-gold/35 bg-linear-160 from-card to-panel p-6 shadow-[0_30px_80px_rgba(0,0,0,.7),inset_0_1px_0_rgba(212,175,55,.2)] md:p-8">
          <h1 className="mb-1 font-display text-[24px] font-bold text-ivory">
            {mode === 'signin' ? 'Client Login' : 'Create Account'}
          </h1>
          <p className="mb-6 text-[14px] text-muted-2">
            {mode === 'signin'
              ? 'Sign in to track your service requests.'
              : 'Register to submit and track service requests.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] tracking-[.5px] text-muted-2">Full Name *</span>
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={inputClasses}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[13px] tracking-[.5px] text-muted-2">Phone *</span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 …"
                    className={inputClasses}
                  />
                </label>
              </>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] tracking-[.5px] text-muted-2">Email *</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={inputClasses}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] tracking-[.5px] text-muted-2">Password *</span>
              <input
                type="password"
                name="password"
                required
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={handleChange}
                placeholder={mode === 'signup' ? 'Minimum 8 characters' : 'Your password'}
                className={inputClasses}
              />
            </label>

            {error && (
              <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-[13.5px] text-red-300">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-md border border-gold/40 bg-gold/10 px-4 py-2.5 text-[13.5px] text-gold-bright">
                {notice}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full text-center" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-5 text-center text-[14px] text-muted-2">
            {mode === 'signin' ? (
              <>
                New client?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="cursor-pointer font-medium text-gold-bright hover:text-gold-light"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="cursor-pointer font-medium text-gold-bright hover:text-gold-light"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        <p className="mt-6 text-center text-[13px] text-muted-3">
          <Link to="/" className="text-muted-3 hover:text-gold-light">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  )
}

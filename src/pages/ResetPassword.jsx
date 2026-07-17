import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/Button.jsx'
import logoIcon from '../assets/rcslogoicon.png'
import logoWordmark from '../assets/rcslogo.png'

const inputClasses =
  'w-full rounded-md border border-gold/25 bg-night px-4 py-3 text-base text-cream placeholder:text-muted-3 transition-colors focus:border-gold/60 focus-visible:outline-offset-0'

export default function ResetPassword() {
  const { session, profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [waited, setWaited] = useState(false)

  // The recovery link signs the user in via URL tokens — give supabase-js a
  // moment to process them before declaring the link invalid.
  useEffect(() => {
    const t = setTimeout(() => setWaited(true), 3000)
    return () => clearTimeout(t)
  }, [])

  // After a successful reset, continue into the portal.
  useEffect(() => {
    if (done && profile) {
      navigate(profile.role === 'admin' ? '/admin' : '/portal', { replace: true })
    }
  }, [done, profile, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    const { error: err } = await supabase.auth.updateUser({ password: form.password })
    if (err) {
      setError(err.message)
      setBusy(false)
    } else {
      setDone(true)
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
          {session ? (
            <>
              <h1 className="mb-1 font-display text-[24px] font-bold text-ivory">Set New Password</h1>
              <p className="mb-6 text-[14px] text-muted-2">
                {done ? 'Password updated — taking you to your portal…' : 'Choose a new password for your account.'}
              </p>
              {!done && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] tracking-[.5px] text-muted-2">New Password *</span>
                    <input
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Minimum 8 characters"
                      className={inputClasses}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[13px] tracking-[.5px] text-muted-2">Confirm Password *</span>
                    <input
                      type="password"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={form.confirm}
                      onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                      placeholder="Repeat the new password"
                      className={inputClasses}
                    />
                  </label>
                  {error && (
                    <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-[13.5px] text-red-300">
                      {error}
                    </p>
                  )}
                  <Button type="submit" size="lg" className="w-full text-center" disabled={busy}>
                    {busy ? 'Please wait…' : 'Update Password'}
                  </Button>
                </form>
              )}
            </>
          ) : waited ? (
            <>
              <h1 className="mb-1 font-display text-[24px] font-bold text-ivory">Link Invalid or Expired</h1>
              <p className="mb-6 text-[14px] text-muted-2">
                This reset link is no longer valid. Request a fresh one from the login page.
              </p>
              <Link
                to="/login"
                className="inline-block rounded-md border border-gold/55 px-6 py-3 text-[15px] font-medium text-gold-bright transition-colors hover:bg-gold/8"
              >
                Back to Login
              </Link>
            </>
          ) : (
            <p className="text-center text-[15px] tracking-[1px] text-gold-bright">Verifying link…</p>
          )}
        </div>
      </div>
    </div>
  )
}

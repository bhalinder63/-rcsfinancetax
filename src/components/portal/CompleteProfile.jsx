import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../Button.jsx'

const inputClasses =
  'w-full rounded-md border border-gold/25 bg-night px-4 py-3 text-base text-cream placeholder:text-muted-3 transition-colors focus:border-gold/60 focus-visible:outline-offset-0'

// Shown when a signed-in client's profile is missing name or phone
// (e.g. accounts created from the Supabase dashboard, which skip the
// website signup form).
export default function CompleteProfile() {
  const { session, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: form.full_name.trim(), phone: form.phone.trim() })
      .eq('id', session.user.id)
    if (err) {
      setError(err.message)
      setBusy(false)
    } else {
      await refreshProfile()
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-gold/45 bg-linear-150 from-[#191307] to-[#0d0a05] p-6">
      <h2 className="mb-1 font-display text-[19px] font-bold text-gold-light">Complete your profile</h2>
      <p className="mb-4 text-[14px] text-sand">
        Please add your name and phone number so our team knows who to contact about your requests.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row md:items-end">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-[13px] tracking-[.5px] text-muted-2">Full Name *</span>
          <input
            type="text"
            required
            autoComplete="name"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            placeholder="Your name"
            className={inputClasses}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-[13px] tracking-[.5px] text-muted-2">Phone *</span>
          <input
            type="tel"
            required
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+91 …"
            className={inputClasses}
          />
        </label>
        <Button type="submit" disabled={busy} className="md:shrink-0">
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-[13.5px] text-red-300">
          {error}
        </p>
      )}
    </div>
  )
}

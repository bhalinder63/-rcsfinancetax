import { useEffect, useRef, useState } from 'react'
import { CONTACT, SERVICES } from '../data.js'
import { supabase } from '../lib/supabase.js'
import Button from './Button.jsx'

const inputClasses =
  'w-full rounded-md border border-gold/25 bg-night px-4 py-3 text-base text-cream placeholder:text-muted-3 transition-colors focus:border-gold/60 focus-visible:outline-offset-0'

const initialForm = { name: '', phone: '', email: '', service: '', message: '' }

export default function EnquiryModal({ open, onClose, initialService = '' }) {
  const [form, setForm] = useState(initialForm)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const nameRef = useRef(null)

  useEffect(() => {
    if (open && initialService) setForm((f) => ({ ...f, service: initialService }))
  }, [open, initialService])

  useEffect(() => {
    if (!open) return
    setSent(false)
    setError('')
    nameRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)
    const { error: err } = await supabase.from('enquiries').insert({
      name: form.name,
      phone: form.phone,
      email: form.email,
      service: form.service,
      message: form.message,
    })
    setSending(false)
    if (err) {
      setError('Could not send your enquiry. Please try again — or call us directly.')
    } else {
      setForm(initialForm)
      setSent(true)
    }
  }


  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-100 flex animate-[fade-in_.15s_ease-out_both] items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="max-h-[90vh] w-full max-w-[520px] animate-[modal-in_.22s_.06s_ease-out_both] overflow-y-auto rounded-xl border border-gold/35 bg-linear-160 from-card to-panel p-6 shadow-[0_30px_80px_rgba(0,0,0,.7),inset_0_1px_0_rgba(212,175,55,.2)] md:p-9">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-px w-8 bg-linear-to-r from-gold to-transparent" />
              <span className="text-[12px] font-medium tracking-[3px] text-gold-bright">ENQUIRY</span>
            </div>
            <h2 id="enquiry-title" className="font-display text-[26px] font-bold text-ivory">
              Get in <span className="text-gold-bright">Touch</span>
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gold/25 text-xl text-muted transition-colors hover:border-gold/60 hover:text-gold-bright"
          >
            ×
          </button>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full border border-[#2f9e5f]/50 bg-[#2f9e5f]/10 text-[26px] text-[#5fce8f]">
              ✓
            </span>
            <h3 className="font-display text-[22px] font-bold text-ivory">Enquiry Received</h3>
            <p className="max-w-[360px] text-[14.5px] leading-relaxed text-muted-2">
              Thank you — our team will contact you shortly. For anything urgent, call us at{' '}
              <a href={CONTACT.phoneHref} className="text-gold-bright hover:text-gold-light">
                {CONTACT.phone}
              </a>
              .
            </p>
            <Button onClick={onClose} className="mt-2">
              Close
            </Button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] tracking-[.5px] text-muted-2">Full Name *</span>
              <input
                ref={nameRef}
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
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] tracking-[.5px] text-muted-2">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={inputClasses}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] tracking-[.5px] text-muted-2">Service Required</span>
            <select name="service" value={form.service} onChange={handleChange} className={inputClasses}>
              <option value="">Select a service…</option>
              {SERVICES.map((svc) => (
                <option key={svc.tag} value={svc.name}>
                  {svc.name}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] tracking-[.5px] text-muted-2">Message</span>
            <textarea
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us briefly about your requirement…"
              className={`${inputClasses} resize-none`}
            />
          </label>

          {error && (
            <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-[13.5px] text-red-300">
              {error}
            </p>
          )}

          <Button size="lg" type="submit" disabled={sending} className="mt-1 w-full text-center">
            {sending ? 'Sending…' : 'Send Enquiry →'}
          </Button>

          <p className="text-center text-[13px] leading-relaxed text-muted-3">
            We typically respond within one business day — or call us at{' '}
            <a href={CONTACT.phoneHref} className="text-gold-bright hover:text-gold-light">
              {CONTACT.phone}
            </a>
            .
          </p>
        </form>
        )}
      </div>
    </div>
  )
}

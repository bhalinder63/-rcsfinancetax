import { useEffect, useRef, useState } from 'react'
import { CONTACT, SERVICES } from '../data.js'
import { supabase } from '../lib/supabase.js'
import Button from './Button.jsx'

const inputClasses =
  'w-full rounded-md border border-gold/25 bg-night px-4 py-3 text-base text-cream placeholder:text-muted-3 transition-colors focus:border-gold/60 focus-visible:outline-offset-0'

const initialForm = { name: '', phone: '', email: '', service: '', message: '' }

export default function EnquiryModal({ open, onClose, initialService = '' }) {
  const [form, setForm] = useState(initialForm)
  const nameRef = useRef(null)

  useEffect(() => {
    if (open && initialService) setForm((f) => ({ ...f, service: initialService }))
  }, [open, initialService])

  useEffect(() => {
    if (!open) return
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
    // Save to the admin panel's enquiry inbox first; if it fails (offline,
    // etc.) still fall through to WhatsApp so the visitor is never blocked.
    try {
      await supabase.from('enquiries').insert({
        name: form.name,
        phone: form.phone,
        email: form.email,
        service: form.service,
        message: form.message,
      })
    } catch {
      /* WhatsApp fallback below still carries the enquiry */
    }
    const lines = [
      'New enquiry — RCS Finance & Tax Experts',
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      form.email && `Email: ${form.email}`,
      form.service && `Service: ${form.service}`,
      form.message && `Message: ${form.message}`,
    ].filter(Boolean)
    window.open(`${CONTACT.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener')
    setForm(initialForm)
    onClose()
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

          <Button size="lg" type="submit" className="mt-1 w-full text-center">
            Send Enquiry →
          </Button>

          <p className="text-center text-[13px] leading-relaxed text-muted-3">
            Sending opens WhatsApp with your enquiry pre-filled — or call us at{' '}
            <a href={CONTACT.phoneHref} className="text-gold-bright hover:text-gold-light">
              {CONTACT.phone}
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import PortalShell from '../components/portal/PortalShell.jsx'

const ENQUIRY_STATUS = { new: 'New', contacted: 'Contacted', closed: 'Closed' }
const FILTERS = ['all', 'new', 'contacted', 'closed']

const badgeStyles = {
  new: 'border-gold/40 bg-gold/10 text-gold-bright',
  contacted: 'border-[#5b8ceb]/40 bg-[#5b8ceb]/10 text-[#8fb3ff]',
  closed: 'border-muted-3/40 bg-muted-3/10 text-muted-2',
}

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    const { data, error: err } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setEnquiries(data ?? [])
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel('enquiries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enquiries' }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const updateStatus = async (id, status) => {
    setError('')
    const { error: err } = await supabase.from('enquiries').update({ status }).eq('id', id)
    if (err) setError(err.message)
    else load()
  }

  const statusFiltered = filter === 'all' ? enquiries : enquiries.filter((e) => e.status === filter)
  const q = query.trim().toLowerCase()
  const visible = q
    ? statusFiltered.filter((e) =>
        [e.name, e.phone, e.email, e.service, e.message]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q)),
      )
    : statusFiltered
  const counts = enquiries.reduce((acc, e) => ({ ...acc, [e.status]: (acc[e.status] ?? 0) + 1 }), {})

  return (
    <PortalShell
      title="Website Enquiries"
      subtitle="Every enquiry submitted through the public website's Get in Touch form."
    >
      <div className="mb-4 max-w-[420px]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, email or service…"
          className="w-full rounded-md border border-gold/25 bg-night px-4 py-3 text-base text-cream placeholder:text-muted-3 transition-colors focus:border-gold/60 focus-visible:outline-offset-0"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`cursor-pointer rounded-full border px-4 py-1.5 text-[13.5px] font-medium transition-colors ${
              filter === f
                ? 'border-gold bg-gold/15 text-gold-bright'
                : 'border-gold/25 text-muted hover:border-gold/50 hover:text-gold-bright'
            }`}
          >
            {f === 'all' ? `All (${enquiries.length})` : `${ENQUIRY_STATUS[f]} (${counts[f] ?? 0})`}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-[13.5px] text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {visible.length === 0 && (
          <div className="rounded-xl border border-gold/18 bg-panel p-8 text-center text-[15px] text-muted-2">
            {enquiries.length === 0
              ? 'No website enquiries yet — they will appear here the moment someone submits the Get in Touch form.'
              : 'No enquiries match your search.'}
          </div>
        )}
        {visible.map((enq) => (
          <div key={enq.id} className="rounded-xl border border-gold/25 bg-panel p-5">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-3">
                  <span className="text-[16.5px] font-semibold text-ivory">{enq.name}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-medium ${badgeStyles[enq.status]}`}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {ENQUIRY_STATUS[enq.status]}
                  </span>
                  {enq.service && (
                    <span className="rounded-md border border-gold/25 px-2 py-0.5 text-[12.5px] text-muted-2">
                      {enq.service}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-muted-2">
                  <a href={`tel:${enq.phone}`} className="text-gold-bright hover:text-gold-light">
                    {enq.phone}
                  </a>
                  {enq.email && (
                    <a href={`mailto:${enq.email}`} className="hover:text-gold-light">
                      {enq.email}
                    </a>
                  )}
                  <span className="text-muted-3">
                    {new Date(enq.created_at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-[13px] text-muted-2">
                Status
                <select
                  value={enq.status}
                  onChange={(e) => updateStatus(enq.id, e.target.value)}
                  className="cursor-pointer rounded-md border border-gold/30 bg-night px-3 py-2 text-[13.5px] text-cream transition-colors focus:border-gold/60"
                >
                  {Object.entries(ENQUIRY_STATUS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {enq.message && <p className="text-[14px] leading-relaxed text-muted-2">{enq.message}</p>}
          </div>
        ))}
      </div>
    </PortalShell>
  )
}

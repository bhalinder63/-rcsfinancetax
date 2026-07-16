import { useEffect, useState } from 'react'
import { supabase, STATUS_LABELS } from '../lib/supabase.js'
import PortalShell from '../components/portal/PortalShell.jsx'
import StatusBadge from '../components/portal/StatusBadge.jsx'

const FILTERS = ['all', 'submitted', 'in_process', 'completed']

export default function Admin() {
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')

  const loadRequests = async () => {
    const { data, error: err } = await supabase
      .from('requests')
      .select('*, client:profiles!client_id(full_name, phone), documents(id, file_name, file_path)')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setRequests(data ?? [])
  }

  useEffect(() => {
    loadRequests()
    const channel = supabase
      .channel('all-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => loadRequests())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const updateStatus = async (id, status) => {
    setError('')
    const { error: err } = await supabase.from('requests').update({ status }).eq('id', id)
    if (err) setError(err.message)
    else loadRequests()
  }

  const openDocument = async (doc) => {
    setError('')
    const { data, error: err } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_path, 3600)
    if (err) setError(err.message)
    else window.open(data.signedUrl, '_blank', 'noopener')
  }

  const visible = filter === 'all' ? requests : requests.filter((r) => r.status === filter)
  const counts = requests.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {})

  return (
    <PortalShell title="Admin — Service Requests" subtitle="Review incoming requests, download documents and update status.">
      {/* Filters */}
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
            {f === 'all' ? `All (${requests.length})` : `${STATUS_LABELS[f]} (${counts[f] ?? 0})`}
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
            No requests here yet.
          </div>
        )}
        {visible.map((req) => (
          <div key={req.id} className="rounded-xl border border-gold/25 bg-panel p-5">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-3">
                  <span className="text-[16.5px] font-semibold text-ivory">{req.service}</span>
                  <StatusBadge status={req.status} />
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-muted-2">
                  <span className="font-medium text-mist">{req.client?.full_name || 'Unknown client'}</span>
                  {req.client?.phone && (
                    <a href={`tel:${req.client.phone}`} className="text-gold-bright hover:text-gold-light">
                      {req.client.phone}
                    </a>
                  )}
                  <span className="text-muted-3">
                    {new Date(req.created_at).toLocaleString('en-IN', {
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
                  value={req.status}
                  onChange={(e) => updateStatus(req.id, e.target.value)}
                  className="cursor-pointer rounded-md border border-gold/30 bg-night px-3 py-2 text-[13.5px] text-cream transition-colors focus:border-gold/60"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {req.note && <p className="mb-3 text-[14px] leading-relaxed text-muted-2">{req.note}</p>}

            {req.documents?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {req.documents.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => openDocument(doc)}
                    className="cursor-pointer rounded-md border border-gold/30 bg-night px-3 py-1.5 text-[13px] text-gold-bright transition-colors hover:border-gold/60 hover:bg-gold/8"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mr-1.5 inline size-3.5 -translate-y-px" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                    {doc.file_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </PortalShell>
  )
}

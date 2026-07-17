import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, STATUS_LABELS, openDocument, uploadRequestDocuments } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import PortalShell from '../components/portal/PortalShell.jsx'
import StatusBadge from '../components/portal/StatusBadge.jsx'
import DocumentChip from '../components/portal/DocumentChip.jsx'

const FILTERS = ['all', 'submitted', 'in_process', 'completed']

function SendToClient({ request, adminId, onDone, onError }) {
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setBusy(true)
    try {
      await uploadRequestDocuments({
        files,
        clientId: request.client_id,
        requestId: request.id,
        uploadedBy: adminId,
      })
      if (fileRef.current) fileRef.current.value = ''
      onDone()
    } catch (err) {
      onError(err.message || 'Upload failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFiles} />
      <button
        type="button"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
        className="cursor-pointer rounded-md border border-gold/50 bg-gold/10 px-3 py-1.5 text-[13px] font-medium text-gold-bright transition-colors hover:bg-gold/20 disabled:cursor-default disabled:opacity-50"
      >
        {busy ? 'Uploading…' : '↑ Send document to client'}
      </button>
    </>
  )
}

export default function Admin() {
  const { session } = useAuth()
  const adminId = session.user.id

  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const loadRequests = async () => {
    const { data, error: err } = await supabase
      .from('requests')
      .select('*, client:profiles!client_id(full_name, phone), documents(id, file_name, file_path, uploaded_by)')
      .order('created_at', { ascending: false })
    if (err) setError(err.message)
    else setRequests(data ?? [])
  }

  useEffect(() => {
    loadRequests()
    const channel = supabase
      .channel('all-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => loadRequests())
      .on('postgres_changes', { event: 'insert', schema: 'public', table: 'documents' }, () => loadRequests())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const updateStatus = async (id, status) => {
    setError('')
    const { error: err } = await supabase.from('requests').update({ status }).eq('id', id)
    if (err) setError(err.message)
    else loadRequests()
  }

  const handleOpenDocument = (doc) => {
    setError('')
    openDocument(doc).catch((err) => setError(err.message))
  }

  const statusFiltered = filter === 'all' ? requests : requests.filter((r) => r.status === filter)
  const q = query.trim().toLowerCase()
  const visible = q
    ? statusFiltered.filter((r) =>
        [r.client?.full_name, r.client?.phone, r.service, r.note]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q)),
      )
    : statusFiltered
  const counts = requests.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {})

  return (
    <PortalShell title="Admin — Service Requests" subtitle="Review incoming requests, download documents and update status.">
      <div className="mb-4 max-w-[420px]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by client, phone, service or note…"
          className="w-full rounded-md border border-gold/25 bg-night px-4 py-3 text-base text-cream placeholder:text-muted-3 transition-colors focus:border-gold/60 focus-visible:outline-offset-0"
        />
      </div>

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
        {visible.map((req) => {
          const fromClient = (req.documents ?? []).filter((d) => d.uploaded_by === req.client_id)
          const fromRcs = (req.documents ?? []).filter((d) => d.uploaded_by !== req.client_id)
          return (
            <div key={req.id} className="rounded-xl border border-gold/25 bg-panel p-5">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/request/${req.id}`}
                      className="text-[16.5px] font-semibold text-ivory underline-offset-2 hover:text-gold-light hover:underline"
                    >
                      {req.service}
                    </Link>
                    <StatusBadge status={req.status} />
                    <Link to={`/request/${req.id}`} className="text-[13px] text-gold-bright hover:text-gold-light">
                      Open →
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px] text-muted-2">
                    <Link
                    to={`/admin/clients/${req.client_id}`}
                    className="font-medium text-mist underline-offset-2 hover:text-gold-light hover:underline"
                  >
                    {req.client?.full_name || 'Unknown client'}
                  </Link>
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

              {fromClient.length > 0 && (
                <div className="mb-3">
                  <span className="mb-1.5 block text-[12px] uppercase tracking-[1.5px] text-muted-3">
                    From client
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {fromClient.map((doc) => (
                      <DocumentChip key={doc.id} doc={doc} onOpen={handleOpenDocument} />
                    ))}
                  </div>
                </div>
              )}

              {fromRcs.length > 0 && (
                <div className="mb-3">
                  <span className="mb-1.5 block text-[12px] uppercase tracking-[1.5px] text-muted-3">
                    Sent to client
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {fromRcs.map((doc) => (
                      <DocumentChip key={doc.id} doc={doc} fromRcs onOpen={handleOpenDocument} />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-1 border-t border-gold/12 pt-3">
                <SendToClient
                  request={req}
                  adminId={adminId}
                  onDone={loadRequests}
                  onError={(msg) => setError(msg)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </PortalShell>
  )
}

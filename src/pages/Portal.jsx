import { useEffect, useRef, useState } from 'react'
import { supabase, openDocument, uploadRequestDocuments } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { SERVICES } from '../data.js'
import Button from '../components/Button.jsx'
import PortalShell from '../components/portal/PortalShell.jsx'
import StatusBadge from '../components/portal/StatusBadge.jsx'
import DocumentChip from '../components/portal/DocumentChip.jsx'

const inputClasses =
  'w-full rounded-md border border-gold/25 bg-night px-4 py-3 text-base text-cream placeholder:text-muted-3 transition-colors focus:border-gold/60 focus-visible:outline-offset-0'

export default function Portal() {
  const { session } = useAuth()
  const userId = session.user.id

  const [requests, setRequests] = useState([])
  const [form, setForm] = useState({ service: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef(null)

  const loadRequests = async () => {
    const { data } = await supabase
      .from('requests')
      .select('*, documents(id, file_name, file_path, uploaded_by)')
      .order('created_at', { ascending: false })
    setRequests(data ?? [])
  }

  useEffect(() => {
    loadRequests()
    // Live status updates: refresh when any of my requests change
    const channel = supabase
      .channel('my-requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests', filter: `client_id=eq.${userId}` },
        () => loadRequests(),
      )
      .on('postgres_changes', { event: 'insert', schema: 'public', table: 'documents' }, () => loadRequests())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [userId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setBusy(true)
    try {
      const { data: request, error: reqErr } = await supabase
        .from('requests')
        .insert({ client_id: userId, service: form.service, note: form.note })
        .select()
        .single()
      if (reqErr) throw reqErr

      const files = Array.from(fileRef.current?.files ?? [])
      await uploadRequestDocuments({ files, clientId: userId, requestId: request.id, uploadedBy: userId })

      setForm({ service: '', note: '' })
      if (fileRef.current) fileRef.current.value = ''
      setSuccess('Request submitted. We will get back to you shortly.')
      loadRequests()
    } catch (err) {
      setError(err.message || 'Could not submit the request. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PortalShell title="My Requests" subtitle="Submit a service request and track its status.">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* ── New request ── */}
        <form
          onSubmit={handleSubmit}
          className="flex h-fit flex-col gap-4 rounded-xl border border-gold/25 bg-panel p-6"
        >
          <h2 className="font-display text-[19px] font-bold text-gold-bright">New Request</h2>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] tracking-[.5px] text-muted-2">Service *</span>
            <select
              name="service"
              required
              value={form.service}
              onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
              className={inputClasses}
            >
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
            <span className="text-[13px] tracking-[.5px] text-muted-2">Note</span>
            <textarea
              name="note"
              rows={3}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Anything we should know…"
              className={`${inputClasses} resize-none`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] tracking-[.5px] text-muted-2">Documents</span>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.doc,.docx,.csv,.zip"
              className="w-full cursor-pointer rounded-md border border-dashed border-gold/35 bg-night px-4 py-3 text-[14px] text-muted file:mr-3 file:cursor-pointer file:rounded file:border-0 file:bg-gold/15 file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-gold-bright"
            />
            <span className="text-[12.5px] text-muted-3">PDF, images, Excel, Word — attach as many as needed.</span>
          </label>

          {error && (
            <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-[13.5px] text-red-300">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-md border border-[#2f9e5f]/40 bg-[#2f9e5f]/10 px-4 py-2.5 text-[13.5px] text-[#5fce8f]">
              {success}
            </p>
          )}

          <Button type="submit" className="w-full text-center" disabled={busy}>
            {busy ? 'Submitting…' : 'Submit Request'}
          </Button>
        </form>

        {/* ── My requests ── */}
        <div className="flex flex-col gap-4">
          {requests.length === 0 && (
            <div className="rounded-xl border border-gold/18 bg-panel p-8 text-center text-[15px] text-muted-2">
              No requests yet. Submit your first request and it will appear here with its live status.
            </div>
          )}
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border border-gold/25 bg-panel p-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[16.5px] font-semibold text-ivory">{req.service}</span>
                <StatusBadge status={req.status} />
              </div>
              {req.note && <p className="mb-2 text-[14px] leading-relaxed text-muted-2">{req.note}</p>}
              <div className="mb-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-3">
                <span>
                  {new Date(req.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {req.documents?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {req.documents.map((doc) => (
                    <DocumentChip
                      key={doc.id}
                      doc={doc}
                      fromRcs={doc.uploaded_by !== userId}
                      onOpen={(d) => openDocument(d).catch((err) => setError(err.message))}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  )
}

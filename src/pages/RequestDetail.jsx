import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase, STATUS_LABELS, openDocument, uploadRequestDocuments } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/Button.jsx'
import PortalShell from '../components/portal/PortalShell.jsx'
import StatusBadge from '../components/portal/StatusBadge.jsx'
import DocumentChip from '../components/portal/DocumentChip.jsx'

const inputClasses =
  'w-full rounded-md border border-gold/25 bg-night px-4 py-3 text-base text-cream placeholder:text-muted-3 transition-colors focus:border-gold/60 focus-visible:outline-offset-0'

function eventLabel(event, isAdminView, clientName) {
  const byClient = !event.actor || event.actor === event._clientId
  const who = isAdminView ? (byClient ? clientName || 'Client' : 'RCS') : byClient ? 'You' : 'RCS'
  switch (event.type) {
    case 'created':
      return `Request submitted — ${event.detail}`
    case 'status_changed':
      return `Status changed to ${STATUS_LABELS[event.detail] ?? event.detail}`
    case 'document_added':
      return `${who} added document: ${event.detail}`
    default:
      return event.detail
  }
}

export default function RequestDetail() {
  const { id } = useParams()
  const { session, profile } = useAuth()
  const myId = session.user.id
  const isAdmin = profile?.role === 'admin'

  const [request, setRequest] = useState(null)
  const [events, setEvents] = useState([])
  const [comments, setComments] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [sendingComment, setSendingComment] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const commentsEndRef = useRef(null)

  const load = async () => {
    const { data: req } = await supabase
      .from('requests')
      .select('*, client:profiles!client_id(full_name, phone), documents(id, file_name, file_path, uploaded_by)')
      .eq('id', id)
      .maybeSingle()
    if (!req) {
      setNotFound(true)
      return
    }
    setRequest(req)
    const [{ data: evts }, { data: cmts }] = await Promise.all([
      supabase.from('request_events').select('*').eq('request_id', id).order('created_at'),
      supabase.from('request_comments').select('*').eq('request_id', id).order('created_at'),
    ])
    setEvents(evts ?? [])
    setComments(cmts ?? [])
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel(`request-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests', filter: `id=eq.${id}` }, load)
      .on('postgres_changes', { event: 'insert', schema: 'public', table: 'request_comments', filter: `request_id=eq.${id}` }, load)
      .on('postgres_changes', { event: 'insert', schema: 'public', table: 'documents', filter: `request_id=eq.${id}` }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [id])

  const addComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSendingComment(true)
    setError('')
    const { error: err } = await supabase
      .from('request_comments')
      .insert({ request_id: id, author: myId, body: comment.trim() })
    if (err) setError(err.message)
    else {
      setComment('')
      await load()
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    setSendingComment(false)
  }

  const addFiles = async (e) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    setError('')
    try {
      await uploadRequestDocuments({
        files,
        clientId: request.client_id,
        requestId: request.id,
        uploadedBy: myId,
      })
      if (fileRef.current) fileRef.current.value = ''
      await load()
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const updateStatus = async (status) => {
    setError('')
    const { error: err } = await supabase.from('requests').update({ status }).eq('id', id)
    if (err) setError(err.message)
    else load()
  }

  const backLink = isAdmin ? '/admin' : '/portal'

  if (notFound) {
    return (
      <PortalShell title="Request not found">
        <Link to={backLink} className="text-gold-bright hover:text-gold-light">
          ← Back
        </Link>
      </PortalShell>
    )
  }

  if (!request) {
    return (
      <PortalShell title="Loading…">
        <p className="text-[15px] text-muted-2">Fetching request…</p>
      </PortalShell>
    )
  }

  const clientName = request.client?.full_name
  const fromClient = (request.documents ?? []).filter((d) => d.uploaded_by === request.client_id)
  const fromRcs = (request.documents ?? []).filter((d) => d.uploaded_by !== request.client_id)
  const handleOpen = (doc) => openDocument(doc).catch((err) => setError(err.message))

  // Merge events + comments into one chronological timeline
  const timeline = [
    ...events.map((e) => ({ ...e, _kind: 'event', _clientId: request.client_id })),
    ...comments.map((c) => ({ ...c, _kind: 'comment', _clientId: request.client_id })),
  ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  return (
    <PortalShell
      title={request.service}
      subtitle={
        isAdmin
          ? `${clientName || 'Client'}${request.client?.phone ? ` · ${request.client.phone}` : ''}`
          : 'Request details and updates.'
      }
    >
      <Link to={backLink} className="mb-6 inline-block text-[14px] text-muted-2 hover:text-gold-light">
        ← Back to {isAdmin ? 'all requests' : 'my requests'}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* ── Left: status, note, documents, actions ── */}
        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-gold/25 bg-panel p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={request.status} />
              {isAdmin ? (
                <label className="flex items-center gap-2 text-[13px] text-muted-2">
                  Change status
                  <select
                    value={request.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="cursor-pointer rounded-md border border-gold/30 bg-night px-3 py-2 text-[13.5px] text-cream transition-colors focus:border-gold/60"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <span className="text-[13px] text-muted-3">
                  Submitted{' '}
                  {new Date(request.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
            {request.note && <p className="text-[14.5px] leading-relaxed text-muted-2">{request.note}</p>}
          </div>

          <div className="rounded-xl border border-gold/25 bg-panel p-5">
            <h2 className="mb-3 font-display text-[17px] font-bold text-gold-bright">Documents</h2>
            {fromClient.length === 0 && fromRcs.length === 0 && (
              <p className="mb-3 text-[14px] text-muted-3">No documents yet.</p>
            )}
            {fromClient.length > 0 && (
              <div className="mb-3">
                <span className="mb-1.5 block text-[12px] uppercase tracking-[1.5px] text-muted-3">
                  {isAdmin ? 'From client' : 'Uploaded by you'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {fromClient.map((doc) => (
                    <DocumentChip key={doc.id} doc={doc} onOpen={handleOpen} />
                  ))}
                </div>
              </div>
            )}
            {fromRcs.length > 0 && (
              <div className="mb-3">
                <span className="mb-1.5 block text-[12px] uppercase tracking-[1.5px] text-muted-3">
                  {isAdmin ? 'Sent to client' : 'From RCS'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {fromRcs.map((doc) => (
                    <DocumentChip key={doc.id} doc={doc} fromRcs onOpen={handleOpen} />
                  ))}
                </div>
              </div>
            )}
            <div className="mt-2 border-t border-gold/12 pt-3">
              <input ref={fileRef} type="file" multiple className="hidden" onChange={addFiles} />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="cursor-pointer rounded-md border border-gold/50 bg-gold/10 px-3 py-1.5 text-[13px] font-medium text-gold-bright transition-colors hover:bg-gold/20 disabled:cursor-default disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : isAdmin ? '↑ Send document to client' : '↑ Add documents'}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-[13.5px] text-red-300">
              {error}
            </p>
          )}
        </div>

        {/* ── Right: timeline with comments ── */}
        <div className="rounded-xl border border-gold/25 bg-panel p-5">
          <h2 className="mb-4 font-display text-[17px] font-bold text-gold-bright">Timeline</h2>
          <ol className="relative flex flex-col gap-4 border-l border-gold/25 pl-5">
            {timeline.map((item) => (
              <li key={`${item._kind}-${item.id}`} className="relative">
                <span
                  className={`absolute -left-[26px] top-1.5 size-2.5 rounded-full ${
                    item._kind === 'comment' ? 'bg-[#5b8ceb]' : 'bg-gold'
                  }`}
                />
                {item._kind === 'event' ? (
                  <p className="text-[14px] leading-snug text-mist">
                    {eventLabel(item, isAdmin, clientName)}
                  </p>
                ) : (
                  <div className="rounded-lg border border-[#5b8ceb]/25 bg-[#5b8ceb]/8 px-3 py-2">
                    <span className="mb-0.5 block text-[12px] font-semibold text-[#8fb3ff]">
                      {item.author === myId
                        ? 'You'
                        : item.author === request.client_id
                          ? clientName || 'Client'
                          : 'RCS'}
                    </span>
                    <p className="text-[14px] leading-snug text-cream">{item.body}</p>
                  </div>
                )}
                <span className="mt-0.5 block text-[12px] text-muted-3">
                  {new Date(item.created_at).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ol>
          <div ref={commentsEndRef} />

          <form onSubmit={addComment} className="mt-5 flex gap-2 border-t border-gold/12 pt-4">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a message…"
              className={inputClasses}
            />
            <Button type="submit" disabled={sendingComment || !comment.trim()} className="shrink-0">
              {sendingComment ? '…' : 'Send'}
            </Button>
          </form>
        </div>
      </div>
    </PortalShell>
  )
}

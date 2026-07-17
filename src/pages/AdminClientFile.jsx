import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import PortalShell from '../components/portal/PortalShell.jsx'
import StatusBadge from '../components/portal/StatusBadge.jsx'

export default function AdminClientFile() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [requests, setRequests] = useState([])
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => (data ? setClient(data) : setNotFound(true)))
    supabase
      .from('requests')
      .select('*, documents(id)')
      .eq('client_id', id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRequests(data ?? []))
  }, [id])

  if (notFound) {
    return (
      <PortalShell title="Client not found">
        <Link to="/admin/clients" className="text-gold-bright hover:text-gold-light">
          ← Back to clients
        </Link>
      </PortalShell>
    )
  }

  return (
    <PortalShell
      title={client?.full_name || 'Client'}
      subtitle="Complete client file — every request and document in one place."
    >
      <Link to="/admin/clients" className="mb-6 inline-block text-[14px] text-muted-2 hover:text-gold-light">
        ← Back to clients
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-gold/25 bg-panel p-5">
        {client?.phone && (
          <a href={`tel:${client.phone}`} className="text-[15px] font-medium text-gold-bright hover:text-gold-light">
            {client.phone}
          </a>
        )}
        <span className="text-[14px] text-muted-2">
          Client since{' '}
          {client &&
            new Date(client.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
        </span>
        <span className="text-[14px] text-muted-2">
          {requests.length} request{requests.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {requests.length === 0 && (
          <div className="rounded-xl border border-gold/18 bg-panel p-8 text-center text-[15px] text-muted-2">
            No requests from this client yet.
          </div>
        )}
        {requests.map((req) => (
          <Link
            key={req.id}
            to={`/request/${req.id}`}
            className="group rounded-xl border border-gold/25 bg-panel p-5 transition-[border-color,transform] duration-250 hover:-translate-y-[2px] hover:border-gold/60"
          >
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[16.5px] font-semibold text-ivory group-hover:text-gold-light">
                {req.service}
              </span>
              <StatusBadge status={req.status} />
            </div>
            {req.note && <p className="mb-1.5 text-[14px] leading-relaxed text-muted-2">{req.note}</p>}
            <span className="text-[13px] text-muted-3">
              {new Date(req.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
              {' · '}
              {req.documents?.length ?? 0} document{(req.documents?.length ?? 0) === 1 ? '' : 's'}
              {' · open →'}
            </span>
          </Link>
        ))}
      </div>
    </PortalShell>
  )
}

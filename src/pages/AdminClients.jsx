import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import PortalShell from '../components/portal/PortalShell.jsx'

const inputClasses =
  'w-full rounded-md border border-gold/25 bg-night px-4 py-3 text-base text-cream placeholder:text-muted-3 transition-colors focus:border-gold/60 focus-visible:outline-offset-0'

export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*, requests(count)')
      .eq('role', 'client')
      .order('created_at', { ascending: false })
      .then(({ data }) => setClients(data ?? []))
  }, [])

  const q = query.trim().toLowerCase()
  const visible = q
    ? clients.filter(
        (c) => c.full_name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q),
      )
    : clients

  return (
    <PortalShell title="Clients" subtitle="Every registered client, with their complete file one click away.">
      <div className="mb-6 max-w-[420px]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or phone…"
          className={inputClasses}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.length === 0 && (
          <div className="rounded-xl border border-gold/18 bg-panel p-8 text-center text-[15px] text-muted-2 md:col-span-2 lg:col-span-3">
            {clients.length === 0 ? 'No clients registered yet.' : 'No clients match your search.'}
          </div>
        )}
        {visible.map((client) => (
          <Link
            key={client.id}
            to={`/admin/clients/${client.id}`}
            className="group rounded-xl border border-gold/25 bg-panel p-5 transition-[border-color,transform] duration-250 hover:-translate-y-[2px] hover:border-gold/60"
          >
            <span className="mb-1 block text-[16.5px] font-semibold text-ivory group-hover:text-gold-light">
              {client.full_name || 'Unnamed client'}
            </span>
            <span className="mb-2 block text-[14px] text-muted-2">{client.phone || 'No phone'}</span>
            <span className="text-[13px] text-muted-3">
              {client.requests?.[0]?.count ?? 0} request{(client.requests?.[0]?.count ?? 0) === 1 ? '' : 's'}
              {' · joined '}
              {new Date(client.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </Link>
        ))}
      </div>
    </PortalShell>
  )
}

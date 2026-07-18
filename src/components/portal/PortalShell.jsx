import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import logoIcon from '../../assets/rcslogoicon.png'
import logoWordmark from '../../assets/rcslogo.png'

export default function PortalShell({ title, subtitle, children }) {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-dvh bg-night">
      <header className="border-b border-gold/25 bg-panel">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoIcon} alt="RCS crest" className="h-10 w-auto" />
            <img src={logoWordmark} alt="RCS Finance & Tax Experts" className="hidden h-7 w-auto md:block" />
          </Link>
          <div className="flex items-center gap-4">
            {profile?.role === 'admin' && (
              <nav className="mr-2 flex items-center gap-1 rounded-lg border border-gold/22 p-1">
                {[
                  { to: '/admin', label: 'Requests' },
                  { to: '/admin/clients', label: 'Clients' },
                  { to: '/admin/enquiries', label: 'Enquiries' },
                ].map((tab) => (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    end={tab.to === '/admin'}
                    className={({ isActive }) =>
                      `rounded-md px-3 py-1.5 text-[13.5px] font-medium transition-colors ${
                        isActive ? 'bg-gold/15 text-gold-bright' : 'text-muted hover:text-gold-bright'
                      }`
                    }
                  >
                    {tab.label}
                  </NavLink>
                ))}
              </nav>
            )}
            <span className="hidden text-[14px] text-muted md:block">
              {profile?.full_name || profile?.role}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="cursor-pointer rounded-md border border-gold/40 px-4 py-2 text-[13.5px] font-medium text-gold-bright transition-colors hover:bg-gold/8"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-5 py-8 md:px-8 md:py-10">
        <div className="mb-8">
          <h1 className="font-display text-[26px] font-bold text-ivory md:text-[30px]">{title}</h1>
          {subtitle && <p className="mt-1 text-[15px] text-muted-2">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  )
}

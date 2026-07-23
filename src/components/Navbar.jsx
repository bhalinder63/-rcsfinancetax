import { useEffect, useState } from 'react'
import { NAV_LINKS } from '../data.js'
import Button from './Button.jsx'
import logoIcon from '../assets/rcslogoicon.png'
import logoWordmark from '../assets/rcslogo.png'

const linkBase =
  'relative pb-[3px] transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300'

export default function Navbar({ onEnquiry }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.href.slice(1))).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-[10px] transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? 'border-gold/40 bg-[rgba(7,9,13,.99)] shadow-[0_10px_30px_rgba(0,0,0,.45)]'
          : 'border-gold/25 bg-[rgba(9,11,16,.96)]'
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-3 md:px-12 md:py-3.5">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="flex items-center gap-3.5"
        >
          <img src={logoIcon} alt="RCS crest" width="490" height="512" className="h-[42px] w-auto md:h-[54px]" />
          <img src={logoWordmark} alt="RCS Finance & Tax Experts" width="752" height="105" className="h-[30px] w-auto md:h-10" />
        </a>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex size-11 cursor-pointer flex-col items-stretch justify-center gap-[5px] rounded-md border border-gold/22 p-2.5 md:hidden"
        >
          <span className="h-0.5 rounded-full bg-gold-bright" />
          <span className="h-0.5 rounded-full bg-gold-bright" />
          <span className="h-0.5 rounded-full bg-gold-bright" />
        </button>

        {/* Desktop links */}
        <nav className="hidden items-center gap-[34px] text-[15px] font-medium tracking-[.5px] md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.href.slice(1)
            return (
              <a
                key={link.label}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`${linkBase} ${
                  isActive ? 'text-gold-bright after:scale-x-100' : 'text-cream hover:text-gold-bright'
                }`}
              >
                {link.label}
              </a>
            )
          })}
          <a href="/login" className="text-cream transition-colors hover:text-gold-bright">
            Login
          </a>
          <Button onClick={onEnquiry}>Get in Touch</Button>
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="flex animate-[fade-in_.2s_ease-out_both] flex-col border-b border-gold/25 bg-[rgba(9,11,16,.98)] px-5 pb-5 pt-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`border-b border-gold/10 px-1 py-3.5 text-[15px] font-medium tracking-[.5px] ${
                active === link.href.slice(1) ? 'text-gold-bright' : 'text-cream'
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/login"
            className="border-b border-gold/10 px-1 py-3.5 text-[15px] font-medium tracking-[.5px] text-cream"
          >
            Login
          </a>
          <Button
            className="mt-4 text-center"
            onClick={() => {
              setOpen(false)
              onEnquiry()
            }}
          >
            Get in Touch
          </Button>
        </nav>
      )}
    </header>
  )
}

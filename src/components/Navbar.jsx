import { useState } from 'react'
import { NAV_LINKS } from '../data.js'
import Button from './Button.jsx'
import logoIcon from '../assets/rcslogoicon.png'
import logoWordmark from '../assets/rcslogo.png'

export default function Navbar({ onEnquiry }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-gold/25 bg-[rgba(9,11,16,.96)] backdrop-blur-[10px]">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-3 md:px-12 md:py-3.5">
        <a href="#home" className="flex items-center gap-3.5">
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
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              className={
                i === 0
                  ? 'border-b-2 border-gold pb-[3px] text-gold-bright'
                  : 'pb-[3px] text-cream transition-colors hover:text-gold-bright'
              }
            >
              {link.label}
            </a>
          ))}
          <Button onClick={onEnquiry}>Get in Touch</Button>
        </nav>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="flex flex-col border-b border-gold/25 bg-[rgba(9,11,16,.98)] px-5 pb-5 pt-2 md:hidden">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`border-b border-gold/10 px-1 py-3.5 text-[15px] font-medium tracking-[.5px] ${
                i === 0 ? 'text-gold-bright' : 'text-cream'
              }`}
            >
              {link.label}
            </a>
          ))}
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

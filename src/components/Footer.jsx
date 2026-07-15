import { CONTACT, NAV_LINKS, FOOTER_SERVICES } from '../data.js'
import Reveal from './Reveal.jsx'
import logoIcon from '../assets/rcslogoicon.png'
import logoWordmark from '../assets/rcslogo.png'

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-gold/25 bg-panel px-5 pt-10 md:px-12 md:pt-12 lg:px-[72px] lg:pt-14">
      <div className="mx-auto w-full max-w-[1440px]">
      <div className="grid gap-8 pb-12 md:grid-cols-2 md:gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <Reveal className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img src={logoIcon} alt="RCS crest" width="490" height="512" loading="lazy" className="h-14 w-auto" />
            <img
              src={logoWordmark}
              alt="RCS Finance & Tax Experts"
              width="752"
              height="105"
              loading="lazy"
              className="h-[34px] w-auto"
            />
          </div>
          <p className="max-w-[340px] text-[15px] leading-relaxed text-muted-2 [text-wrap:pretty]">
            Empowering individuals and businesses with reliable, efficient and result-driven
            financial solutions.
          </p>
        </Reveal>

        <Reveal delay={80} className="flex flex-col gap-3">
          <span className="mb-1.5 font-display text-[17px] font-bold tracking-[1px] text-gold-bright">
            Quick Links
          </span>
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="py-1 -my-1 text-[15px] text-muted transition-colors hover:text-gold-light"
            >
              {link.label}
            </a>
          ))}
        </Reveal>

        <Reveal delay={160} className="flex flex-col gap-3">
          <span className="mb-1.5 font-display text-[17px] font-bold tracking-[1px] text-gold-bright">
            Our Services
          </span>
          {FOOTER_SERVICES.map((name) => (
            <a
              key={name}
              href="#services"
              className="py-1 -my-1 text-[15px] text-muted transition-colors hover:text-gold-light"
            >
              {name}
            </a>
          ))}
        </Reveal>

        <Reveal delay={240} className="flex flex-col gap-3.5">
          <span className="mb-1.5 font-display text-[17px] font-bold tracking-[1px] text-gold-bright">
            Contact Info
          </span>
          <span className="text-[15px] leading-[1.55] text-muted">
            {CONTACT.addressLines[0]}
            <br />
            {CONTACT.addressLines[1]}
          </span>
          <a href={CONTACT.phoneHref} className="text-[15px] font-medium text-gold-bright hover:text-gold-light">
            {CONTACT.phone}
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="py-1 -my-1 text-[15px] text-muted transition-colors hover:text-gold-light"
          >
            {CONTACT.email}
          </a>
          <span className="text-[15px] text-muted">{CONTACT.website}</span>
        </Reveal>
      </div>

      <div className="flex flex-col items-start gap-2.5 border-t border-gold/15 py-5 text-[13.5px] text-muted-3 md:flex-row md:items-center md:justify-between md:gap-x-6">
        <span>© 2026 RCS Finance &amp; Tax Experts. All Rights Reserved.</span>
        <span>Built on Trust, Transparency &amp; Excellence.</span>
        <div className="flex gap-[22px]">
          <a href="#" className="py-1 -my-1 text-muted-3 transition-colors hover:text-gold-light">
            Privacy Policy
          </a>
          <a href="#" className="py-1 -my-1 text-muted-3 transition-colors hover:text-gold-light">
            Terms &amp; Conditions
          </a>
        </div>
      </div>
      </div>
    </footer>
  )
}

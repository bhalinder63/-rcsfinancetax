import { CLIENTS } from '../data.js'

function LogoRow({ hidden }) {
  return (
    <div aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {CLIENTS.map((name) => (
        <span
          key={name}
          className="mx-7 whitespace-nowrap font-display text-[17px] font-semibold tracking-[2px] text-[#cfc9b8] opacity-70 transition-opacity hover:opacity-100 md:mx-10 md:text-[19px]"
        >
          {name}
        </span>
      ))}
      <span className="mx-7 whitespace-nowrap text-[13.5px] italic tracking-[1px] text-muted-3 md:mx-10">
        &amp; Many More
      </span>
    </div>
  )
}

export default function TrustedBy() {
  return (
    <section aria-label="Trusted by leading clients" className="border-b border-gold/18 bg-panel">
      <div className="mx-auto flex w-full max-w-[1440px] items-center">
        <div className="shrink-0 border-r border-gold/18 px-5 py-4 md:px-8 md:py-5">
          <span className="block text-[11px] uppercase tracking-[2.5px] text-gold-bright">Trusted By</span>
          <span className="block font-display text-[15px] font-bold text-ivory md:text-[17px]">
            Leading Clients
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
          <div className="flex w-max animate-[marquee_28s_linear_infinite] hover:[animation-play-state:paused]">
            <LogoRow />
            <LogoRow hidden />
          </div>
        </div>
      </div>
    </section>
  )
}

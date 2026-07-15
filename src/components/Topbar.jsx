import { CONTACT } from '../data.js'

function Dot() {
  return <span className="size-1.5 shrink-0 rounded-full bg-gold" />
}

export default function Topbar() {
  return (
    <div className="hidden border-b border-gold/18 bg-panel px-12 py-[9px] text-[13.5px] tracking-[.4px] text-muted md:block">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-x-7">
        <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
          <span className="flex items-center gap-[7px]">
            <Dot />
            {CONTACT.address}
          </span>
          <span className="flex items-center gap-[7px]">
            <Dot />
            {CONTACT.hours}
          </span>
        </div>
        <div className="flex items-center gap-x-7">
          <a href={`mailto:${CONTACT.email}`} className="text-muted transition-colors hover:text-gold-light">
            {CONTACT.email}
          </a>
          <a href={CONTACT.phoneHref} className="font-medium text-gold-bright hover:text-gold-light">
            {CONTACT.phone}
          </a>
        </div>
      </div>
    </div>
  )
}

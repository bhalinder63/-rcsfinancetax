import { SERVICES } from '../data.js'
import SectionHeading from './SectionHeading.jsx'
import Reveal from './Reveal.jsx'

export default function Services({ onEnquiry }) {
  return (
    <section id="services" className="bg-night px-5 pb-12 pt-14 md:px-12 md:pb-14 md:pt-16 lg:px-[72px] lg:pb-[72px] lg:pt-20">
      <div className="mx-auto w-full max-w-[1440px]">
        <Reveal>
          <SectionHeading
            plain="Our"
            accent="Core Services"
            sub="One-stop solution for all your tax, finance & business needs."
          />
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">
          {SERVICES.map((svc, i) => (
            <Reveal key={svc.tag} delay={(i % 4) * 40}>
              <button
                type="button"
                onClick={() => onEnquiry(svc.name)}
                aria-label={`Enquire about ${svc.name}`}
                className="group flex h-full w-full cursor-pointer flex-col gap-2.5 rounded-[10px] border border-gold/22 bg-linear-160 from-card to-[#0a0c12] px-6 py-[26px] text-left transition-[border-color,transform,box-shadow] duration-250 hover:-translate-y-[3px] hover:border-gold/60 hover:shadow-[0_14px_40px_rgba(212,175,55,.14)]"
              >
                <span className="font-display text-xl font-bold tracking-[1px] text-gold-bright transition-colors duration-250 group-hover:text-gold-light">
                  {svc.tag}
                </span>
                <span className="text-[17.5px] font-semibold text-ivory">{svc.name}</span>
                <span className="text-[14.5px] leading-normal text-muted-2">{svc.desc}</span>
                <span className="mt-auto pt-2 text-[13.5px] font-medium text-gold-bright opacity-0 transition-opacity duration-250 group-hover:opacity-100 group-focus-visible:opacity-100">
                  Enquire →
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

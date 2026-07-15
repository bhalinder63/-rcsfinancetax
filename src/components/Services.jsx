import { SERVICES } from '../data.js'
import SectionHeading from './SectionHeading.jsx'

export default function Services() {
  return (
    <section id="services" className="bg-night px-5 pb-12 pt-14 md:px-12 md:pb-14 md:pt-16 lg:px-[72px] lg:pb-[72px] lg:pt-20">
      <div className="mx-auto w-full max-w-[1440px]">
      <SectionHeading
        plain="Our"
        accent="Core Services"
        sub="One-stop solution for all your tax, finance & business needs."
      />
      <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">
        {SERVICES.map((svc) => (
          <div
            key={svc.tag}
            className="flex flex-col gap-2.5 rounded-[10px] border border-gold/22 bg-linear-160 from-card to-[#0a0c12] px-6 py-[26px] transition-[border-color,transform] duration-250 hover:-translate-y-[3px] hover:border-gold/60"
          >
            <span className="font-display text-xl font-bold tracking-[1px] text-gold-bright">
              {svc.tag}
            </span>
            <span className="text-[17.5px] font-semibold text-ivory">{svc.name}</span>
            <span className="text-[14.5px] leading-normal text-muted-2">{svc.desc}</span>
          </div>
        ))}
      </div>
      </div>
    </section>
  )
}

import { REASONS } from '../data.js'
import Button from './Button.jsx'
import Reveal from './Reveal.jsx'

export default function WhyRcs({ onEnquiry }) {
  return (
    <section
      id="why"
      className="bg-night px-5 pb-14 md:px-12 md:pb-16 lg:px-[72px] lg:pb-20"
    >
      <div className="mx-auto grid w-full max-w-[1440px] gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Reveal className="rounded-xl border border-gold/22 bg-panel px-6 py-[30px] md:px-11 md:py-[42px]">
        <h2 className="mb-[26px] font-display text-[32px] font-bold">
          <span className="text-ivory">Why Choose </span>
          <span className="text-gold-bright">RCS?</span>
        </h2>
        <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
          {REASONS.map((reason) => (
            <div key={reason} className="flex items-center gap-3 text-base text-mist">
              <span className="flex size-[22px] shrink-0 items-center justify-center rounded-full border border-gold text-[13px] text-gold-bright">
                ✓
              </span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal
        delay={120}
        id="about"
        className="flex flex-col justify-center gap-4 rounded-xl border border-gold/45 bg-linear-150 from-[#191307] from-0% to-[#0d0a05] to-70% px-6 py-[30px] shadow-[inset_0_1px_0_rgba(212,175,55,.25)] md:px-11 md:py-[42px]"
      >
        <h2 className="font-display text-[30px] font-bold text-gold-light">Need Expert Guidance?</h2>
        <p className="text-[16.5px] leading-relaxed text-sand [text-wrap:pretty]">
          Book an appointment with our experts and get the right solution for your tax and finance
          needs today.
        </p>
        <Button size="lg" className="mt-1.5 self-start" onClick={onEnquiry}>
          Schedule a Meeting →
        </Button>
      </Reveal>
      </div>
    </section>
  )
}

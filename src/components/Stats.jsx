import { STATS } from '../data.js'

export default function Stats() {
  return (
    <section
      aria-label="Key statistics"
      className="border-b border-gold/18 bg-panel px-5 py-[26px] md:px-12 md:py-[34px]"
    >
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-2 gap-y-5 md:grid-cols-3 lg:grid-cols-6 lg:gap-y-0">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1 px-3 py-1 text-center lg:border-r lg:border-gold/14 lg:last:border-r-0"
          >
            <span className="font-display text-[26px] font-bold text-gold-bright lg:text-[32px]">
              {stat.value}
            </span>
            <span className="text-[13.5px] uppercase tracking-[1px] text-muted-2">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

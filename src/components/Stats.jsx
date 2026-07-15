import { useEffect, useRef, useState } from 'react'
import { STATS } from '../data.js'
import Reveal from './Reveal.jsx'

function CountUp({ value, play }) {
  const match = value.match(/^(\d+)(.*)$/)
  const target = match ? parseInt(match[1], 10) : null
  const suffix = match ? match[2] : ''
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!play || target === null) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(target)
      return
    }
    let raf
    const start = performance.now()
    const duration = 1200
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      setN(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [play, target])

  if (target === null) return value
  return (
    <>
      {n}
      {suffix}
    </>
  )
}

export default function Stats() {
  const ref = useRef(null)
  const [play, setPlay] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      aria-label="Key statistics"
      className="border-b border-gold/18 bg-panel px-5 py-[26px] md:px-12 md:py-[34px]"
    >
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-2 gap-y-5 md:grid-cols-3 lg:grid-cols-6 lg:gap-y-0">
        {STATS.map((stat, i) => (
          <Reveal
            key={stat.label}
            delay={i * 60}
            className="flex flex-col items-center gap-1 px-3 py-1 text-center lg:border-r lg:border-gold/14 lg:last:border-r-0"
          >
            <span className="font-display text-[26px] font-bold text-gold-bright lg:text-[32px]">
              <CountUp value={stat.value} play={play} />
            </span>
            <span className="text-[13.5px] uppercase tracking-[1px] text-muted-2">{stat.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

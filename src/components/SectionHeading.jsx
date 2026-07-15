export default function SectionHeading({ plain, accent, sub }) {
  return (
    <div className="mb-12 text-center">
      <div className="mb-3.5 flex items-center justify-center gap-4">
        <span className="h-px w-14 bg-linear-to-r from-transparent to-gold" />
        <h2 className="font-display text-[clamp(30px,3.5vw,40px)] font-bold">
          <span className="text-ivory">{plain} </span>
          <span className="text-gold-bright">{accent}</span>
        </h2>
        <span className="h-px w-14 bg-linear-to-r from-gold to-transparent" />
      </div>
      {sub && <p className="text-[16.5px] text-muted-2">{sub}</p>}
    </div>
  )
}

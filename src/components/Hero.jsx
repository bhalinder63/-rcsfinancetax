import { TRUST_ITEMS } from '../data.js'
import Button from './Button.jsx'
import logoIcon from '../assets/rcslogoicon.png'
import logoWordmark from '../assets/rcslogo.png'

export default function Hero({ onEnquiry }) {
  return (
    <section
      id="home"
      className="relative border-b border-gold/20 bg-[radial-gradient(1100px_620px_at_78%_30%,#141a2a_0%,#0a0d14_55%,#07090d_100%)] px-5 pb-11 pt-12 md:px-12 md:pb-14 md:pt-16 lg:px-[72px] lg:pb-[72px] lg:pt-[84px]"
    >
      <div className="mx-auto grid w-full max-w-[1440px] items-center gap-6 md:gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <div className="mb-5 flex items-center gap-3.5">
            <span className="h-px w-11 origin-left animate-[draw-in_.5s_ease-out_both] bg-linear-to-r from-gold to-transparent" />
            <span className="animate-[rise_.5s_.1s_ease-out_both] text-sm font-medium tracking-[3.5px] text-gold-bright">
              YOUR TRUSTED PARTNER IN
            </span>
          </div>
          <h1 className="mb-[22px] animate-[rise_.55s_.15s_ease-out_both] font-display text-[clamp(36px,4.5vw,58px)] font-bold leading-[1.12]">
            <span className="text-ivory">Tax, Finance &amp;</span>
            <br />
            <span className="bg-linear-120 from-gold-light from-10% via-gold-deep via-60% to-gold-soft to-95% bg-clip-text text-transparent">
              Business Solutions.
            </span>
          </h1>
          <p className="mb-[34px] max-w-[520px] animate-[rise_.55s_.28s_ease-out_both] text-base leading-[1.65] text-muted [text-wrap:pretty] md:text-lg">
            Professional, transparent and reliable financial services for individuals, businesses and
            corporates — delivered by experienced experts.
          </p>
          <div className="mb-11 flex flex-wrap animate-[rise_.55s_.4s_ease-out_both] gap-[18px]">
            <Button href="#services" size="lg">
              Explore Services →
            </Button>
            <Button variant="outline" size="lg" onClick={onEnquiry}>
              Book Consultation
            </Button>
          </div>
          <div className="flex flex-wrap animate-[rise_.55s_.5s_ease-out_both] gap-x-[34px] gap-y-5">
            {TRUST_ITEMS.map((item, i) => (
              <div key={item.title} className="contents">
                {i > 0 && <div className="hidden w-px bg-gold/25 md:block" />}
                <div className="flex flex-col gap-[3px]">
                  <span className="text-[14.5px] font-semibold tracking-[.4px] text-ivory">
                    {item.title}
                  </span>
                  <span className="text-[13px] text-muted-3">{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-[320px] items-center justify-center md:min-h-[380px] lg:min-h-[440px]">
          <div className="absolute size-[480px] max-w-full animate-[fade-in_.8s_.3s_ease-out_both,rcs-glow_5s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,.22)_0%,transparent_65%)]" />
          <div className="relative flex animate-[card-in_.6s_.35s_ease-out_both] flex-col items-center gap-[18px] rounded-[14px] border border-gold/35 bg-linear-160 from-[rgba(20,24,36,.9)] to-[rgba(10,12,18,.95)] px-7 pb-[26px] pt-8 shadow-[0_30px_80px_rgba(0,0,0,.6),inset_0_1px_0_rgba(212,175,55,.2)] md:px-14 md:pb-9 md:pt-11">
            <img
              src={logoIcon}
              alt="RCS crest"
              width="490"
              height="512"
              fetchPriority="high"
              className="h-40 w-auto drop-shadow-[0_10px_30px_rgba(212,175,55,.35)] md:h-[230px]"
            />
            <img src={logoWordmark} alt="RCS Finance & Tax Experts" width="752" height="105" className="h-[34px] w-auto md:h-11" />
            <span className="text-center text-[13px] tracking-[2.5px] text-muted-3">
              TRUST · TRANSPARENCY · EXCELLENCE
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

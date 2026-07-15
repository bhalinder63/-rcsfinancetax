import { CONTACT } from '../data.js'

export default function WhatsAppFloat() {
  return (
    <a
      href={CONTACT.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-60 flex items-center gap-[9px] rounded-full bg-[#1fae54] px-5 py-3 text-sm font-semibold tracking-[.4px] text-white shadow-[0_8px_26px_rgba(0,0,0,.5)] transition-colors hover:bg-[#25c15f] md:bottom-7 md:right-7 md:px-6 md:py-[13px] md:text-[15px]"
    >
      <span className="size-[9px] rounded-full bg-white" />
      Chat on WhatsApp
    </a>
  )
}

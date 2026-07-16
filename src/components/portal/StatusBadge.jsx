import { STATUS_LABELS } from '../../lib/supabase.js'

const styles = {
  submitted: 'border-gold/40 bg-gold/10 text-gold-bright',
  in_process: 'border-[#5b8ceb]/40 bg-[#5b8ceb]/10 text-[#8fb3ff]',
  completed: 'border-[#2f9e5f]/40 bg-[#2f9e5f]/10 text-[#5fce8f]',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-medium tracking-[.3px] ${styles[status] ?? styles.submitted}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

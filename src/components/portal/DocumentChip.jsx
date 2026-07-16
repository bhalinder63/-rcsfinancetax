export default function DocumentChip({ doc, onOpen, fromRcs = false }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(doc)}
      className={`cursor-pointer rounded-md border px-3 py-1.5 text-[13px] transition-colors ${
        fromRcs
          ? 'border-gold/60 bg-gold/10 text-gold-light hover:bg-gold/20'
          : 'border-gold/30 bg-night text-gold-bright hover:border-gold/60 hover:bg-gold/8'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="mr-1.5 inline size-3.5 -translate-y-px"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
      {fromRcs && <span className="mr-1 font-semibold">RCS:</span>}
      {doc.file_name}
    </button>
  )
}

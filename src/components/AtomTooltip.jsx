export default function AtomTooltip({ atom }) {
  if (!atom) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="tooltip-enter pointer-events-none fixed bottom-4 right-4 z-50 min-w-[168px] max-w-[200px] rounded-md border border-[#EAEAEA] dark:border-white/10 bg-white/95 dark:bg-[#161619]/95 backdrop-blur-sm px-3 py-2.5 font-mono text-[11px] leading-relaxed shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      <Row label="Element" value={atom.element || '—'} />
      <Row label="Name" value={atom.name || '—'} />
      <Row label="Residue" value={`${atom.resName || '?'} ${atom.resSeq ?? ''}`.trim()} />
      <Row label="Chain" value={atom.chainID?.trim() || '—'} />
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[#787774] dark:text-white/45">{label}</span>
      <span className="tabular-nums text-[#111111] dark:text-[#EDEDEE] text-right truncate">{value}</span>
    </div>
  )
}

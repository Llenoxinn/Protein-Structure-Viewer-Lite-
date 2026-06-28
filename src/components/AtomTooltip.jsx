export default function AtomTooltip({ atom }) {
  if (!atom) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-[180px] rounded border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1e] p-3 font-mono text-[11px] leading-relaxed shadow-lg transition-opacity duration-200 opacity-100">
      <Row label="Element" value={atom.element || '—'} />
      <Row label="Name" value={atom.name || '—'} />
      <Row label="Residue" value={`${atom.resName || '?'} ${atom.resSeq ?? ''}`} />
      <Row label="Chain" value={atom.chainID?.trim() || '—'} />
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-400 dark:text-white/35">{label}</span>
      <span className="text-gray-700 dark:text-white/80 text-right truncate">{value}</span>
    </div>
  )
}

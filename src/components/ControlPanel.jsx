export default function ControlPanel({
  pdbId,
  setPdbId,
  onLoad,
  loading,
  error,
  colorScheme,
  setColorScheme,
  renderMode,
  setRenderMode,
  moleculeInfo,
}) {
  return (
    <div className="w-64 h-full flex flex-col bg-dark border-r border-white/5 text-xs select-none">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
        <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
        <span className="font-mono text-sm font-semibold tracking-wide text-white/80">
          PDB Viewer
        </span>
      </div>

      {/* Search */}
      <div className="px-5 pt-5 pb-4 border-b border-white/5 space-y-3">
        <label className="block text-[11px] font-medium text-white/40 uppercase tracking-wider">
          PDB Accession ID
        </label>
        <input
          type="text"
          value={pdbId}
          onChange={(e) => setPdbId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onLoad()}
          placeholder="e.g. 1CRN"
          className="w-full px-3 py-2 rounded border border-white/10 bg-white/5 text-white/80 placeholder-white/20 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors uppercase text-xs"
        />
        <button
          onClick={onLoad}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-accent text-dark text-xs font-semibold hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading && (
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeLinecap="round" />
            </svg>
          )}
          {loading ? 'Loading…' : 'Load Structure'}
        </button>
        {error && (
          <p className="text-[11px] leading-snug text-red-400">{error}</p>
        )}
      </div>

      {/* Appearance */}
      {moleculeInfo && (
        <div className="px-5 py-4 border-b border-white/5 space-y-4">
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
              Color Scheme
            </p>
            <div className="flex gap-3">
              {['element', 'chain'].map((opt) => (
                <div
                  key={opt}
                  onClick={() => setColorScheme(opt)}
                  className={`flex items-center gap-1.5 cursor-pointer capitalize ${
                    colorScheme === opt ? 'text-accent' : 'text-white/50 hover:text-white/70'
                  } transition-colors`}
                >
                  <span
                    className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${
                      colorScheme === opt
                        ? 'border-accent bg-accent/20'
                        : 'border-white/20'
                    }`}
                  >
                    {colorScheme === opt && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </span>
                  {opt}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
              Render Mode
            </p>
            <div className="flex gap-3">
              {['spheres', 'backbone', 'both'].map((opt) => (
                <div
                  key={opt}
                  onClick={() => setRenderMode(opt)}
                  className={`flex items-center gap-1.5 cursor-pointer capitalize ${
                    renderMode === opt ? 'text-accent' : 'text-white/50 hover:text-white/70'
                  } transition-colors`}
                >
                  <span
                    className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${
                      renderMode === opt
                        ? 'border-accent bg-accent/20'
                        : 'border-white/20'
                    }`}
                  >
                    {renderMode === opt && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    )}
                  </span>
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Molecule Info */}
      {moleculeInfo && (
        <div className="px-5 py-4 border-b border-white/5 space-y-2">
          <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
            Molecule Info
          </p>
          <div className="space-y-1 text-white/60">
            <InfoRow label="Atoms" value={moleculeInfo.atomCount} />
            <InfoRow label="Residues" value={moleculeInfo.residueCount} />
            <InfoRow
              label="Chains"
              value={moleculeInfo.chains.size ? [...moleculeInfo.chains].join(', ') : '—'}
            />
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="px-5 py-3 text-[10px] text-white/15">
        Data from RCSB PDB
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40">{label}</span>
      <span className="font-mono text-white/70">{value}</span>
    </div>
  )
}

import { useRef, useCallback } from 'react'
import { ELEMENT_COLORS, CHAIN_COLORS } from '../utils/colorSchemes'

const PDB_EXAMPLES = [
  { id: '1CRN', name: 'Crambin' },
  { id: '4HHB', name: 'Hemoglobin' },
  { id: '2PTC', name: 'Trypsin' },
  { id: '1BNA', name: 'DNA' },
  { id: '3HHR', name: 'Insulin' },
  { id: '1UBQ', name: 'Ubiquitin' },
]

const ACCENT_PRESETS = [
  { key: 'green', label: 'Green', color: '#4ade80' },
  { key: 'biology', label: 'Biology', color: '#dc2626' },
  { key: 'midnight', label: 'Midnight', color: '#3b82f6' },
]

export default function ControlPanel({
  pdbId,
  setPdbId,
  onLoad,
  onFileUpload,
  loading,
  error,
  colorScheme,
  setColorScheme,
  renderMode,
  setRenderMode,
  moleculeInfo,
  theme,
  toggleTheme,
  accent,
  setAccent,
  autoRotate,
  setAutoRotate,
  atomScale,
  setAtomScale,
  customElementColors,
  setCustomElementColors,
  customChainColors,
  setCustomChainColors,
  onExportPNG,
}) {
  const fileInputRef = useRef(null)

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (file) onFileUpload(file)
      e.target.value = ''
    },
    [onFileUpload],
  )

  const handleExampleSelect = useCallback(
    (e) => {
      const id = e.target.value
      if (id) {
        setPdbId(id)
        setTimeout(onLoad, 0)
      }
      e.target.value = ''
    },
    [onLoad, setPdbId],
  )

  const updateElementColor = useCallback(
    (el, color) => {
      setCustomElementColors((prev) => ({ ...prev, [el]: color }))
    },
    [],
  )

  const updateChainColor = useCallback(
    (idx, color) => {
      setCustomChainColors((prev) => {
        const next = [...prev]
        next[idx] = color
        return next
      })
    },
    [],
  )

  const isDark = theme === 'dark'

  return (
    <div className="w-64 h-full flex flex-col bg-white dark:bg-dark border-r border-gray-200 dark:border-white/5 text-xs select-none transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
          <span className="font-mono text-sm font-semibold tracking-wide text-gray-800 dark:text-white/80">
            PDB Viewer
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 dark:text-white/40 transition-colors"
          title={isDark ? 'Switch to Light' : 'Switch to Dark'}
        >
          {isDark ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="3" />
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" strokeLinecap="round" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 10.5A6 6 0 015.5 2 6 6 0 1014 10.5z" />
            </svg>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-200 dark:border-white/5 space-y-3">
        <label className="block text-[11px] font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider">
          PDB Accession ID
        </label>
        <input
          type="text"
          value={pdbId}
          onChange={(e) => setPdbId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onLoad()}
          placeholder="e.g. 1CRN"
          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-white/80 placeholder-gray-400 dark:placeholder-white/20 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors uppercase text-xs"
        />
        <button
          onClick={onLoad}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded bg-accent text-white dark:text-dark text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading && (
            <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeLinecap="round" />
            </svg>
          )}
          {loading ? 'Loading…' : 'Load Structure'}
        </button>

        {/* Quick examples */}
        <select
          onChange={handleExampleSelect}
          className="w-full px-3 py-1.5 rounded border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/30 text-[10px] outline-none cursor-pointer appearance-none"
        >
          <option value="">Quick examples …</option>
          {PDB_EXAMPLES.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.id} — {ex.name}
            </option>
          ))}
        </select>

        {/* File upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdb,.ent"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-1.5 rounded border border-dashed border-gray-300 dark:border-white/10 text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60 hover:border-gray-400 dark:hover:border-white/20 transition-colors text-[10px]"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 1v10M3 6l5-5 5 5M1 12v3h14v-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Upload PDB File
        </button>

        {error && (
          <p className="text-[11px] leading-snug text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* Appearance */}
      {moleculeInfo && (
        <div className="px-5 py-4 border-b border-gray-200 dark:border-white/5 space-y-4 overflow-y-auto">
          {/* Color Scheme */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider">
              Color Scheme
            </p>
            <div className="flex gap-3">
              {['element', 'chain', 'residue'].map((opt) => (
                <div
                  key={opt}
                  onClick={() => setColorScheme(opt)}
                  className={`flex items-center gap-1.5 cursor-pointer capitalize ${
                    colorScheme === opt
                      ? 'text-accent'
                      : 'text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70'
                  } transition-colors`}
                >
                  <span
                    className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${
                      colorScheme === opt
                        ? 'border-accent bg-accent/20'
                        : 'border-gray-300 dark:border-white/20'
                    }`}
                  >
                    {colorScheme === opt && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </span>
                  {opt}
                </div>
              ))}
            </div>
          </div>

          {/* Render Mode */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider">
              Render Mode
            </p>
            <div className="flex gap-3">
              {['spheres', 'backbone', 'both'].map((opt) => (
                <div
                  key={opt}
                  onClick={() => setRenderMode(opt)}
                  className={`flex items-center gap-1.5 cursor-pointer capitalize ${
                    renderMode === opt
                      ? 'text-accent'
                      : 'text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70'
                  } transition-colors`}
                >
                  <span
                    className={`w-3 h-3 rounded-full border-2 flex items-center justify-center transition-colors ${
                      renderMode === opt
                        ? 'border-accent bg-accent/20'
                        : 'border-gray-300 dark:border-white/20'
                    }`}
                  >
                    {renderMode === opt && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </span>
                  {opt}
                </div>
              ))}
            </div>
          </div>

          {/* Atom Size */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider">
                Atom Size
              </p>
              <span className="font-mono text-[10px] text-gray-400 dark:text-white/30">
                {atomScale.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.1"
              value={atomScale}
              onChange={(e) => setAtomScale(parseFloat(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-white/10 accent-accent"
            />
          </div>

          {/* Auto-rotate */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider">
              Auto Rotate
            </p>
            <button
              onClick={() => setAutoRotate((p) => !p)}
              className={`relative w-8 h-4 rounded-full transition-colors ${
                autoRotate ? 'bg-accent' : 'bg-gray-300 dark:bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
                  autoRotate ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Theme Accent */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider">
              Accent
            </p>
            <div className="flex gap-2">
              {ACCENT_PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setAccent(p.key)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    accent === p.key ? 'border-accent scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: p.color }}
                  title={p.label}
                />
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="space-y-3 pt-1">
            <p className="text-[11px] font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider">
              Custom Colors
            </p>

            {/* Element colors */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-gray-400 dark:text-white/30">Elements</p>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.keys(ELEMENT_COLORS).map((el) => (
                  <label
                    key={el}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    <input
                      type="color"
                      value={customElementColors[el] || ELEMENT_COLORS[el]}
                      onChange={(e) => updateElementColor(el, e.target.value)}
                      className="w-4 h-4 rounded cursor-pointer border-0 p-0"
                    />
                    <span className="font-mono text-[10px] text-gray-500 dark:text-white/40">{el}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chain colors */}
            {moleculeInfo.chains.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-gray-400 dark:text-white/30">Chains</p>
                <div className="flex flex-wrap gap-1.5">
                  {moleculeInfo.chains.map((ch, i) => (
                    <label key={ch} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="color"
                        value={customChainColors[i] || CHAIN_COLORS[i % CHAIN_COLORS.length]}
                        onChange={(e) => updateChainColor(i, e.target.value)}
                        className="w-4 h-4 rounded cursor-pointer border-0 p-0"
                      />
                      <span className="font-mono text-[10px] text-gray-500 dark:text-white/40">
                        {ch}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Molecule Info */}
      {moleculeInfo && (
        <div className="px-5 py-4 border-b border-gray-200 dark:border-white/5 space-y-2">
          <p className="text-[11px] font-medium text-gray-500 dark:text-white/40 uppercase tracking-wider">
            Molecule Info
          </p>
          <div className="space-y-1">
            <InfoRow label="Atoms" value={moleculeInfo.atomCount} />
            <InfoRow label="Residues" value={moleculeInfo.residueCount} />
            <InfoRow
              label="Chains"
              value={moleculeInfo.chains.length ? moleculeInfo.chains.join(', ') : '—'}
            />
          </div>
        </div>
      )}

      {/* Export */}
      {moleculeInfo && (
        <div className="px-5 py-3 border-b border-gray-200 dark:border-white/5">
          <button
            onClick={onExportPNG}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 dark:border-white/10 text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60 hover:border-gray-400 dark:hover:border-white/20 transition-colors text-[10px]"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 10.5V13a1 1 0 001 1h10a1 1 0 001-1v-2.5M11 5.5L8 2.5 5 5.5M8 2.5v7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export PNG
          </button>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="px-5 py-3 text-[10px] text-gray-400 dark:text-white/15">
        Data from RCSB PDB
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400 dark:text-white/40">{label}</span>
      <span className="font-mono text-gray-600 dark:text-white/70">{value}</span>
    </div>
  )
}

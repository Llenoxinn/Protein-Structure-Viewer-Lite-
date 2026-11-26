import { useRef, useCallback } from 'react'
import { ELEMENT_COLORS, getChainDefaultColor } from '../utils/colorSchemes'

const PDB_EXAMPLES = [
  { id: '1CRN', name: 'Crambin' },
  { id: '4HHB', name: 'Hemoglobin' },
  { id: '2PTC', name: 'Trypsin' },
  { id: '1BNA', name: 'DNA' },
  { id: '3HHR', name: 'Growth Hormone' },
  { id: '1UBQ', name: 'Ubiquitin' },
]

const ACCENT_PRESETS = [
  { key: 'green', label: 'Green', color: '#4ade80' },
  { key: 'biology', label: 'Biology Red', color: '#dc2626' },
  { key: 'midnight', label: 'Midnight Blue', color: '#3b82f6' },
]

const COLOR_SCHEMES = ['element', 'chain', 'residue']
const RENDER_MODES = ['spheres', 'backbone', 'both']

export default function ControlPanel({
  onShowOverview,
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
        onLoad(id)
      }
      e.target.value = ''
    },
    [onLoad, setPdbId],
  )

  const updateElementColor = useCallback(
    (el, color) => {
      setCustomElementColors((prev) => ({ ...prev, [el]: color }))
    },
    [setCustomElementColors],
  )

  const updateChainColor = useCallback(
    (ch, color) => {
      setCustomChainColors((prev) => ({ ...prev, [ch]: color }))
    },
    [setCustomChainColors],
  )

  const isDark = theme === 'dark'

  return (
    <aside className="w-[272px] shrink-0 h-full flex flex-col bg-white dark:bg-[#111114] border-r border-[#EAEAEA] dark:border-white/[0.08] text-xs select-none transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#EAEAEA] dark:border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
          <span className="font-mono text-[13px] font-semibold tracking-tight text-[#111111] dark:text-[#EDEDEE]">
            PDB Viewer
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onShowOverview && (
            <button
              type="button"
              onClick={onShowOverview}
              className="btn-press px-2 py-1 rounded-md text-[10px] font-medium text-[#6B6A67] dark:text-white/55 hover:text-[#111111] dark:hover:text-white hover:bg-[#F7F6F3] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Overview
            </button>
          )}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            className="btn-press p-1.5 rounded-md text-[#6B6A67] dark:text-white/55 hover:text-[#111111] dark:hover:text-white hover:bg-[#F7F6F3] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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
      </div>

      {/* Structure Loader */}
      <div className="px-4 py-4 border-b border-[#EAEAEA] dark:border-white/[0.08] space-y-2.5">
        <label
          htmlFor="pdb-id-input"
          className="block text-[10px] font-medium text-[#6B6A67] dark:text-white/50 uppercase tracking-[0.06em]"
        >
          PDB Accession ID
        </label>
        <input
          id="pdb-id-input"
          type="text"
          value={pdbId}
          onChange={(e) => setPdbId(e.target.value)}
          onKeyDown={(e) => !loading && e.key === 'Enter' && onLoad()}
          placeholder="e.g. 1CRN"
          spellCheck={false}
          className="w-full px-3 py-2 rounded-md border border-[#EAEAEA] dark:border-white/10 bg-[#FBFBFA] dark:bg-white/[0.04] font-mono text-xs text-[#111111] dark:text-[#EDEDEE] placeholder-[#9B9A97] dark:placeholder-white/30 outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-colors uppercase"
        />
        <button
          type="button"
          onClick={() => onLoad()}
          disabled={loading}
          className="btn-press w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-md bg-[#111111] text-white hover:bg-[#2A2A2D] dark:bg-accent dark:text-[#0D0D0F] dark:hover:opacity-90 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          {loading && (
            <svg className="w-3.5 h-3.5 spin-fast" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeLinecap="round" />
            </svg>
          )}
          {loading ? 'Loading…' : 'Load Structure'}
        </button>

        {/* Quick examples */}
        <div className="relative">
          <select
            aria-label="Quick example structures"
            onChange={handleExampleSelect}
            disabled={loading}
            className="w-full pl-3 pr-7 py-1.5 rounded-md border border-[#EAEAEA] dark:border-white/10 bg-[#F7F6F3] dark:bg-white/[0.04] text-[#4A4947] dark:text-white/65 text-[11px] outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed appearance-none transition-colors"
          >
            <option value="">Quick examples…</option>
            {PDB_EXAMPLES.map((ex) => (
              <option key={ex.id} value={ex.id} className="bg-white dark:bg-[#161619] text-[#111111] dark:text-[#EDEDEE]">
                {ex.id} — {ex.name}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6B6A67] dark:text-white/45"
            fill="none"
            viewBox="0 0 16 16"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* File upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdb,.ent"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="btn-press w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-dashed border-[#DCDCD8] dark:border-white/15 text-[#555452] dark:text-white/60 hover:text-[#111111] dark:hover:text-white/85 hover:border-[#BDBDB8] dark:hover:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 text-[11px]"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 1v10M3 6l5-5 5 5M1 12v3h14v-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Upload .pdb File
        </button>

        {error && (
          <p role="alert" className="text-[11px] leading-snug text-[#9F2F2D] dark:text-red-400 bg-[#FDEBEC] dark:bg-red-500/10 border border-[#F5C6C8] dark:border-red-500/20 rounded-md px-2.5 py-1.5">
            {error}
          </p>
        )}
      </div>

      {/* Appearance Controls */}
      {moleculeInfo && (
        <div className="sidebar-scroll flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <SegmentedControl
            label="Color Scheme"
            options={COLOR_SCHEMES}
            value={colorScheme}
            onChange={setColorScheme}
          />

          <SegmentedControl
            label="Render Mode"
            options={RENDER_MODES}
            value={renderMode}
            onChange={setRenderMode}
          />

          {/* Atom Size */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="atom-scale-slider"
                className="text-[10px] font-medium text-[#6B6A67] dark:text-white/50 uppercase tracking-[0.06em]"
              >
                Atom Size
              </label>
              <span className="font-mono tabular-nums text-[11px] text-[#555452] dark:text-white/60">
                {atomScale.toFixed(1)}×
              </span>
            </div>
            <input
              id="atom-scale-slider"
              type="range"
              min="0.3"
              max="2.5"
              step="0.1"
              value={atomScale}
              onChange={(e) => setAtomScale(parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#EAEAEA] dark:bg-white/10 accent-accent"
            />
          </div>

          {/* Auto-rotate */}
          <div className="flex items-center justify-between py-0.5">
            <span className="text-[10px] font-medium text-[#6B6A67] dark:text-white/50 uppercase tracking-[0.06em]">
              Auto Rotate
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={autoRotate}
              aria-label="Toggle auto rotate"
              onClick={() => setAutoRotate((p) => !p)}
              className={`relative w-8 h-4 rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                autoRotate ? 'bg-accent' : 'bg-[#DCDCD8] dark:bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0 w-3 h-3 rounded-full bg-white transition-transform duration-150 ${
                  autoRotate ? 'translate-x-[18px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Theme Accent */}
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-[#6B6A67] dark:text-white/50 uppercase tracking-[0.06em]">
              Accent
            </p>
            <div className="flex gap-2">
              {ACCENT_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setAccent(p.key)}
                  aria-label={`Accent: ${p.label}`}
                  aria-pressed={accent === p.key}
                  title={p.label}
                  className={`btn-press w-5 h-5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                    accent === p.key
                      ? 'ring-2 ring-offset-2 ring-[#111111] dark:ring-white/80 ring-offset-white dark:ring-offset-[#111114]'
                      : 'opacity-75 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: p.color }}
                />
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="space-y-2.5 pt-2 border-t border-[#EAEAEA] dark:border-white/[0.08]">
            <p className="text-[10px] font-medium text-[#6B6A67] dark:text-white/50 uppercase tracking-[0.06em]">
              Custom Colors
            </p>

            {/* Element colors */}
            <div className="space-y-1.5">
              <p className="text-[10px] text-[#787774] dark:text-white/45">Elements</p>
              <div className="grid grid-cols-3 gap-1.5">
                {Object.keys(ELEMENT_COLORS).map((el) => (
                  <label
                    key={el}
                    className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#F7F6F3] dark:hover:bg-white/[0.04] cursor-pointer transition-colors"
                  >
                    <input
                      type="color"
                      aria-label={`Color for element ${el}`}
                      value={customElementColors[el] || ELEMENT_COLORS[el]}
                      onChange={(e) => updateElementColor(el, e.target.value)}
                      className="color-swatch w-3.5 h-3.5 cursor-pointer shrink-0"
                    />
                    <span className="font-mono text-[11px] text-[#4A4947] dark:text-white/70">{el}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chain colors */}
            {moleculeInfo.chains.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] text-[#787774] dark:text-white/45">Chains</p>
                <div className="flex flex-wrap gap-1.5">
                  {moleculeInfo.chains.map((ch) => (
                    <label
                      key={ch}
                      className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-[#F7F6F3] dark:hover:bg-white/[0.04] cursor-pointer transition-colors"
                    >
                      <input
                        type="color"
                        aria-label={`Color for chain ${ch}`}
                        value={customChainColors[ch] || getChainDefaultColor(ch)}
                        onChange={(e) => updateChainColor(ch, e.target.value)}
                        className="color-swatch w-3.5 h-3.5 cursor-pointer shrink-0"
                      />
                      <span className="font-mono text-[11px] text-[#4A4947] dark:text-white/70">
                        {ch.trim() || '—'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Molecule Info */}
          <div className="space-y-2 pt-3 border-t border-[#EAEAEA] dark:border-white/[0.08]">
            <p className="text-[10px] font-medium text-[#6B6A67] dark:text-white/50 uppercase tracking-[0.06em]">
              Molecule Info
            </p>
            <div className="space-y-1">
              <InfoRow label="Atoms" value={moleculeInfo.atomCount.toLocaleString()} />
              <InfoRow label="Residues" value={moleculeInfo.residueCount.toLocaleString()} />
              <InfoRow
                label="Chains"
                value={moleculeInfo.chains.length ? moleculeInfo.chains.map((c) => c.trim() || '—').join(', ') : '—'}
              />
            </div>
          </div>

          {/* Export */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onExportPNG}
              className="btn-press w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-[#EAEAEA] dark:border-white/10 bg-[#F7F6F3] dark:bg-white/[0.04] text-[#2F3437] dark:text-white/75 hover:bg-[#EFECE6] dark:hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 text-[11px] font-medium"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 10.5V13a1 1 0 001 1h10a1 1 0 001-1v-2.5M11 5.5L8 2.5 5 5.5M8 2.5v7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export PNG
            </button>
          </div>
        </div>
      )}

      {!moleculeInfo && <div className="flex-1" />}

      {/* Footer with keyboard shortcuts */}
      <div className="px-4 py-2.5 border-t border-[#EAEAEA] dark:border-white/[0.08] flex items-center justify-between text-[10px] text-[#787774] dark:text-white/45">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <kbd className="kbd-key">R</kbd>
            <span>Reset</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="kbd-key">E</kbd>
            <span>Color</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="kbd-key">M</kbd>
            <span>Mode</span>
          </span>
        </div>
        <span>RCSB</span>
      </div>
    </aside>
  )
}

function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-medium text-[#6B6A67] dark:text-white/50 uppercase tracking-[0.06em]">
        {label}
      </p>
      <div
        role="radiogroup"
        aria-label={label}
        className="grid grid-cols-3 gap-0.5 p-0.5 rounded-md bg-[#F7F6F3] dark:bg-white/[0.05] border border-[#EAEAEA] dark:border-white/[0.08]"
      >
        {options.map((opt) => {
          const active = value === opt
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt)}
              className={`btn-press py-1 px-1.5 rounded-[4px] text-[11px] capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                active
                  ? 'bg-white dark:bg-[#1E1E22] text-[#111111] dark:text-white font-medium border border-[#EAEAEA] dark:border-white/10'
                  : 'text-[#6B6A67] dark:text-white/55 hover:text-[#111111] dark:hover:text-white/80 border border-transparent'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-[#6B6A67] dark:text-white/50">{label}</span>
      <span className="font-mono tabular-nums text-[#111111] dark:text-white/85">{value}</span>
    </div>
  )
}

import { useRef, useCallback, useState } from 'react'
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
  onResetColors,
  onResetCamera,
  onExportPNG,
}) {
  const fileInputRef = useRef(null)
  const [inspectorOpen, setInspectorOpen] = useState(true)

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
  const hasCustomColors =
    Object.keys(customElementColors).length > 0 || Object.keys(customChainColors).length > 0

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-between p-3 sm:p-4 select-none">
      {/* Top Floating Command Bar */}
      <div className="flex items-start justify-between gap-3">
        {/* Left: Brand + Structure Loader Pill */}
        <div className="pointer-events-auto flex flex-col gap-2 max-w-full">
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white/90 dark:bg-[#141417]/88 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            {/* Brand */}
            <div className="flex items-center gap-2 pl-2 pr-2.5 py-1 border-r border-[#EAEAEA] dark:border-white/10">
              <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
              <span className="font-mono text-xs font-semibold tracking-tight text-[#111111] dark:text-[#EDEDEE]">
                PDB Viewer
              </span>
            </div>

            {/* Compact PDB Input + Load */}
            <div className="flex items-center gap-1">
              <input
                id="pdb-id-input"
                type="text"
                aria-label="PDB Accession ID"
                value={pdbId}
                onChange={(e) => setPdbId(e.target.value)}
                onKeyDown={(e) => !loading && e.key === 'Enter' && onLoad()}
                placeholder="1CRN"
                spellCheck={false}
                className="w-20 sm:w-24 px-2.5 py-1.5 rounded-md border border-[#EAEAEA] dark:border-white/10 bg-[#F7F6F3] dark:bg-white/[0.05] font-mono text-xs text-[#111111] dark:text-[#EDEDEE] placeholder-[#9B9A97] dark:placeholder-white/30 outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-colors uppercase"
              />
              <button
                type="button"
                onClick={() => onLoad()}
                disabled={loading}
                className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111111] text-white hover:bg-[#2A2A2D] dark:bg-accent dark:text-[#0D0D0F] dark:hover:opacity-90 text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                {loading && (
                  <svg className="w-3 h-3 spin-fast" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeLinecap="round" />
                  </svg>
                )}
                <span>{loading ? 'Loading' : 'Load'}</span>
              </button>
            </div>

            {/* Quick Examples Dropdown */}
            <div className="relative">
              <select
                aria-label="Quick example structures"
                onChange={handleExampleSelect}
                disabled={loading}
                className="pl-2.5 pr-6 py-1.5 rounded-md border border-[#EAEAEA] dark:border-white/10 bg-[#F7F6F3] dark:bg-white/[0.05] text-[#4A4947] dark:text-white/70 text-[11px] outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed appearance-none transition-colors"
              >
                <option value="">Examples</option>
                {PDB_EXAMPLES.map((ex) => (
                  <option
                    key={ex.id}
                    value={ex.id}
                    className="bg-white dark:bg-[#161619] text-[#111111] dark:text-[#EDEDEE]"
                  >
                    {ex.id} — {ex.name}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#6B6A67] dark:text-white/45"
                fill="none"
                viewBox="0 0 16 16"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Upload Local File */}
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
              title="Upload local .pdb or .ent file"
              className="btn-press inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#EAEAEA] dark:border-white/10 bg-transparent hover:bg-[#F7F6F3] dark:hover:bg-white/[0.06] text-[#4A4947] dark:text-white/70 hover:text-[#111111] dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 text-[11px]"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 10V2M4.5 5.5L8 2l3.5 3.5M2 11.5V13a1 1 0 001 1h10a1 1 0 001-1v-1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="hidden sm:inline">Upload</span>
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="w-fit max-w-md text-[11px] leading-snug text-[#9F2F2D] dark:text-red-300 bg-[#FDEBEC]/95 dark:bg-[#2A1416]/95 backdrop-blur-md border border-[#F5C6C8] dark:border-red-500/30 rounded-lg px-3 py-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            >
              {error}
            </p>
          )}
        </div>

        {/* Right: Overview + Theme + Inspector Toggle */}
        <div className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white/90 dark:bg-[#141417]/88 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          {onShowOverview && (
            <button
              type="button"
              onClick={onShowOverview}
              className="btn-press px-2.5 py-1.5 rounded-md text-[11px] font-medium text-[#555452] dark:text-white/65 hover:text-[#111111] dark:hover:text-white hover:bg-[#F7F6F3] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              Overview
            </button>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            className="btn-press p-1.5 rounded-md text-[#555452] dark:text-white/65 hover:text-[#111111] dark:hover:text-white hover:bg-[#F7F6F3] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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

          {moleculeInfo && (
            <button
              type="button"
              onClick={() => setInspectorOpen((v) => !v)}
              aria-expanded={inspectorOpen}
              aria-label="Toggle inspector panel"
              title="Toggle Inspector"
              className={`btn-press inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                inspectorOpen
                  ? 'bg-[#F7F6F3] dark:bg-white/10 text-[#111111] dark:text-white'
                  : 'text-[#555452] dark:text-white/65 hover:text-[#111111] dark:hover:text-white hover:bg-[#F7F6F3] dark:hover:bg-white/[0.06]'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
                <path d="M10 2.5v11" />
              </svg>
              <span className="hidden sm:inline">Inspector</span>
            </button>
          )}
        </div>
      </div>

      {/* Middle: Collapsible Floating Right Inspector */}
      {moleculeInfo && inspectorOpen && (
        <div className="flex-1 flex items-start justify-end py-3 min-h-0">
          <aside className="pointer-events-auto sidebar-scroll w-[252px] max-h-full overflow-y-auto rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white/90 dark:bg-[#141417]/88 backdrop-blur-md shadow-[0_8px_28px_rgba(0,0,0,0.08)] p-4 space-y-4">
            {/* Compact 3-Stat Bento Strip */}
            <div className="grid grid-cols-3 gap-1.5">
              <StatTile label="Atoms" value={moleculeInfo.atomCount.toLocaleString()} />
              <StatTile label="Residues" value={moleculeInfo.residueCount.toLocaleString()} />
              <StatTile
                label="Chains"
                value={moleculeInfo.chains.length ? moleculeInfo.chains.map((c) => c.trim() || '—').join(',') : '—'}
              />
            </div>

            {/* Atom Scale */}
            <div className="space-y-1.5 pt-2 border-t border-[#EAEAEA] dark:border-white/[0.08]">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="atom-scale-slider"
                  className="text-[10px] font-medium text-[#6B6A67] dark:text-white/50 uppercase tracking-[0.06em]"
                >
                  Atom Scale
                </label>
                <span className="font-mono tabular-nums text-[11px] text-[#4A4947] dark:text-white/70">
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

            {/* Custom Palette (Context-aware + Reset) */}
            <div className="space-y-2.5 pt-2 border-t border-[#EAEAEA] dark:border-white/[0.08]">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-[#6B6A67] dark:text-white/50 uppercase tracking-[0.06em]">
                  Palette
                </p>
                {hasCustomColors && (
                  <button
                    type="button"
                    onClick={onResetColors}
                    className="btn-press text-[10px] text-[#6B6A67] dark:text-white/50 hover:text-[#111111] dark:hover:text-white"
                  >
                    Reset
                  </button>
                )}
              </div>

              {colorScheme === 'residue' ? (
                <p className="text-[11px] leading-relaxed text-[#787774] dark:text-white/45">
                  Residue mode assigns deterministic HSL colors per amino acid. Switch to Element or Chain to customize swatches.
                </p>
              ) : colorScheme === 'chain' ? (
                <div className="flex flex-wrap gap-1.5">
                  {moleculeInfo.chains.map((ch) => (
                    <label
                      key={ch}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#EAEAEA] dark:border-white/[0.08] bg-[#F7F6F3] dark:bg-white/[0.04] hover:border-[#BDBDB8] dark:hover:border-white/20 cursor-pointer transition-colors"
                    >
                      <input
                        type="color"
                        aria-label={`Color for chain ${ch}`}
                        value={customChainColors[ch] || getChainDefaultColor(ch)}
                        onChange={(e) => updateChainColor(ch, e.target.value)}
                        className="color-swatch w-3.5 h-3.5 cursor-pointer shrink-0"
                      />
                      <span className="font-mono text-[11px] text-[#2F3437] dark:text-white/80">
                        {ch.trim() || '—'}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.keys(ELEMENT_COLORS).map((el) => (
                    <label
                      key={el}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-[#EAEAEA] dark:border-white/[0.08] bg-[#F7F6F3] dark:bg-white/[0.04] hover:border-[#BDBDB8] dark:hover:border-white/20 cursor-pointer transition-colors"
                    >
                      <input
                        type="color"
                        aria-label={`Color for element ${el}`}
                        value={customElementColors[el] || ELEMENT_COLORS[el]}
                        onChange={(e) => updateElementColor(el, e.target.value)}
                        className="color-swatch w-3.5 h-3.5 cursor-pointer shrink-0"
                      />
                      <span className="font-mono text-[11px] text-[#2F3437] dark:text-white/80">{el}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Accent */}
            <div className="flex items-center justify-between pt-2 border-t border-[#EAEAEA] dark:border-white/[0.08]">
              <span className="text-[10px] font-medium text-[#6B6A67] dark:text-white/50 uppercase tracking-[0.06em]">
                Accent
              </span>
              <div className="flex items-center gap-2">
                {ACCENT_PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setAccent(p.key)}
                    aria-label={`Accent: ${p.label}`}
                    aria-pressed={accent === p.key}
                    title={p.label}
                    className={`btn-press w-4 h-4 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                      accent === p.key
                        ? 'ring-2 ring-offset-2 ring-[#111111] dark:ring-white/80 ring-offset-white dark:ring-offset-[#141417]'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: p.color }}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Bottom Floating Studio Dock + Subtle Shortcuts */}
      <div className="flex items-end justify-between gap-3">
        {/* Bottom-Left Keyboard Hints (Desktop) */}
        <div className="hidden lg:flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border border-[#EAEAEA]/80 dark:border-white/[0.08] bg-white/75 dark:bg-[#141417]/75 backdrop-blur-md text-[10px] text-[#6B6A67] dark:text-white/50">
          <span className="inline-flex items-center gap-1">
            <kbd className="kbd-key">R</kbd> Reset
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="kbd-key">E</kbd> Color
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="kbd-key">M</kbd> Mode
          </span>
        </div>

        {/* Bottom-Center Viewport Studio Dock */}
        {moleculeInfo && (
          <div className="pointer-events-auto mx-auto flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white/90 dark:bg-[#141417]/88 backdrop-blur-md shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
            <DockSegmented
              label="Render Mode"
              options={RENDER_MODES}
              value={renderMode}
              onChange={setRenderMode}
            />

            <div className="hidden sm:block w-px h-5 bg-[#EAEAEA] dark:bg-white/10" />

            <DockSegmented
              label="Color Scheme"
              options={COLOR_SCHEMES}
              value={colorScheme}
              onChange={setColorScheme}
            />

            <div className="hidden sm:block w-px h-5 bg-[#EAEAEA] dark:bg-white/10" />

            {/* Viewport Actions */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                role="switch"
                aria-checked={autoRotate}
                onClick={() => setAutoRotate((p) => !p)}
                title="Toggle auto-rotate"
                className={`btn-press inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                  autoRotate
                    ? 'bg-accent/15 text-[#111111] dark:text-accent border border-accent/40'
                    : 'text-[#555452] dark:text-white/65 hover:text-[#111111] dark:hover:text-white hover:bg-[#F7F6F3] dark:hover:bg-white/[0.06] border border-transparent'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13.5 8a5.5 5.5 0 11-1.35-3.6M13.5 2.5v2.4h-2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden md:inline">Spin</span>
              </button>

              <button
                type="button"
                onClick={onResetCamera}
                title="Reset camera (R)"
                className="btn-press inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-[#555452] dark:text-white/65 hover:text-[#111111] dark:hover:text-white hover:bg-[#F7F6F3] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="8" r="2.5" />
                  <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" strokeLinecap="round" />
                </svg>
                <span className="hidden md:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={onExportPNG}
                title="Export PNG snapshot"
                className="btn-press inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-[#555452] dark:text-white/65 hover:text-[#111111] dark:hover:text-white hover:bg-[#F7F6F3] dark:hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 10.5V13a1 1 0 001 1h10a1 1 0 001-1v-2.5M11 5.5L8 2.5 5 5.5M8 2.5v7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="hidden md:inline">PNG</span>
              </button>
            </div>
          </div>
        )}

        {/* Right spacer to keep dock visually centered on lg+ */}
        <div className="hidden lg:block w-[156px]" />
      </div>
    </div>
  )
}

function DockSegmented({ label, options, value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex items-center p-0.5 rounded-lg bg-[#F7F6F3] dark:bg-white/[0.05] border border-[#EAEAEA] dark:border-white/[0.08]"
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
            className={`btn-press px-2.5 py-1 rounded-[5px] text-[11px] capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
              active
                ? 'bg-white dark:bg-[#222227] text-[#111111] dark:text-white font-medium border border-[#EAEAEA] dark:border-white/10'
                : 'text-[#6B6A67] dark:text-white/55 hover:text-[#111111] dark:hover:text-white/85 border border-transparent'
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-lg border border-[#EAEAEA] dark:border-white/[0.08] bg-[#F7F6F3] dark:bg-white/[0.04] px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-[0.06em] text-[#787774] dark:text-white/45">{label}</p>
      <p className="mt-0.5 font-mono text-xs font-medium tabular-nums text-[#111111] dark:text-[#EDEDEE] truncate">
        {value}
      </p>
    </div>
  )
}

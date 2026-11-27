import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import MoleculeScene from './MoleculeScene'
import { ELEMENT_COLORS } from '../utils/colorSchemes'

gsap.registerPlugin(ScrollTrigger)

const HERO_PRESETS = [
  { id: '1CRN', label: '1CRN · Crambin' },
  { id: '4HHB', label: '4HHB · Hemoglobin' },
  { id: '1BNA', label: '1BNA · B-DNA' },
]

const SPECIMENS = [
  {
    id: '1CRN',
    name: 'Crambin',
    category: 'Plant Protein',
    badgeClass: 'bg-[#EDF3EC] text-[#346538] dark:bg-emerald-500/15 dark:text-emerald-300',
    resolution: '1.50 Å',
    atoms: '327 atoms',
    chains: ['A'],
    summary: '46-residue hydrophobic seed protein. Crisp benchmark for CPK atomic sphere clarity and disulfide folds.',
  },
  {
    id: '4HHB',
    name: 'Human Hemoglobin',
    category: 'Oxygen Transport',
    badgeClass: 'bg-[#FDEBEC] text-[#9F2F2D] dark:bg-red-500/15 dark:text-red-300',
    resolution: '1.74 Å',
    atoms: '4,779 atoms',
    chains: ['A', 'B', 'C', 'D'],
    summary: 'Tetrameric alpha-beta globin complex carrying four heme groups. Showcases per-chain coloring and mid-tier LOD.',
  },
  {
    id: '2PTC',
    name: 'Trypsin Inhibitor Complex',
    category: 'Hydrolase',
    badgeClass: 'bg-[#E1F3FE] text-[#1F6C9F] dark:bg-sky-500/15 dark:text-sky-300',
    resolution: '1.90 Å',
    atoms: '2,236 atoms',
    chains: ['E', 'I'],
    summary: 'Bovine beta-trypsin bound to pancreatic inhibitor. Highlights tight two-chain protein-protein interfaces.',
  },
  {
    id: '1BNA',
    name: 'B-DNA Dodecamer',
    category: 'Nucleic Acid',
    badgeClass: 'bg-[#FBF3DB] text-[#956400] dark:bg-amber-500/15 dark:text-amber-300',
    resolution: '1.90 Å',
    atoms: '566 atoms',
    chains: ['A', 'B'],
    summary: 'Classic right-handed double helix crystal structure highlighting phosphorus-oxygen sugar backbones.',
  },
  {
    id: '3HHR',
    name: 'Growth Hormone Receptor',
    category: 'Signaling',
    badgeClass: 'bg-[#E1F3FE] text-[#1F6C9F] dark:bg-sky-500/15 dark:text-sky-300',
    resolution: '2.80 Å',
    atoms: '4,892 atoms',
    chains: ['A', 'B', 'C'],
    summary: 'Asymmetric hormone bound to two extracellular receptor domains with rich alpha-helix and beta-sheet folds.',
  },
  {
    id: '1UBQ',
    name: 'Human Ubiquitin',
    category: 'Regulatory',
    badgeClass: 'bg-[#EDF3EC] text-[#346538] dark:bg-emerald-500/15 dark:text-emerald-300',
    resolution: '1.80 Å',
    atoms: '660 atoms',
    chains: ['A'],
    summary: 'Compact 76-residue regulatory protein featuring a tightly packed beta-grasp fold and clean CA trace.',
  },
]

const SCRUB_STATEMENT =
  'Every atom parsed directly from fixed-width wwPDB columns and submitted to the GPU in a single instanced draw call per element.'

export default function LandingPage({
  atoms,
  pdbId,
  moleculeInfo,
  loading,
  onSelectPreviewPdb,
  onLaunchViewer,
  theme,
  toggleTheme,
}) {
  const containerRef = useRef(null)
  const scrubRef = useRef(null)
  const pinWrapperRef = useRef(null)
  const pinLeftRef = useRef(null)
  const isDark = theme === 'dark'

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const words = scrubRef.current?.querySelectorAll('.scrub-word')
        if (words?.length) {
          gsap.fromTo(
            words,
            { opacity: 0.14 },
            {
              opacity: 1,
              stagger: 0.08,
              ease: 'none',
              scrollTrigger: {
                trigger: scrubRef.current,
                start: 'top 78%',
                end: 'bottom 45%',
                scrub: 0.6,
              },
            },
          )
        }

        gsap.utils.toArray('.specimen-card').forEach((card) => {
          gsap.fromTo(
            card,
            { scale: 0.94, opacity: 0.5 },
            {
              scale: 1,
              opacity: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                end: 'top 52%',
                scrub: 0.5,
              },
            },
          )
        })
      })

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        if (pinWrapperRef.current && pinLeftRef.current) {
          ScrollTrigger.create({
            trigger: pinWrapperRef.current,
            start: 'top 112px',
            end: 'bottom 68%',
            pin: pinLeftRef.current,
            pinSpacing: false,
          })
        }
      })

      return () => mm.revert()
    },
    { scope: containerRef },
  )

  return (
    <div
      ref={containerRef}
      className="min-h-full w-full bg-[#FBFBFA] dark:bg-dark text-[#111111] dark:text-[#EDEDEE] transition-colors duration-200"
    >
      {/* Floating Navigation Bar */}
      <header className="sticky top-0 z-40 px-4 sm:px-6 pt-4">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2.5 rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white/85 dark:bg-[#141417]/85 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
            <span className="font-mono text-xs font-semibold tracking-tight">PDB Viewer</span>
          </div>

          <div className="hidden sm:flex items-center gap-7 text-xs text-[#6B6A67] dark:text-white/55">
            <a href="#preview" className="hover:text-[#111111] dark:hover:text-white transition-colors">
              Live Preview
            </a>
            <a href="#architecture" className="hover:text-[#111111] dark:hover:text-white transition-colors">
              Architecture
            </a>
            <a href="#specimens" className="hover:text-[#111111] dark:hover:text-white transition-colors">
              Specimens
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="btn-press p-1.5 rounded-md border border-[#EAEAEA] dark:border-white/10 text-[#6B6A67] dark:text-white/60 hover:text-[#111111] dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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
            <button
              type="button"
              onClick={() => onLaunchViewer()}
              className="btn-press px-3.5 py-1.5 rounded-md bg-[#111111] text-white hover:bg-[#2A2A2D] dark:bg-accent dark:text-[#0D0D0F] dark:hover:opacity-90 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              Launch Studio
            </button>
          </div>
        </nav>
      </header>

      <main className="overflow-x-hidden w-full max-w-full">
        {/* Attention: Cinematic Center Hero + Live WebGL Studio Window */}
        <section className="relative px-6 pt-20 pb-24 md:pt-28 md:pb-36">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-35 dark:opacity-20"
            style={{
              background:
                'radial-gradient(55% 48% at 50% 18%, var(--color-accent, #4ade80) 0%, transparent 74%)',
              filter: 'blur(90px)',
            }}
          />

          <div className="relative max-w-6xl mx-auto text-center">
            <h1
              className="font-semibold tracking-[-0.03em] leading-[1.05] text-[#111111] dark:text-[#F5F5F6]"
              style={{ fontSize: 'clamp(2.75rem, 5.4vw, 5.25rem)' }}
            >
              Protein structures in{' '}
              <span className="font-serif-editorial italic font-normal tracking-[-0.01em]">
                raw WebGL.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-[#6B6A67] dark:text-white/60">
              Inspect any RCSB accession ID or local <code className="font-mono text-sm">.pdb</code> file directly in your browser. Built with Three.js instancing and zero molecular viewer bloat.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => onLaunchViewer()}
                className="btn-press px-6 py-3 rounded-md bg-[#111111] text-white hover:bg-[#2A2A2D] dark:bg-accent dark:text-[#0D0D0F] dark:hover:opacity-90 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                Launch 3D Studio
              </button>
              <a
                href="#architecture"
                className="btn-press px-6 py-3 rounded-md border border-[#DCDCD8] dark:border-white/15 bg-white/80 dark:bg-white/[0.04] text-[#111111] dark:text-[#EDEDEE] hover:bg-[#F7F6F3] dark:hover:bg-white/[0.08] text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Explore Architecture
              </a>
            </div>
          </div>

          {/* Live Interactive 3D Preview Window (Faux-OS Studio Chrome) */}
          <div id="preview" className="relative max-w-5xl mx-auto mt-16">
            <div className="rounded-xl border border-[#EAEAEA] dark:border-white/10 bg-white dark:bg-[#111114] overflow-hidden shadow-[0_18px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.45)]">
              {/* Top Window Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-[#EAEAEA] dark:border-white/[0.08] bg-[#FBFBFA] dark:bg-[#141417]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E2E2DE] dark:bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E2E2DE] dark:bg-white/15" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E2E2DE] dark:bg-white/15" />
                  <span className="ml-2 font-mono text-[11px] text-[#787774] dark:text-white/45">
                    live-viewport · {pdbId}
                  </span>
                </div>

                {/* Live Preset Switcher */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#F7F6F3] dark:bg-white/[0.05] border border-[#EAEAEA] dark:border-white/[0.08]">
                  {HERO_PRESETS.map((preset) => {
                    const active = pdbId.toUpperCase() === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        disabled={loading}
                        onClick={() => onSelectPreviewPdb(preset.id)}
                        className={`btn-press px-2.5 py-1 rounded-[5px] font-mono text-[10px] transition-colors ${
                          active
                            ? 'bg-white dark:bg-[#222227] text-[#111111] dark:text-white border border-[#EAEAEA] dark:border-white/10 font-medium'
                            : 'text-[#6B6A67] dark:text-white/55 hover:text-[#111111] dark:hover:text-white border border-transparent'
                        }`}
                      >
                        {preset.label}
                      </button>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => onLaunchViewer()}
                  className="btn-press inline-flex items-center gap-1 text-[11px] font-medium text-[#2F3437] dark:text-white/75 hover:text-accent transition-colors"
                >
                  <span>Expand Studio</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Actual Interactive 3D Canvas */}
              <div className="relative h-[360px] sm:h-[440px] w-full bg-[#F7F6F3] dark:bg-[#0D0D0F]">
                {atoms.length > 0 ? (
                  <MoleculeScene
                    atoms={atoms}
                    colorScheme={pdbId.toUpperCase() === '4HHB' ? 'chain' : 'element'}
                    renderMode="both"
                    sceneBg={isDark ? '#0d0d0f' : '#F7F6F3'}
                    autoRotate
                    atomScale={1}
                    enableShortcuts={false}
                    enableZoom={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent spin-fast" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeLinecap="round" />
                    </svg>
                  </div>
                )}

                {loading && atoms.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/15 dark:bg-dark/50">
                    <svg className="w-5 h-5 text-accent spin-fast" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Bottom Telemetry Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-[#EAEAEA] dark:border-white/[0.08] bg-[#FBFBFA] dark:bg-[#141417] text-[11px] text-[#6B6A67] dark:text-white/50">
                <div className="flex items-center gap-4 font-mono tabular-nums">
                  <span>{moleculeInfo ? `${moleculeInfo.atomCount.toLocaleString()} atoms` : 'Loading…'}</span>
                  {moleculeInfo && <span>{moleculeInfo.residueCount.toLocaleString()} residues</span>}
                  {moleculeInfo && <span>{moleculeInfo.chains.length} chain{moleculeInfo.chains.length === 1 ? '' : 's'}</span>}
                </div>
                <span className="text-[11px]">Drag to rotate · Interactive WebGL</span>
              </div>
            </div>
          </div>
        </section>

        {/* Interest: Gapless 12-Col Architectural Bento Grid */}
        <section id="architecture" className="px-6 py-24 md:py-36 border-t border-[#EAEAEA] dark:border-white/[0.08]">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl mb-14">
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.025em] leading-[1.08]">
                Engineered for{' '}
                <span className="font-serif-editorial italic font-normal">direct</span> geometry control.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#6B6A67] dark:text-white/55">
                Four focused primitives replace megabytes of black-box molecular viewer dependencies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 grid-flow-dense gap-4">
              {/* Row 1: 7 + 5 = 12 */}
              <article className="card-hover group md:col-span-7 rounded-xl border border-[#EAEAEA] dark:border-white/[0.08] bg-white dark:bg-[#141417] p-7 sm:p-8 flex flex-col justify-between overflow-hidden">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">Instanced GPU Spheres</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#6B6A67] dark:text-white/55 max-w-lg">
                    Atoms are grouped by chemical element into Three.js <code className="font-mono text-xs">InstancedMesh</code> batches, submitting one draw call per element with clearcoat shading and ACES Filmic tone mapping.
                  </p>
                </div>

                {/* Custom CPK Batch Visual */}
                <div className="mt-8 grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {Object.entries(ELEMENT_COLORS).map(([el, hex]) => (
                    <div
                      key={el}
                      className="rounded-lg border border-[#EAEAEA] dark:border-white/[0.08] bg-[#F7F6F3] dark:bg-dark p-3 flex flex-col items-center gap-2 group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-black/10 dark:border-white/15"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="font-mono text-xs font-medium">{el}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="card-hover group md:col-span-5 rounded-xl border border-[#EAEAEA] dark:border-white/[0.08] bg-[#F7F6F3] dark:bg-[#141417] p-7 sm:p-8 flex flex-col justify-between overflow-hidden">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">Zero-Regex wwPDB Parser</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#6B6A67] dark:text-white/55">
                    Slices fixed-width 80-column <code className="font-mono text-xs">ATOM</code> and <code className="font-mono text-xs">HETATM</code> lines directly by character offset, then centers coordinates at the origin.
                  </p>
                </div>
                <pre className="mt-7 p-4 rounded-lg border border-[#EAEAEA] dark:border-white/10 bg-white dark:bg-dark font-mono text-[11px] leading-relaxed text-[#2F3437] dark:text-white/75 overflow-x-auto group-hover:scale-[1.02] transition-transform duration-500 ease-out">
{`ATOM      2  CA  ALA A   1
  [12..16]  name    "CA"
  [17..20]  resName "ALA"
  [30..54]  x, y, z float32
  [76..78]  element "C"`}
                </pre>
              </article>

              {/* Row 2: 5 + 7 = 12 */}
              <article className="card-hover group md:col-span-5 rounded-xl border border-[#EAEAEA] dark:border-white/[0.08] bg-[#F7F6F3] dark:bg-[#141417] p-7 sm:p-8 flex flex-col justify-between overflow-hidden">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">Adaptive LOD Pipeline</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#6B6A67] dark:text-white/55">
                    Geometry resolution scales automatically with atom count so orbit and zoom stay fluid from small peptides to large complexes.
                  </p>
                </div>
                <div className="mt-7 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between px-3 py-2 rounded-md bg-white dark:bg-dark border border-[#EAEAEA] dark:border-white/10">
                    <span className="text-[#6B6A67] dark:text-white/55">&lt; 1,500 atoms</span>
                    <span>24-seg Clearcoat Spheres</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-md bg-white dark:bg-dark border border-[#EAEAEA] dark:border-white/10">
                    <span className="text-[#6B6A67] dark:text-white/55">1.5k – 8k atoms</span>
                    <span>16 → 10-seg Instanced</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-md bg-white dark:bg-dark border border-[#EAEAEA] dark:border-white/10">
                    <span className="text-[#6B6A67] dark:text-white/55">&gt; 8,000 atoms</span>
                    <span>GPU Vertex Points</span>
                  </div>
                </div>
              </article>

              <article className="card-hover group md:col-span-7 rounded-xl border border-[#EAEAEA] dark:border-white/[0.08] bg-white dark:bg-[#141417] p-7 sm:p-8 flex flex-col justify-between overflow-hidden">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">Studio HUD, Live Swatches &amp; PNG Export</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#6B6A67] dark:text-white/55 max-w-lg">
                    A full-bleed viewport with floating command bar, bottom Studio Dock, collapsible Inspector, per-element and per-chain color overrides, and instant framebuffer PNG capture.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-2.5 text-xs text-[#555452] dark:text-white/65">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#EAEAEA] dark:border-white/10 bg-[#F7F6F3] dark:bg-white/[0.04]">
                    <kbd className="kbd-key">R</kbd> Reset Camera
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#EAEAEA] dark:border-white/10 bg-[#F7F6F3] dark:bg-white/[0.04]">
                    <kbd className="kbd-key">E</kbd> Cycle Color
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#EAEAEA] dark:border-white/10 bg-[#F7F6F3] dark:bg-white/[0.04]">
                    <kbd className="kbd-key">M</kbd> Cycle Mode
                  </span>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Desire Part 1: GSAP Scrubbing Editorial Statement */}
        <section className="px-6 py-28 md:py-44 border-t border-[#EAEAEA] dark:border-white/[0.08]">
          <div ref={scrubRef} className="max-w-5xl mx-auto">
            <p
              className="font-medium tracking-[-0.025em] leading-[1.2] text-[#111111] dark:text-[#F5F5F6]"
              style={{ fontSize: 'clamp(1.75rem, 3.6vw, 3.25rem)' }}
            >
              {SCRUB_STATEMENT.split(' ').map((word, idx) => (
                <span key={idx} className="scrub-word inline-block mr-[0.28em]">
                  {word}
                </span>
              ))}
            </p>
          </div>
        </section>

        {/* Desire Part 2: Pinned Split Interactive Specimen Gallery */}
        <section id="specimens" className="px-6 py-24 md:py-36 border-t border-[#EAEAEA] dark:border-white/[0.08]">
          <div ref={pinWrapperRef} className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-start">
            <div ref={pinLeftRef} className="md:col-span-5">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-tight">
                Curated RCSB specimens,{' '}
                <span className="font-serif-editorial italic font-normal">one click</span> away.
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6B6A67] dark:text-white/55">
                Select any reference structure to fetch live coordinates from RCSB PDB and open it immediately in the full-screen 3D Studio.
              </p>
              <button
                type="button"
                onClick={() => onLaunchViewer('1CRN')}
                className="btn-press mt-7 px-5 py-2.5 rounded-md bg-[#111111] text-white hover:bg-[#2A2A2D] dark:bg-accent dark:text-[#0D0D0F] dark:hover:opacity-90 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                Open Default (1CRN)
              </button>
            </div>

            <div className="md:col-span-7 space-y-4">
              {SPECIMENS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onLaunchViewer(item.id)}
                  className="specimen-card card-hover group w-full text-left rounded-xl border border-[#EAEAEA] dark:border-white/[0.08] bg-white dark:bg-[#141417] hover:border-[#BDBDB8] dark:hover:border-white/25 p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sm font-semibold text-[#111111] dark:text-white">
                        {item.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.05em] ${item.badgeClass}`}>
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums text-[#787774] dark:text-white/45">
                      <span>{item.resolution}</span>
                      <span>{item.atoms}</span>
                    </div>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold tracking-tight">{item.name}</h3>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#6B6A67] dark:text-white/55">
                    {item.summary}
                  </p>

                  <div className="mt-5 pt-4 border-t border-[#EAEAEA] dark:border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-[0.06em] text-[#787774] dark:text-white/40">
                        Chains
                      </span>
                      {item.chains.map((ch) => (
                        <span
                          key={ch}
                          className="px-1.5 py-0.5 rounded border border-[#EAEAEA] dark:border-white/10 bg-[#F7F6F3] dark:bg-white/[0.04] font-mono text-[10px]"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#111111] dark:text-white/85 group-hover:text-accent transition-colors">
                      Inspect in 3D
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Action: High-Contrast Closing CTA */}
        <section className="px-6 py-28 md:py-40 border-t border-[#EAEAEA] dark:border-white/[0.08]">
          <div className="max-w-5xl mx-auto text-center">
            <h2
              className="font-semibold tracking-[-0.03em] leading-[1.08]"
              style={{ fontSize: 'clamp(2.25rem, 4.6vw, 4.25rem)' }}
            >
              Inspect any PDB file in{' '}
              <span className="font-serif-editorial italic font-normal">seconds.</span>
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-sm sm:text-base text-[#6B6A67] dark:text-white/55">
              Drop a local coordinate file or type any four-character RCSB accession code.
            </p>
            <div className="mt-9">
              <button
                type="button"
                onClick={() => onLaunchViewer()}
                className="btn-press px-7 py-3.5 rounded-md bg-[#111111] text-white hover:bg-[#2A2A2D] dark:bg-accent dark:text-[#0D0D0F] dark:hover:opacity-90 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                Launch 3D Studio
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-8 border-t border-[#EAEAEA] dark:border-white/[0.08]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#787774] dark:text-white/45">
          <span className="font-mono">PDB Viewer — MIT License</span>
          <div className="flex items-center gap-5">
            <a
              href="https://www.rcsb.org/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#111111] dark:hover:text-white transition-colors"
            >
              RCSB PDB
            </a>
            <button
              type="button"
              onClick={() => onLaunchViewer()}
              className="hover:text-[#111111] dark:hover:text-white transition-colors"
            >
              3D Studio
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

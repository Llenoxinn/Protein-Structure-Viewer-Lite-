import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

const SPECIMENS = [
  {
    id: '1CRN',
    name: 'Crambin',
    summary: '46-residue hydrophobic plant seed protein. Ideal benchmark for atomic sphere clarity.',
    atoms: '327 atoms',
    seed: 'crambin-crystal',
  },
  {
    id: '4HHB',
    name: 'Human Hemoglobin',
    summary: 'Tetrameric oxygen transport complex with four distinct chains and heme groups.',
    atoms: '4,779 atoms',
    seed: 'hemoglobin-chains',
  },
  {
    id: '2PTC',
    name: 'Trypsin Complex',
    summary: 'Serine protease bound to pancreatic inhibitor. Highlights multi-chain interfaces.',
    atoms: '2,236 atoms',
    seed: 'protease-mesh',
  },
  {
    id: '1BNA',
    name: 'B-DNA Dodecamer',
    summary: 'Classic double-helix oligonucleotide crystal structure showing phosphorus backbone.',
    atoms: '566 atoms',
    seed: 'helix-structure',
  },
  {
    id: '3HHR',
    name: 'Growth Hormone Receptor',
    summary: 'Asymmetric hormone-receptor complex with rich alpha-helical and beta-sheet folds.',
    atoms: '4,892 atoms',
    seed: 'receptor-fold',
  },
  {
    id: '1UBQ',
    name: 'Ubiquitin',
    summary: 'Compact 76-residue regulatory protein featuring a tightly packed beta-grasp fold.',
    atoms: '660 atoms',
    seed: 'ubiquitin-fold',
  },
]

const SCRUB_STATEMENT =
  'Every atom parsed directly from fixed-width wwPDB columns and submitted to the GPU in a single instanced draw call per element.'

export default function LandingPage({ onLaunchViewer, theme, toggleTheme }) {
  const containerRef = useRef(null)
  const scrubRef = useRef(null)
  const pinWrapperRef = useRef(null)
  const pinLeftRef = useRef(null)
  const isDark = theme === 'dark'

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Scrubbing word-by-word text reveal
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

        // Specimen cards scale in as they enter the viewport
        gsap.utils.toArray('.specimen-card').forEach((card) => {
          gsap.fromTo(
            card,
            { scale: 0.92, opacity: 0.45 },
            {
              scale: 1,
              opacity: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 88%',
                end: 'top 45%',
                scrub: 0.5,
              },
            },
          )
        })
      })

      // Pin the left gallery title on desktop when motion is allowed
      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        if (pinWrapperRef.current && pinLeftRef.current) {
          ScrollTrigger.create({
            trigger: pinWrapperRef.current,
            start: 'top 120px',
            end: 'bottom 65%',
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
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2.5 rounded-lg border border-[#EAEAEA] dark:border-white/10 bg-white/85 dark:bg-[#141417]/85 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
            <span className="font-mono text-xs font-semibold tracking-tight">PDB Viewer</span>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-xs text-[#6B6A67] dark:text-white/55">
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
              Open Viewer
            </button>
          </div>
        </nav>
      </header>

      <main className="overflow-x-hidden w-full max-w-full">
        {/* Attention: Cinematic Center Hero */}
        <section className="relative px-6 pt-24 pb-32 md:pt-36 md:pb-44">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
            style={{
              background:
                'radial-gradient(60% 50% at 50% 25%, var(--color-accent, #4ade80) 0%, transparent 72%)',
              filter: 'blur(90px)',
            }}
          />

          <div className="relative max-w-6xl mx-auto text-center">
            <h1
              className="font-semibold tracking-[-0.03em] leading-[1.06] text-[#111111] dark:text-[#F5F5F6]"
              style={{ fontSize: 'clamp(2.75rem, 5.2vw, 5.25rem)' }}
            >
              Protein structures rendered in raw WebGL.
            </h1>

            <p className="mt-7 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-[#6B6A67] dark:text-white/60">
              Load any RCSB accession ID or local <code className="font-mono text-sm">.pdb</code> file directly in the browser. Zero heavyweight molecular frameworks.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
              <button
                type="button"
                onClick={() => onLaunchViewer()}
                className="btn-press px-6 py-3 rounded-md bg-[#111111] text-white hover:bg-[#2A2A2D] dark:bg-accent dark:text-[#0D0D0F] dark:hover:opacity-90 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                Launch 3D Viewer
              </button>
              <a
                href="#architecture"
                className="btn-press px-6 py-3 rounded-md border border-[#DCDCD8] dark:border-white/15 bg-white/70 dark:bg-white/[0.04] text-[#111111] dark:text-[#EDEDEE] hover:bg-[#F7F6F3] dark:hover:bg-white/[0.08] text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Explore Architecture
              </a>
            </div>
          </div>
        </section>

        {/* Interest: Gapless 12-Col Bento Grid */}
        <section id="architecture" className="px-6 py-24 md:py-36 border-t border-[#EAEAEA] dark:border-white/[0.08]">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl mb-14">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-tight">
                Engineered for direct geometry control.
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#6B6A67] dark:text-white/55">
                Four focused primitives replace megabytes of black-box viewer dependencies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 grid-flow-dense gap-4">
              {/* Row 1: 7 + 5 = 12 */}
              <article className="card-hover group md:col-span-7 rounded-xl border border-[#EAEAEA] dark:border-white/[0.08] bg-white dark:bg-[#141417] overflow-hidden flex flex-col justify-between">
                <div className="p-7 sm:p-8">
                  <h3 className="text-xl font-semibold tracking-tight">Instanced GPU Spheres</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#6B6A67] dark:text-white/55 max-w-lg">
                    Atoms are grouped by chemical element into Three.js <code className="font-mono text-xs">InstancedMesh</code> batches, submitting one draw call per element regardless of structure size.
                  </p>
                </div>
                <div className="relative h-48 overflow-hidden border-t border-[#EAEAEA] dark:border-white/[0.08]">
                  <img
                    src="https://picsum.photos/seed/molecular-mesh/1200/600"
                    alt="Abstract structural lattice texture"
                    loading="lazy"
                    className="w-full h-full object-cover grayscale contrast-125 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
              </article>

              <article className="card-hover group md:col-span-5 rounded-xl border border-[#EAEAEA] dark:border-white/[0.08] bg-[#F7F6F3] dark:bg-[#141417] p-7 sm:p-8 flex flex-col justify-between overflow-hidden">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">Zero-Regex wwPDB Parser</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#6B6A67] dark:text-white/55">
                    Reads fixed-width 80-column <code className="font-mono text-xs">ATOM</code> and <code className="font-mono text-xs">HETATM</code> records via direct <code className="font-mono text-xs">String.slice()</code> offsets, then centers coordinates at the origin.
                  </p>
                </div>
                <pre className="mt-8 p-4 rounded-lg border border-[#EAEAEA] dark:border-white/10 bg-white dark:bg-dark font-mono text-[11px] leading-relaxed text-[#2F3437] dark:text-white/75 overflow-x-auto group-hover:scale-[1.02] transition-transform duration-500 ease-out">
{`ATOM      2  CA  ALA A   1
  x: line.slice(30, 38)
  y: line.slice(38, 46)
  z: line.slice(46, 54)`}
                </pre>
              </article>

              {/* Row 2: 5 + 7 = 12 */}
              <article className="card-hover group md:col-span-5 rounded-xl border border-[#EAEAEA] dark:border-white/[0.08] bg-[#F7F6F3] dark:bg-[#141417] p-7 sm:p-8 flex flex-col justify-between overflow-hidden">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">Adaptive LOD Pipeline</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#6B6A67] dark:text-white/55">
                    Automatically tunes geometry resolution as atom counts climb so orbit and zoom stay responsive.
                  </p>
                </div>
                <div className="mt-8 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between px-3 py-2 rounded-md bg-white dark:bg-dark border border-[#EAEAEA] dark:border-white/10">
                    <span className="text-[#6B6A67] dark:text-white/55">&lt; 3,000 atoms</span>
                    <span>8-seg Instanced Spheres</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-md bg-white dark:bg-dark border border-[#EAEAEA] dark:border-white/10">
                    <span className="text-[#6B6A67] dark:text-white/55">3k – 8k atoms</span>
                    <span>6-seg Low-Poly Spheres</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-md bg-white dark:bg-dark border border-[#EAEAEA] dark:border-white/10">
                    <span className="text-[#6B6A67] dark:text-white/55">&gt; 8,000 atoms</span>
                    <span>GPU Vertex Points</span>
                  </div>
                </div>
              </article>

              <article className="card-hover group md:col-span-7 rounded-xl border border-[#EAEAEA] dark:border-white/[0.08] bg-white dark:bg-[#141417] overflow-hidden flex flex-col justify-between">
                <div className="p-7 sm:p-8">
                  <h3 className="text-xl font-semibold tracking-tight">Live Coloring &amp; PNG Export</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#6B6A67] dark:text-white/55 max-w-lg">
                    Switch between CPK element, per-chain, and residue-hash palettes, override individual element or chain colors live, and capture crisp PNG snapshots directly from the WebGL framebuffer.
                  </p>
                </div>
                <div className="px-7 sm:px-8 pb-7 flex flex-wrap items-center gap-3 text-xs text-[#555452] dark:text-white/60">
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

        {/* Desire Part 1: Scrubbing Text Reveal */}
        <section className="px-6 py-28 md:py-44 border-t border-[#EAEAEA] dark:border-white/[0.08]">
          <div ref={scrubRef} className="max-w-5xl mx-auto">
            <p
              className="font-medium tracking-[-0.025em] leading-[1.22] text-[#111111] dark:text-[#F5F5F6]"
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

        {/* Desire Part 2: Pinned Split Specimen Gallery */}
        <section id="specimens" className="px-6 py-24 md:py-36 border-t border-[#EAEAEA] dark:border-white/[0.08]">
          <div ref={pinWrapperRef} className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 items-start">
            <div ref={pinLeftRef} className="md:col-span-5">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-tight">
                Curated RCSB specimens, one click away.
              </h2>
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6B6A67] dark:text-white/55">
                Select any reference structure to fetch its live coordinates from RCSB PDB and inspect it immediately in the 3D viewport.
              </p>
              <button
                type="button"
                onClick={() => onLaunchViewer('1CRN')}
                className="btn-press mt-7 px-5 py-2.5 rounded-md bg-[#111111] text-white hover:bg-[#2A2A2D] dark:bg-accent dark:text-[#0D0D0F] dark:hover:opacity-90 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
              >
                Open Default (1CRN)
              </button>
            </div>

            <div className="md:col-span-7 space-y-5">
              {SPECIMENS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onLaunchViewer(item.id)}
                  className="specimen-card group w-full text-left rounded-xl border border-[#EAEAEA] dark:border-white/[0.08] bg-white dark:bg-[#141417] hover:border-[#BDBDB8] dark:hover:border-white/25 overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 items-stretch">
                    <div className="sm:col-span-5 h-40 sm:h-auto overflow-hidden border-b sm:border-b-0 sm:border-r border-[#EAEAEA] dark:border-white/[0.08]">
                      <img
                        src={`https://picsum.photos/seed/${item.seed}/640/420`}
                        alt={`${item.name} structural backdrop`}
                        loading="lazy"
                        className="w-full h-full object-cover grayscale contrast-125 opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div className="sm:col-span-7 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-semibold text-accent">{item.id}</span>
                          <span className="font-mono text-[11px] tabular-nums text-[#787774] dark:text-white/45">
                            {item.atoms}
                          </span>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold tracking-tight">{item.name}</h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#6B6A67] dark:text-white/55">
                          {item.summary}
                        </p>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#111111] dark:text-white/85 group-hover:text-accent transition-colors">
                        Inspect in 3D
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
                          <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Action: High-Contrast Closing CTA & Footer */}
        <section className="px-6 py-28 md:py-40 border-t border-[#EAEAEA] dark:border-white/[0.08]">
          <div className="max-w-5xl mx-auto text-center">
            <h2
              className="font-semibold tracking-[-0.03em] leading-[1.08]"
              style={{ fontSize: 'clamp(2.25rem, 4.5vw, 4rem)' }}
            >
              Inspect any PDB file in seconds.
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
                Launch 3D Viewer
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
              3D Workspace
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useState, useEffect, useCallback, useRef } from 'react'
import ControlPanel from './components/ControlPanel'
import MoleculeScene from './components/MoleculeScene'
import AtomTooltip from './components/AtomTooltip'
import { fetchPDB, parsePDB, centerAtoms } from './utils/pdbParser'
import { setCustomColors } from './utils/colorSchemes'

export default function App() {
  const [pdbId, setPdbId] = useState('1CRN')
  const [atoms, setAtoms] = useState([])
  const [moleculeInfo, setMoleculeInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [colorScheme, setColorScheme] = useState('element')
  const [renderMode, setRenderMode] = useState('both')
  const [hoveredAtom, setHoveredAtom] = useState(null)

  // Theme
  const [theme, setTheme] = useState('dark')
  const [accent, setAccent] = useState('green')

  // Customization
  const [atomScale, setAtomScale] = useState(1)
  const [autoRotate, setAutoRotate] = useState(false)
  const [customElementColors, setCustomElementColors] = useState({})
  const [customChainColors, setCustomChainColors] = useState([])

  const exportRef = useRef(null)

  // Apply theme & accent to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent)
  }, [accent])

  // Push custom colors to colorSchemes module
  useEffect(() => {
    setCustomColors(customElementColors, customChainColors)
  }, [customElementColors, customChainColors])

  const handleLoad = useCallback(async () => {
    setLoading(true)
    setError(null)
    setHoveredAtom(null)

    try {
      const raw = await fetchPDB(pdbId)
      const parsed = parsePDB(raw)
      const centered = centerAtoms(parsed.atoms)
      setAtoms(centered)
      setMoleculeInfo({
        atomCount: parsed.atomCount,
        residueCount: parsed.residueCount,
        chains: [...parsed.chains],
      })
    } catch (err) {
      setError(err.message)
      setAtoms([])
      setMoleculeInfo(null)
    }

    setLoading(false)
  }, [pdbId])

  useEffect(() => {
    handleLoad()
  }, [])

  const handleFileUpload = useCallback((file) => {
    if (!file) return
    setLoading(true)
    setError(null)
    setHoveredAtom(null)

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = reader.result
        const parsed = parsePDB(text)
        const centered = centerAtoms(parsed.atoms)
        setAtoms(centered)
        setMoleculeInfo({
          atomCount: parsed.atomCount,
          residueCount: parsed.residueCount,
          chains: [...parsed.chains],
        })
        setPdbId(file.name.replace(/\.(pdb|ent)$/i, ''))
      } catch (err) {
        setError(err.message)
        setAtoms([])
        setMoleculeInfo(null)
      }
      setLoading(false)
    }
    reader.onerror = () => {
      setError('Failed to read file')
      setLoading(false)
    }
    reader.readAsText(file)
  }, [])

  const cycleColorScheme = useCallback(() => {
    setColorScheme((prev) => (prev === 'element' ? 'chain' : prev === 'chain' ? 'residue' : 'element'))
  }, [])

  const cycleRenderMode = useCallback(() => {
    setRenderMode((prev) =>
      prev === 'spheres' ? 'backbone' : prev === 'backbone' ? 'both' : 'spheres',
    )
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const handleExportPNG = useCallback(() => {
    if (exportRef.current?.downloadPNG) {
      exportRef.current.downloadPNG()
    }
  }, [])

  const handleAtomClick = useCallback((atom) => {
    console.log(atom)
  }, [])

  const isDark = theme === 'dark'

  return (
    <div className="h-full w-full flex bg-white dark:bg-dark transition-colors duration-200">
      <ControlPanel
        pdbId={pdbId}
        setPdbId={setPdbId}
        onLoad={handleLoad}
        onFileUpload={handleFileUpload}
        loading={loading}
        error={error}
        colorScheme={colorScheme}
        setColorScheme={setColorScheme}
        renderMode={renderMode}
        setRenderMode={setRenderMode}
        moleculeInfo={moleculeInfo}
        theme={theme}
        toggleTheme={toggleTheme}
        accent={accent}
        setAccent={setAccent}
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
        atomScale={atomScale}
        setAtomScale={setAtomScale}
        customElementColors={customElementColors}
        setCustomElementColors={setCustomElementColors}
        customChainColors={customChainColors}
        setCustomChainColors={setCustomChainColors}
        onExportPNG={handleExportPNG}
      />

      <div className="flex-1 relative">
        {atoms.length > 0 ? (
          <MoleculeScene
            atoms={atoms}
            colorScheme={colorScheme}
            renderMode={renderMode}
            onAtomHover={setHoveredAtom}
            onAtomClick={handleAtomClick}
            sceneBg={isDark ? '#0d0d0f' : '#f8f9fa'}
            autoRotate={autoRotate}
            atomScale={atomScale}
            exportRef={exportRef}
            onCycleColorScheme={cycleColorScheme}
            onCycleRenderMode={cycleRenderMode}
          />
        ) : (
          !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-gray-400 dark:text-white/20">
                Enter a PDB ID to load a structure
              </p>
            </div>
          )
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 dark:bg-dark/60 z-40">
            <svg
              className="w-6 h-6 text-accent animate-spin"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="28"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>

      <AtomTooltip atom={hoveredAtom} theme={theme} />
    </div>
  )
}

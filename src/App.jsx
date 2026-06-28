import { useState, useEffect, useCallback } from 'react'
import ControlPanel from './components/ControlPanel'
import MoleculeScene from './components/MoleculeScene'
import AtomTooltip from './components/AtomTooltip'
import { fetchPDB, parsePDB, centerAtoms } from './utils/pdbParser'

export default function App() {
  const [pdbId, setPdbId] = useState('1CRN')
  const [atoms, setAtoms] = useState([])
  const [moleculeInfo, setMoleculeInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [colorScheme, setColorScheme] = useState('element')
  const [renderMode, setRenderMode] = useState('both')
  const [hoveredAtom, setHoveredAtom] = useState(null)

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

  return (
    <div className="h-full w-full flex bg-dark">
      <ControlPanel
        pdbId={pdbId}
        setPdbId={setPdbId}
        onLoad={handleLoad}
        loading={loading}
        error={error}
        colorScheme={colorScheme}
        setColorScheme={setColorScheme}
        renderMode={renderMode}
        setRenderMode={setRenderMode}
        moleculeInfo={moleculeInfo}
      />

      <div className="flex-1 relative">
        {atoms.length > 0 ? (
          <MoleculeScene
            atoms={atoms}
            colorScheme={colorScheme}
            renderMode={renderMode}
            onAtomHover={setHoveredAtom}
            onAtomClick={console.log}
          />
        ) : (
          !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-xs text-white/20">Enter a PDB ID to load a structure</p>
            </div>
          )
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-dark/60 z-40">
            <svg className="w-6 h-6 text-accent animate-spin" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>

      <AtomTooltip atom={hoveredAtom} />
    </div>
  )
}

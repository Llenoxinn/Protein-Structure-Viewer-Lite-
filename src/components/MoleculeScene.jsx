import { useMemo, useLayoutEffect, useRef, useCallback, useEffect, memo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Stats, Html } from '@react-three/drei'
import * as THREE from 'three'
import { getAtomColor, getAtomRadius } from '../utils/colorSchemes'

function ExportHelper({ exportRef }) {
  const { gl } = useThree()
  useEffect(() => {
    if (exportRef) {
      exportRef.current = {
        downloadPNG: () => {
          const link = document.createElement('a')
          link.download = 'structure.png'
          link.href = gl.domElement.toDataURL('image/png')
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        },
      }
    }
    return () => {
      if (exportRef) exportRef.current = null
    }
  }, [gl, exportRef])
  return null
}

function SceneUI({ autoRotate, onCycleColorScheme, onCycleRenderMode, onResetCamera }) {
  const { camera, controls } = useThree()

  const resetCamera = useCallback(() => {
    camera.position.set(0, 0, 50)
    if (controls) {
      controls.target.set(0, 0, 0)
      controls.update()
    }
    onResetCamera?.()
  }, [camera, controls, onResetCamera])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'r' || e.key === 'R') resetCamera()
      if (e.key === 'e' || e.key === 'E') onCycleColorScheme?.()
      if (e.key === 'm' || e.key === 'M') onCycleRenderMode?.()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [resetCamera, onCycleColorScheme, onCycleRenderMode])

  return (
    <Html fullscreen>
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <button
          onClick={resetCamera}
          className="px-2.5 py-1 text-[10px] rounded bg-white/10 dark:bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
        >
          Reset Camera
        </button>
      </div>
    </Html>
  )
}

function AtomGroup({ atoms, radius, colorScheme, atomScale, onAtomHover, onAtomClick, sphereSegs }) {
  const ref = useRef()
  const count = atoms.length
  const r = radius * atomScale
  const segs = sphereSegs || 8

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh || count === 0) return

    const dummy = new THREE.Object3D()
    const color = new THREE.Color()

    atoms.forEach((atom, i) => {
      dummy.position.set(atom.x, atom.y, atom.z)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      color.set(getAtomColor(atom, colorScheme))
      mesh.setColorAt(i, color)
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [atoms, colorScheme, count])

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation()
    const atom = atoms[e.instanceId]
    if (atom && onAtomHover) onAtomHover(atom)
  }, [atoms, onAtomHover])

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation()
    if (onAtomHover) onAtomHover(null)
  }, [onAtomHover])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    const atom = atoms[e.instanceId]
    if (atom && onAtomClick) onAtomClick(atom)
  }, [atoms, onAtomClick])

  if (count === 0) return null

  return (
    <instancedMesh
      ref={ref}
      args={[null, null, count]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[r, segs, segs]} />
      <meshStandardMaterial />
    </instancedMesh>
  )
}

function AtomSpheres({ atoms, colorScheme, atomScale, onAtomHover, onAtomClick, sphereSegs }) {
  const groups = useMemo(() => {
    if (!atoms || atoms.length === 0) return []
    const map = new Map()
    atoms.forEach((atom) => {
      const el = atom.element
      if (!map.has(el)) map.set(el, [])
      map.get(el).push(atom)
    })
    return Array.from(map.entries())
  }, [atoms])

  return groups.map(([element, groupAtoms]) => (
    <AtomGroup
      key={element}
      atoms={groupAtoms}
      radius={getAtomRadius(element)}
      colorScheme={colorScheme}
      atomScale={atomScale}
      onAtomHover={onAtomHover}
      onAtomClick={onAtomClick}
      sphereSegs={sphereSegs}
    />
  ))
}

function AtomPoints({ atoms, colorScheme, atomScale }) {
  const ref = useRef()

  useLayoutEffect(() => {
    const points = ref.current
    if (!points || !atoms.length) return

    const pos = new Float32Array(atoms.length * 3)
    const colors = new Float32Array(atoms.length * 3)
    const c = new THREE.Color()

    atoms.forEach((atom, i) => {
      pos[i * 3] = atom.x
      pos[i * 3 + 1] = atom.y
      pos[i * 3 + 2] = atom.z
      c.set(getAtomColor(atom, colorScheme))
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    })

    points.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    points.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    points.geometry.attributes.position.needsUpdate = true
    points.geometry.attributes.color.needsUpdate = true
  }, [atoms, colorScheme])

  if (!atoms.length) return null

  return (
    <points ref={ref}>
      <bufferGeometry />
      <pointsMaterial size={0.4 * atomScale} vertexColors sizeAttenuation />
    </points>
  )
}

function Backbone({ atoms, colorScheme, atomScale }) {
  const chains = useMemo(() => {
    if (!atoms || atoms.length === 0) return []
    const map = new Map()
    atoms
      .filter((a) => a.name === 'CA')
      .sort((a, b) => {
        if (a.chainID !== b.chainID) return a.chainID < b.chainID ? -1 : 1
        return a.resSeq - b.resSeq
      })
      .forEach((a) => {
        if (!map.has(a.chainID)) map.set(a.chainID, [])
        map.get(a.chainID).push(a)
      })
    return Array.from(map.entries())
  }, [atoms])

  return chains.map(([chainID, chainAtoms]) => {
    if (chainAtoms.length < 2) return null

    const points = chainAtoms.map((a) => new THREE.Vector3(a.x, a.y, a.z))
    const curve = new THREE.CatmullRomCurve3(points)
    const segments = Math.max(chainAtoms.length * 2, 8)

    return (
      <mesh key={chainID}>
        <tubeGeometry args={[curve, segments, 0.15 * atomScale, 6, false]} />
        <meshStandardMaterial
          color={getAtomColor({ chainID, element: 'C', resName: '' }, colorScheme)}
        />
      </mesh>
    )
  })
}

const MoleculeScene = memo(function MoleculeScene({
  atoms,
  colorScheme = 'element',
  renderMode = 'both',
  onAtomHover,
  onAtomClick,
  sceneBg = '#0d0d0f',
  autoRotate = false,
  atomScale = 1,
  exportRef,
  onCycleColorScheme,
  onCycleRenderMode,
  onResetCamera,
}) {
  const hasAtoms = atoms && atoms.length > 0
  const showSpheres = hasAtoms && (renderMode === 'spheres' || renderMode === 'both')
  const showBackbone = hasAtoms && (renderMode === 'backbone' || renderMode === 'both')

  const usePoints = hasAtoms && atoms.length > 8000
  const lowPoly = hasAtoms && atoms.length > 3000
  const sphereSegs = lowPoly ? 6 : 8

  return (
    <Canvas
      camera={{ fov: 45, position: [0, 0, 50], near: 0.1, far: 500 }}
      dpr={[1, 2]}
      gl={{ antialias: true, shadows: false }}
      style={{ background: sceneBg }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[20, 20, 20]} intensity={1.2} />
      <OrbitControls enableDamping dampingFactor={0.15} autoRotate={autoRotate} autoRotateSpeed={2} />
      {showSpheres && !usePoints && (
        <AtomSpheres
          atoms={atoms}
          colorScheme={colorScheme}
          atomScale={atomScale}
          onAtomHover={onAtomHover}
          onAtomClick={onAtomClick}
          sphereSegs={sphereSegs}
        />
      )}
      {showSpheres && usePoints && (
        <AtomPoints atoms={atoms} colorScheme={colorScheme} atomScale={atomScale} />
      )}
      {showBackbone && <Backbone atoms={atoms} colorScheme={colorScheme} atomScale={atomScale} />}
      <SceneUI
        autoRotate={autoRotate}
        onCycleColorScheme={onCycleColorScheme}
        onCycleRenderMode={onCycleRenderMode}
        onResetCamera={onResetCamera}
      />
      <ExportHelper exportRef={exportRef} />
      {import.meta.env.DEV && <Stats />}
    </Canvas>
  )
})

export default MoleculeScene

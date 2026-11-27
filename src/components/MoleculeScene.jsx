import { useMemo, useLayoutEffect, useRef, useCallback, useEffect, memo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { getAtomColor, getAtomRadius } from '../utils/colorSchemes'

const CAMERA_FOV = 45

function computeFitDistance(atoms) {
  if (!atoms || atoms.length === 0) return 50
  let maxR2 = 0
  for (let i = 0; i < atoms.length; i++) {
    const a = atoms[i]
    const r2 = a.x * a.x + a.y * a.y + a.z * a.z
    if (r2 > maxR2) maxR2 = r2
  }
  const radius = Math.max(Math.sqrt(maxR2), 6)
  const halfFovRad = THREE.MathUtils.degToRad(CAMERA_FOV / 2)
  return (radius / Math.sin(halfFovRad)) * 1.18
}

function SceneController({ fitDistance, sceneRef, onCycleColorScheme, onCycleRenderMode, enableShortcuts = true }) {
  const { gl, scene, camera, controls } = useThree()

  const resetCamera = useCallback(() => {
    camera.position.set(0, 0, fitDistance)
    camera.lookAt(0, 0, 0)
    if (controls) {
      controls.target.set(0, 0, 0)
      controls.update()
    }
  }, [camera, controls, fitDistance])

  // Auto-frame whenever a new structure changes the bounding radius
  useEffect(() => {
    resetCamera()
  }, [resetCamera])

  useEffect(() => {
    if (sceneRef) {
      sceneRef.current = {
        resetCamera,
        downloadPNG: () => {
          gl.render(scene, camera)
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
      if (sceneRef) sceneRef.current = null
    }
  }, [gl, scene, camera, sceneRef, resetCamera])

  useEffect(() => {
    if (!enableShortcuts) return
    const handler = (e) => {
      if (
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        e.target?.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target?.tagName)
      ) {
        return
      }
      if (e.key === 'r' || e.key === 'R') resetCamera()
      if (e.key === 'e' || e.key === 'E') onCycleColorScheme?.()
      if (e.key === 'm' || e.key === 'M') onCycleRenderMode?.()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enableShortcuts, resetCamera, onCycleColorScheme, onCycleRenderMode])

  return null
}

function AtomGroup({ atoms, radius, colorScheme, customColors, atomScale, onAtomHover, sphereSegs }) {
  const ref = useRef()
  const count = atoms.length
  const r = radius * atomScale
  const segs = sphereSegs || 20

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh || count === 0) return

    const dummy = new THREE.Object3D()
    const color = new THREE.Color()

    atoms.forEach((atom, i) => {
      dummy.position.set(atom.x, atom.y, atom.z)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      color.set(getAtomColor(atom, colorScheme, customColors))
      mesh.setColorAt(i, color)
    })

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [atoms, colorScheme, customColors, count])

  const handlePointerOver = useCallback(
    (e) => {
      e.stopPropagation()
      const atom = atoms[e.instanceId]
      if (atom && onAtomHover) onAtomHover(atom)
    },
    [atoms, onAtomHover],
  )

  const handlePointerOut = useCallback(
    (e) => {
      e.stopPropagation()
      if (onAtomHover) onAtomHover(null)
    },
    [onAtomHover],
  )

  if (count === 0) return null

  return (
    <instancedMesh
      ref={ref}
      args={[null, null, count]}
      frustumCulled={false}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <sphereGeometry args={[r, segs, segs]} />
      <meshPhysicalMaterial
        roughness={0.32}
        metalness={0.08}
        clearcoat={0.25}
        clearcoatRoughness={0.28}
      />
    </instancedMesh>
  )
}

function AtomSpheres({ atoms, colorScheme, customColors, atomScale, onAtomHover, sphereSegs }) {
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
      customColors={customColors}
      atomScale={atomScale}
      onAtomHover={onAtomHover}
      sphereSegs={sphereSegs}
    />
  ))
}

function AtomPoints({ atoms, colorScheme, customColors, atomScale }) {
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
      c.set(getAtomColor(atom, colorScheme, customColors))
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    })

    points.geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    points.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    points.geometry.attributes.position.needsUpdate = true
    points.geometry.attributes.color.needsUpdate = true
  }, [atoms, colorScheme, customColors])

  if (!atoms.length) return null

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry />
      <pointsMaterial size={0.55 * atomScale} vertexColors sizeAttenuation />
    </points>
  )
}

function Backbone({ atoms, colorScheme, customColors, atomScale }) {
  const curves = useMemo(() => {
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
      .filter(([, chainAtoms]) => chainAtoms.length >= 2)
      .map(([chainID, chainAtoms]) => ({
        chainID,
        curve: new THREE.CatmullRomCurve3(chainAtoms.map((a) => new THREE.Vector3(a.x, a.y, a.z))),
        segments: Math.min(Math.max(chainAtoms.length * 6, 24), 1200),
      }))
  }, [atoms])

  return curves.map(({ chainID, curve, segments }) => (
    <mesh key={chainID}>
      <tubeGeometry args={[curve, segments, 0.22 * atomScale, 12, false]} />
      <meshStandardMaterial
        color={getAtomColor({ chainID, element: 'C', resName: '' }, colorScheme, customColors)}
        roughness={0.35}
        metalness={0.08}
      />
    </mesh>
  ))
}

const MoleculeScene = memo(function MoleculeScene({
  atoms,
  colorScheme = 'element',
  customColors,
  renderMode = 'both',
  onAtomHover,
  sceneBg = '#0d0d0f',
  autoRotate = false,
  atomScale = 1,
  sceneRef,
  onCycleColorScheme,
  onCycleRenderMode,
  enableShortcuts = true,
  enableZoom = true,
}) {
  const hasAtoms = atoms && atoms.length > 0
  const showSpheres = hasAtoms && (renderMode === 'spheres' || renderMode === 'both')
  const showBackbone = hasAtoms && (renderMode === 'backbone' || renderMode === 'both')

  const usePoints = hasAtoms && atoms.length > 8000
  const sphereSegs = !hasAtoms ? 20 : atoms.length > 4000 ? 10 : atoms.length > 1500 ? 16 : 24
  const fitDistance = useMemo(() => computeFitDistance(atoms), [atoms])

  return (
    <Canvas
      className="w-full h-full block"
      camera={{ fov: CAMERA_FOV, position: [0, 0, fitDistance], near: 0.1, far: 2000 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <color attach="background" args={[sceneBg]} />
      <hemisphereLight args={['#ffffff', '#1e1e28', 0.65]} />
      <directionalLight position={[25, 30, 25]} intensity={1.35} />
      <directionalLight position={[-25, -15, -20]} intensity={0.55} color="#b8d4ff" />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.12}
        enableZoom={enableZoom}
        autoRotate={autoRotate}
        autoRotateSpeed={1.6}
      />
      {showSpheres && !usePoints && (
        <AtomSpheres
          atoms={atoms}
          colorScheme={colorScheme}
          customColors={customColors}
          atomScale={atomScale}
          onAtomHover={onAtomHover}
          sphereSegs={sphereSegs}
        />
      )}
      {showSpheres && usePoints && (
        <AtomPoints atoms={atoms} colorScheme={colorScheme} customColors={customColors} atomScale={atomScale} />
      )}
      {showBackbone && (
        <Backbone atoms={atoms} colorScheme={colorScheme} customColors={customColors} atomScale={atomScale} />
      )}
      <SceneController
        fitDistance={fitDistance}
        sceneRef={sceneRef}
        onCycleColorScheme={onCycleColorScheme}
        onCycleRenderMode={onCycleRenderMode}
        enableShortcuts={enableShortcuts}
      />
    </Canvas>
  )
})

export default MoleculeScene

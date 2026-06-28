import { useMemo, useLayoutEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import * as THREE from 'three'
import { getAtomColor, getAtomRadius } from '../utils/colorSchemes'

function AtomGroup({ atoms, radius, colorScheme, onAtomHover, onAtomClick }) {
  const ref = useRef()
  const count = atoms.length

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
      <sphereGeometry args={[radius, 8, 8]} />
      <meshStandardMaterial />
    </instancedMesh>
  )
}

function AtomSpheres({ atoms, colorScheme, onAtomHover, onAtomClick }) {
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
      onAtomHover={onAtomHover}
      onAtomClick={onAtomClick}
    />
  ))
}

function Backbone({ atoms, colorScheme }) {
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
        <tubeGeometry args={[curve, segments, 0.15, 6, false]} />
        <meshStandardMaterial
          color={getAtomColor({ chainID, element: 'C', resName: '' }, colorScheme)}
        />
      </mesh>
    )
  })
}

export default function MoleculeScene({
  atoms,
  colorScheme = 'element',
  renderMode = 'both',
  onAtomHover,
  onAtomClick,
}) {
  const hasAtoms = atoms && atoms.length > 0
  const showSpheres = hasAtoms && (renderMode === 'spheres' || renderMode === 'both')
  const showBackbone = hasAtoms && (renderMode === 'backbone' || renderMode === 'both')

  return (
    <Canvas
      camera={{ fov: 45, position: [0, 0, 50], near: 0.1, far: 500 }}
      dpr={[1, 2]}
      gl={{ antialias: true, shadows: false }}
      style={{ background: '#0d0d0f' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[20, 20, 20]} intensity={1.2} />
      <OrbitControls enableDamping dampingFactor={0.15} />
      {showSpheres && (
        <AtomSpheres
          atoms={atoms}
          colorScheme={colorScheme}
          onAtomHover={onAtomHover}
          onAtomClick={onAtomClick}
        />
      )}
      {showBackbone && <Backbone atoms={atoms} colorScheme={colorScheme} />}
      {import.meta.env.DEV && <Stats />}
    </Canvas>
  )
}

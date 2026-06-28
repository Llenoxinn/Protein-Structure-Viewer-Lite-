const PDB_BASE = import.meta.env.VITE_PDB_BASE_URL || 'https://files.rcsb.org'

export async function fetchPDB(pdbId) {
  const id = pdbId.trim().toUpperCase()
  const url = `${PDB_BASE}/download/${id}.pdb`

  let res
  try {
    res = await fetch(url)
  } catch {
    throw new Error('Network error: could not reach RCSB PDB server')
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`PDB ID "${id}" not found`)
    }
    throw new Error(`Failed to fetch PDB (HTTP ${res.status})`)
  }

  return await res.text()
}

export function parsePDB(pdbText) {
  const atoms = []
  const chains = new Set()
  const lines = pdbText.split('\n')

  for (const line of lines) {
    const recordType = line.slice(0, 6).trim()
    if (recordType !== 'ATOM' && recordType !== 'HETATM') continue

    const serial = parseInt(line.slice(6, 11).trim(), 10)
    const name = line.slice(12, 16).trim()
    const resName = line.slice(17, 20).trim()
    const chainID = line.slice(21, 22) || ' '
    const resSeq = parseInt(line.slice(22, 26).trim(), 10)
    const x = parseFloat(line.slice(30, 38).trim())
    const y = parseFloat(line.slice(38, 46).trim())
    const z = parseFloat(line.slice(46, 54).trim())
    const element = line.slice(76, 78).trim() || name.charAt(0)

    if (isNaN(x) || isNaN(y) || isNaN(z)) continue

    atoms.push({ serial, name, resName, chainID, resSeq, x, y, z, element })
    chains.add(chainID)
  }

  return {
    atoms,
    chains,
    residueCount: new Set(atoms.map((a) => `${a.chainID}:${a.resSeq}`)).size,
    atomCount: atoms.length,
  }
}

export function centerAtoms(atoms) {
  if (atoms.length === 0) return []

  const cx = atoms.reduce((s, a) => s + a.x, 0) / atoms.length
  const cy = atoms.reduce((s, a) => s + a.y, 0) / atoms.length
  const cz = atoms.reduce((s, a) => s + a.z, 0) / atoms.length

  return atoms.map((a) => ({
    ...a,
    x: a.x - cx,
    y: a.y - cy,
    z: a.z - cz,
  }))
}

/*
--- Inline tests (run with Node or Deno) ---

import { parsePDB, centerAtoms } from './pdbParser.js'

// Minimal PDB snippet: ATOM records for a single residue
const sample = [
  'ATOM      1  N   ALA A   1       1.460   0.000   0.000  1.00  0.00           N  ',
  'ATOM      2  CA  ALA A   1       0.000   0.000   0.000  1.00  0.00           C  ',
  'ATOM      3  C   ALA A   1      -0.770   1.270   0.000  1.00  0.00           C  ',
  'ATOM      4  O   ALA A   1      -0.160   2.320   0.000  1.00  0.00           O  ',
  'HETATM   10  O   HOH A   2       2.000   2.000   2.000  1.00  0.00           O  ',
].join('\n')

const parsed = parsePDB(sample)
console.assert(parsed.atomCount === 5, 'atomCount')
console.assert(parsed.atoms[0].name === 'N', 'first atom name')
console.assert(parsed.atoms[0].element === 'N', 'first atom element')
console.assert(parsed.atoms[1].element === 'C', 'CA element')
console.assert(parsed.atoms[4].resName === 'HOH', 'hetatm resName')
console.assert(parsed.chains.has('A'), 'chain A')
console.assert(parsed.residueCount === 2, 'residueCount')

const centered = centerAtoms(parsed.atoms)
const cx = centered.reduce((s, a) => s + a.x, 0)
const cy = centered.reduce((s, a) => s + a.y, 0)
const cz = centered.reduce((s, a) => s + a.z, 0)
console.assert(Math.abs(cx) < 1e-10, 'centroid x ~ 0')
console.assert(Math.abs(cy) < 1e-10, 'centroid y ~ 0')
console.assert(Math.abs(cz) < 1e-10, 'centroid z ~ 0')
console.assert(centered.length === 5, 'centered length')
console.assert(centered[0].name === 'N', 'centered preserves props')

console.log('All inline tests passed')
*/

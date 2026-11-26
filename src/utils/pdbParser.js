const PDB_BASE = import.meta.env?.VITE_PDB_BASE_URL || 'https://files.rcsb.org'

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

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parsePDB, centerAtoms } from '../src/utils/pdbParser.js'
import { getAtomColor, getChainDefaultColor, ELEMENT_COLORS } from '../src/utils/colorSchemes.js'

const SAMPLE_PDB = [
  'ATOM      1  N   ALA A   1       1.460   0.000   0.000  1.00  0.00           N  ',
  'ATOM      2  CA  ALA A   1       0.000   0.000   0.000  1.00  0.00           C  ',
  'ATOM      3  C   ALA A   1      -0.770   1.270   0.000  1.00  0.00           C  ',
  'ATOM      4  O   ALA A   1      -0.160   2.320   0.000  1.00  0.00           O  ',
  'HETATM   10  O   HOH A   2       2.000   2.000   2.000  1.00  0.00           O  ',
  'ATOM     11  CA  GLY B   1       bad     coord   here   1.00  0.00           C  ',
].join('\n')

describe('pdbParser', () => {
  it('parses ATOM and HETATM records and skips malformed coordinates', () => {
    const parsed = parsePDB(SAMPLE_PDB)
    assert.equal(parsed.atomCount, 5)
    assert.equal(parsed.atoms[0].name, 'N')
    assert.equal(parsed.atoms[0].element, 'N')
    assert.equal(parsed.atoms[1].element, 'C')
    assert.equal(parsed.atoms[4].resName, 'HOH')
    assert.equal(parsed.chains.has('A'), true)
    assert.equal(parsed.chains.has('B'), false)
    assert.equal(parsed.residueCount, 2)
  })

  it('centers atoms around the origin', () => {
    const { atoms } = parsePDB(SAMPLE_PDB)
    const centered = centerAtoms(atoms)
    assert.equal(centered.length, 5)
    assert.equal(centered[0].name, 'N')
    const cx = centered.reduce((s, a) => s + a.x, 0)
    const cy = centered.reduce((s, a) => s + a.y, 0)
    const cz = centered.reduce((s, a) => s + a.z, 0)
    assert.ok(Math.abs(cx) < 1e-10)
    assert.ok(Math.abs(cy) < 1e-10)
    assert.ok(Math.abs(cz) < 1e-10)
    assert.deepEqual(centerAtoms([]), [])
  })
})

describe('colorSchemes', () => {
  it('applies element colors and custom overrides', () => {
    const atom = { element: 'C', chainID: 'A', resName: 'ALA' }
    assert.equal(getAtomColor(atom, 'element'), ELEMENT_COLORS.C)
    assert.equal(getAtomColor(atom, 'element', { elements: { C: '#123456' } }), '#123456')
  })

  it('handles partial chain overrides and non-A-Z chain IDs', () => {
    const chainA = { element: 'C', chainID: 'A', resName: 'ALA' }
    const chainB = { element: 'C', chainID: 'B', resName: 'ALA' }
    const chainSpace = { element: 'C', chainID: ' ', resName: 'ALA' }
    const chainNum = { element: 'C', chainID: '1', resName: 'ALA' }

    const partial = { chains: { B: '#ff0000' } }
    assert.equal(getAtomColor(chainB, 'chain', partial), '#ff0000')
    assert.equal(getAtomColor(chainA, 'chain', partial), getChainDefaultColor('A'))
    assert.ok(getAtomColor(chainSpace, 'chain').startsWith('#'))
    assert.ok(getAtomColor(chainNum, 'chain').startsWith('#'))
  })

  it('returns deterministic HSL for residue scheme', () => {
    const color = getAtomColor({ element: 'C', chainID: 'A', resName: 'ALA' }, 'residue')
    assert.match(color, /^hsl\(\d+, 65%, 55%\)$/)
  })
})

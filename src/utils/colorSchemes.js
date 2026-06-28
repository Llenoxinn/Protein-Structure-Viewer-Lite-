let customElementOverrides = {}
let customChainOverrides = []

export function setCustomColors(elements, chains) {
  customElementOverrides = elements || {}
  customChainOverrides = chains || []
}

export const ELEMENT_COLORS = {
  C: '#909090',
  N: '#3050F8',
  O: '#FF0D0D',
  S: '#FFFF30',
  H: '#FFFFFF',
  P: '#FF8000',
}

export const CHAIN_COLORS = [
  '#4ade80',
  '#60a5fa',
  '#f472b6',
  '#fb923c',
  '#a78bfa',
  '#34d399',
  '#fbbf24',
  '#f87171',
]

const DEFAULT_ELEMENT_COLOR = '#FF69B4'

export function getAtomColor(atom, scheme = 'element') {
  switch (scheme) {
    case 'element':
      return customElementOverrides[atom.element] || ELEMENT_COLORS[atom.element] || DEFAULT_ELEMENT_COLOR
    case 'chain': {
      const idx = atom.chainID.charCodeAt(0) - 65
      const palette = customChainOverrides.length ? customChainOverrides : CHAIN_COLORS
      return palette[idx >= 0 && idx < palette.length ? idx : idx % palette.length]
    }
    case 'residue': {
      let hash = 0
      for (let i = 0; i < atom.resName.length; i++) {
        hash = atom.resName.charCodeAt(i) + ((hash << 5) - hash)
      }
      const h = hash % 360
      return `hsl(${h < 0 ? h + 360 : h}, 65%, 55%)`
    }
    default:
      return DEFAULT_ELEMENT_COLOR
  }
}

const VDW_RADII = {
  C: 1.7,
  N: 1.55,
  O: 1.52,
  S: 1.8,
  H: 1.2,
}

const DEFAULT_RADIUS = 1.5
const DISPLAY_SCALE = 0.3

export function getAtomRadius(element) {
  return (VDW_RADII[element] || DEFAULT_RADIUS) * DISPLAY_SCALE
}

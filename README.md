# PDB Viewer

A lightweight, portfolio-grade 3D protein structure viewer built with raw Three.js (no NGL/3Dmol.js). Fetches PDB data from the RCSB PDB API and renders atoms as spheres and the backbone as tubes, color-coded by chain or atom type.

## Stack

- **Vite** – development server and bundler
- **React 18** – UI framework
- **Three.js** + **@react-three/fiber** + **@react-three/drei** – 3D rendering
- **Tailwind CSS** – dark-themed utility-first styling

## Getting Started

```bash
npm install
npm run dev
```

## Usage

1. Open the app in your browser (default `http://localhost:5173`).
2. Enter a valid PDB ID in the input field (e.g. `1CRN`, `4HHB`, `1BNA`).
3. Click **Load** or press Enter.
4. The 3D structure will render in the viewport. Orbit controls allow you to rotate, pan, and zoom.

## API Proxy

Requests to `/api/*` are proxied to `https://files.rcsb.org` to avoid CORS issues. The actual PDB download uses the Vite dev server proxy under the hood.

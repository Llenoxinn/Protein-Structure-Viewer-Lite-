export default function App() {
  return (
    <div className="h-full w-full flex flex-col bg-dark">
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <h1 className="text-sm font-medium tracking-wide text-white/80">
            PDB Viewer
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="PDB ID (e.g. 1CRN)"
            className="w-44 px-3 py-1.5 text-xs rounded border border-white/10 bg-white/5 text-white/70 placeholder-white/20 outline-none focus:border-accent/50 transition-colors uppercase"
          />
          <button className="px-4 py-1.5 text-xs font-medium rounded bg-accent text-dark hover:bg-accent/90 transition-colors">
            Load
          </button>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <p className="text-xs text-white/20">Enter a PDB ID above and hit Load to view the structure.</p>
      </main>
    </div>
  )
}

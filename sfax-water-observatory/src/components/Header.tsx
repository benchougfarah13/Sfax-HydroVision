export default function Header() {
  return (
    <header className="bg-slate-900/50 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Sfax HydroVision</h1>
      <div className="text-sm text-slate-400">
        {new Date().toLocaleDateString()} | Live Sync
      </div>
    </header>
  );
}

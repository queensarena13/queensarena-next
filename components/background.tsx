export function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-[0.15]" />

      <div className="absolute top-[-10%] left-[10%] h-[500px] w-[500px] rounded-full bg-pink-500/20 blur-[140px]" />

      <div className="absolute bottom-[-10%] right-[10%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[140px]" />

      <div className="absolute inset-0 bg-black/30" />
    </div>
  )
}
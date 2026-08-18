export default function LoadingMatchPage() {
  return (
    <main className="min-h-screen bg-[#050505] p-10 text-white">
      <div className="animate-pulse">
        <div className="h-[220px] rounded-[32px] bg-white/[0.04]" />

        <div className="mt-6 h-[240px] rounded-[32px] bg-white/[0.04]" />

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="h-40 rounded-[32px] bg-white/[0.04]" />

          <div className="h-40 rounded-[32px] bg-white/[0.04]" />

          <div className="h-40 rounded-[32px] bg-white/[0.04]" />
        </div>

        <div className="mt-6 h-[400px] rounded-[32px] bg-white/[0.04]" />
      </div>
    </main>
  )
}
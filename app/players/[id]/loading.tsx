export default function LoadingPlayerPage() {
  return (
    <main className="min-h-screen bg-[#050505] p-10 text-white">
      <div className="animate-pulse">
        <div className="h-[260px] rounded-[32px] bg-white/[0.04]" />

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="h-48 rounded-[32px] bg-white/[0.04]" />

          <div className="h-48 rounded-[32px] bg-white/[0.04]" />

          <div className="h-48 rounded-[32px] bg-white/[0.04]" />
        </div>
      </div>
    </main>
  )
}
export default function Loading() {
  return (
    <main className="min-h-screen bg-[#050505] p-8 text-white">
      <div className="animate-pulse">
        {/* TOPBAR */}
        <div className="mb-8 h-20 rounded-3xl bg-white/[0.04]" />

        {/* HERO */}
        <div className="h-[260px] rounded-[32px] bg-white/[0.04]" />

        {/* GRID */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="h-40 rounded-[32px] bg-white/[0.04]" />

          <div className="h-40 rounded-[32px] bg-white/[0.04]" />

          <div className="h-40 rounded-[32px] bg-white/[0.04]" />
        </div>

        {/* MATCHES */}
        <div className="mt-6 rounded-[32px] bg-white/[0.04] p-8">
          <div className="mb-6 h-10 w-56 rounded-xl bg-white/[0.06]" />

          <div className="space-y-4">
            <div className="h-24 rounded-3xl bg-white/[0.06]" />

            <div className="h-24 rounded-3xl bg-white/[0.06]" />

            <div className="h-24 rounded-3xl bg-white/[0.06]" />
          </div>
        </div>
      </div>
    </main>
  )
}
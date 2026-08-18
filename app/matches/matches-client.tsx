"use client"

import dynamic from "next/dynamic"

const MatchesDirectory = dynamic(
  () =>
    import("@/components/matches-directory").then(
      (mod) => mod.MatchesDirectory
    ),
  {
    ssr: false,
    loading: () => <MatchesFallback />,
  }
)

export function MatchesClient() {
  return <MatchesDirectory />
}

function MatchesFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <div className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-6 text-sm font-bold text-zinc-400">
        A carregar jogos...
      </div>
    </div>
  )
}

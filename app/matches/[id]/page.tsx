import { MatchDetail } from "@/components/match-detail"

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white lg:px-8">
      <MatchDetail
        matchId={decodeURIComponent(id)}
      />
    </main>
  )
}

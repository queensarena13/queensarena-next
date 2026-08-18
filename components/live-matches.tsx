import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { MatchStatus } from "@/components/match-status"
import { getServerDictionary } from "@/lib/server-i18n"

export async function LiveMatches() {
  const dictionary =
    await getServerDictionary()

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .eq("sport", "Football")
    .in("status", ["LIVE", "HALFTIME"])
    .order("starts_at", { ascending: true })

  if (!matches || matches.length === 0) {
    return (
      <section className="mt-6 rounded-lg border border-dashed border-white/[0.08] bg-[#0b0b0b] p-8 text-center">
        <h3 className="text-2xl font-black">
          {dictionary.matches.liveTitle}
        </h3>

        <p className="mt-3 text-zinc-500">
          {dictionary.matches.liveEmpty}
        </p>
      </section>
    )
  }

  return (
    <section className="mt-6 rounded-lg border border-white/[0.05] bg-[#0b0b0b] p-5">
      <div className="mb-5">
        <h3 className="text-2xl font-black">
          {dictionary.matches.liveTitle}
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          {dictionary.home.platformLabel}
        </p>
      </div>

      <div className="space-y-3">
        {matches.map((match) => (
          <Link
            key={match.id}
            href={`/matches/${match.id}`}
            className="
              block
              rounded-lg
              border
              border-white/[0.05]
              bg-[#080808]
              p-4
              transition-all
              hover:border-yellow-500/20
              hover:bg-[#101010]
            "
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-zinc-500">
                  {match.sport}
                </p>

                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <span className="truncate font-semibold">
                    {match.home_team}
                  </span>

                  <span className="text-2xl font-black text-yellow-400">
                    {match.home_score} -{" "}
                    {match.away_score}
                  </span>

                  <span className="truncate text-right font-semibold">
                    {match.away_team}
                  </span>
                </div>

                <p className="mt-2 truncate text-sm text-zinc-600">
                  {match.venue}
                </p>
              </div>

              <MatchStatus status={match.status} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { getServerDictionary } from "@/lib/server-i18n"

export async function Standings() {
  const dictionary =
    await getServerDictionary()

  const { data: standings } = await supabase
    .from("standings")
    .select("*")
    .order("position", { ascending: true })

  return (
    <section className="mt-6 rounded-lg border border-white/[0.05] bg-[#0b0b0b] p-5">
      <div className="mb-5">
        <h3 className="text-2xl font-black">
          {dictionary.standings.title}
        </h3>

        <p className="mt-1 text-sm text-zinc-500">
          {dictionary.home.platformLabel}
        </p>
      </div>

      {!standings || standings.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
          {dictionary.standings.empty}
        </div>
      ) : (
        <div className="space-y-3">
          {standings.map((team) => (
            <div
              key={team.id}
              className="
                flex
                items-center
                justify-between
                gap-4
                rounded-lg
                border
                border-white/[0.05]
                bg-[#080808]
                p-4
              "
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="w-8 text-zinc-500">
                  {team.position}
                </span>

                <Link
                  href={`/teams/${encodeURIComponent(team.team)}`}
                  className="truncate font-semibold hover:text-yellow-400"
                >
                  {team.team}
                </Link>
              </div>

              <span className="shrink-0 font-black text-yellow-400">
                {team.points}{" "}
                {dictionary.common.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

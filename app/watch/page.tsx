import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  Tv,
} from "lucide-react"
import {
  fetchBroadcastCalendarEntries,
  getBestBroadcastForMatch,
  type BroadcastCalendarEntry,
} from "@/lib/broadcast-calendar"
import { type MatchBroadcastInfo } from "@/lib/broadcast-sources"
import { fetchQueensArenaMatches } from "@/lib/queensarena-data"
import { getServerLocale } from "@/lib/server-i18n"
import { toHtmlLang } from "@/lib/i18n"

type Match = Awaited<
  ReturnType<typeof fetchQueensArenaMatches>
>[number]

function upcomingOnly(matches: Match[]) {
  const now = Date.now() - 60 * 60 * 1000

  return matches
    .filter(
      (match) =>
        match.status === "SCHEDULED" &&
        new Date(match.starts_at).getTime() >= now
    )
    .sort(
      (a, b) =>
        new Date(a.starts_at).getTime() -
        new Date(b.starts_at).getTime()
    )
}

export default async function WatchPage() {
  const locale = await getServerLocale()
  const broadcastCalendar = await fetchBroadcastCalendarEntries(30)
  const matches = upcomingOnly(
    await fetchQueensArenaMatches({
      limit: 15000,
    })
  ).slice(0, 60)

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <section className="mb-6 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-6 lg:p-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-bold uppercase text-yellow-300">
            <Tv className="h-4 w-4" />
            {locale === "pt" ? "Onde ver" : "Where to watch"}
          </div>

          <h1 className="text-4xl font-black md:text-5xl">
            {locale === "pt"
              ? "Calendário de transmissões"
              : "Broadcast calendar"}
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base">
            {locale === "pt"
              ? "Calendário de jogos futuros com informação de transmissão."
              : "Upcoming matches with broadcast information."}
          </p>
        </section>

        {matches.length === 0 ? (
          <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5 text-sm text-zinc-400">
            {locale === "pt"
              ? "Ainda não há jogos futuros com transmissão carregada."
              : "There are no upcoming matches with broadcast information yet."}
          </section>
        ) : (
          <section className="grid gap-3">
            {matches.map((match) => (
              <WatchMatchCard
                key={match.external_id}
                match={match}
                locale={locale}
                broadcast={getBestBroadcastForMatch(
                  match,
                  broadcastCalendar
                )}
              />
            ))}
          </section>
        )}

        {broadcastCalendar.length > 0 ? (
          <section className="mt-8 rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-yellow-400">
                  {locale === "pt" ? "Mais jogos" : "More matches"}
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  {locale === "pt" ? "Transmissões" : "Broadcasts"}
                </h2>
              </div>
              <Tv className="h-5 w-5 shrink-0 text-yellow-400" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {broadcastCalendar.slice(0, 8).map((entry) => (
                <ExternalScheduleCard
                  key={entry.id}
                  entry={entry}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

function WatchMatchCard({
  match,
  locale,
  broadcast,
}: {
  match: Match
  locale: "pt" | "en"
  broadcast?: MatchBroadcastInfo
}) {
  const matchHref = `/matches/${encodeURIComponent(
    match.external_id
  )}`
  const time = new Date(match.starts_at).toLocaleString(
    toHtmlLang(locale),
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  )

  return (
    <article className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-500">
            <CalendarDays className="h-4 w-4 text-yellow-400" />
            {time} / {match.competition}
          </p>

          <h2 className="mt-3 text-xl font-black md:text-2xl">
            {match.home_team}{" "}
            <span className="text-yellow-400">vs</span>{" "}
            {match.away_team}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {broadcast ? (
            <Link
              href={broadcast.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 text-sm font-black text-black transition hover:bg-yellow-300"
            >
              <Tv className="h-4 w-4" />
              {locale === "pt" ? "Onde ver" : "Where"}
              <span>{broadcast.channel}</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null}

          <Link
            href={matchHref}
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-bold text-zinc-300 transition hover:text-white"
          >
            {locale === "pt" ? "Detalhes" : "Details"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  )
}

function ExternalScheduleCard({
  entry,
  locale,
}: {
  entry: BroadcastCalendarEntry
  locale: "pt" | "en"
}) {
  const time = new Date(entry.startsAt).toLocaleString(
    toHtmlLang(locale),
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  )

  return (
    <Link
      href={entry.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-lg border border-white/[0.06] bg-[#080808] p-4 transition hover:border-yellow-400/30"
    >
      <p className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-500">
        <CalendarDays className="h-4 w-4 text-yellow-400" />
        {time} / {entry.competition}
      </p>
      <h3 className="mt-3 text-lg font-black">
        {entry.homeTeam} <span className="text-yellow-400">vs</span>{" "}
        {entry.awayTeam}
      </h3>
      <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
        <Tv className="h-4 w-4" />
        {entry.channel}
        <ExternalLink className="h-4 w-4" />
      </p>
    </Link>
  )
}

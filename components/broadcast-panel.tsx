import Link from "next/link"
import {
  ExternalLink,
  Radio,
  Tv,
} from "lucide-react"
import {
  getBroadcastSources,
  getMatchBroadcastInfo,
  type BroadcastSource,
} from "@/lib/broadcast-sources"
import { toHtmlLang, type Locale } from "@/lib/i18n"

type Props = {
  sport?: string | null
  region?: string | null
  competition?: string | null
  locale: Locale
  compact?: boolean
}

type MatchProps = {
  sport?: string | null
  region?: string | null
  competition?: string | null
  homeTeam?: string | null
  awayTeam?: string | null
  startsAt?: string | null
  locale: Locale
}

function typeLabel(
  source: BroadcastSource,
  locale: Locale
) {
  if (source.type === "streaming") {
    return "Streaming"
  }

  if (source.type === "partner") {
    return locale === "pt"
      ? "Parceiro"
      : "Partner"
  }

  if (source.type === "official") {
    return locale === "pt"
      ? "Oficial"
      : "Official"
  }

  return "TV"
}

function statusLabel(
  status: "confirmed" | "source-schedule" | "editorial-check",
  locale: Locale
) {
  if (status === "confirmed") {
    return locale === "pt" ? "Confirmado" : "Confirmed"
  }

  if (status === "source-schedule") {
    return locale === "pt" ? "Na grelha" : "Listed"
  }

  return locale === "pt" ? "Confirmar" : "Check"
}

export function BroadcastPanel({
  sport,
  region,
  competition,
  locale,
  compact = false,
}: Props) {
  const sources = getBroadcastSources({
    sport,
    region,
    competition,
  }).slice(0, compact ? 3 : 8)

  if (sources.length === 0) {
    return null
  }

  const title =
    locale === "pt" ? "Onde ver" : "Where to watch"
  const description =
    locale === "pt"
      ? "Canais e plataformas a confirmar na grelha oficial antes do jogo."
      : "Channels and platforms to confirm in the official schedule before the match."

  return (
    <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-yellow-400">
            {title}
          </p>
          <h2 className="mt-1 text-2xl font-black">
            {locale === "pt"
              ? "Transmissão e cobertura"
              : "Broadcast and coverage"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            {description}
          </p>
        </div>
        <Tv className="h-5 w-5 shrink-0 text-yellow-400" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {sources.map((source) => (
          <Link
            key={source.name}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-lg border border-white/[0.06] bg-[#080808] p-4 transition hover:border-yellow-400/30"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-black">
                  <Radio className="h-4 w-4 shrink-0 text-yellow-400" />
                  <span className="truncate">
                    {source.name}
                  </span>
                </span>
                <span className="mt-2 inline-flex rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[11px] font-bold uppercase text-zinc-400">
                  {typeLabel(source, locale)}
                </span>
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-yellow-400" />
            </div>

          </Link>
        ))}
      </div>
    </section>
  )
}

export function MatchBroadcastPanel({
  sport,
  region,
  competition,
  homeTeam,
  awayTeam,
  startsAt,
  locale,
}: MatchProps) {
  const entries = getMatchBroadcastInfo({
    sport,
    region,
    competition,
    homeTeam,
    awayTeam,
  }).slice(0, 3)

  if (entries.length === 0) return null

  const time = startsAt
    ? new Date(startsAt).toLocaleString(
        toHtmlLang(locale),
        {
          dateStyle: "short",
          timeStyle: "short",
        }
      )
    : null

  return (
    <section className="rounded-lg border border-white/[0.06] bg-[#0b0b0b] p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-yellow-400">
            {locale === "pt" ? "Onde ver" : "Where to watch"}
          </p>
          <h2 className="mt-1 text-2xl font-black">
            {time ||
              (locale === "pt"
                ? "Horário por confirmar"
                : "Time to be confirmed")}
          </h2>
        </div>
        <Tv className="h-5 w-5 shrink-0 text-yellow-400" />
      </div>

      <div className="grid gap-3">
        {entries.map((entry) => (
          <Link
            key={`${entry.channel}-${entry.url}`}
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-lg border border-white/[0.06] bg-[#080808] p-4 transition hover:border-yellow-400/30"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-black">
                  <Radio className="h-4 w-4 shrink-0 text-yellow-400" />
                  <span className="truncate">
                    {entry.label}
                  </span>
                </span>
                <span className="mt-2 inline-flex rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 text-[11px] font-bold uppercase text-yellow-300">
                  {statusLabel(entry.status, locale)}
                </span>
              </span>
              <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-yellow-400" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

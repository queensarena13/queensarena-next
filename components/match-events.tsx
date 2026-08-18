interface MatchEvent {
  id: number | string
  type: string
  player: string
  team: string
  minute: number | string
}

interface Props {
  events: MatchEvent[]
}

function getEventLabel(type: string) {
  if (type === "GOAL") return "Goal"
  if (type === "YELLOW CARD") return "Card"
  if (type === "SUBSTITUTION") {
    return "Sub"
  }

  return type
}

export function MatchEvents({
  events,
}: Props) {
  return (
    <section className="mt-6 rounded-lg border border-white/[0.05] bg-[#0b0b0b] p-5">
      <div className="mb-5">
        <h2 className="text-2xl font-black">
          Match Events
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Live match timeline and key moments.
        </p>
      </div>

      <div className="space-y-3">
        {events?.map((event) => (
          <div
            key={event.id}
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
              <div className="rounded-md bg-yellow-500/10 px-3 py-2 text-xs font-bold text-yellow-300">
                {getEventLabel(event.type)}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-white">
                  {event.player}
                </p>

                <p className="mt-1 truncate text-sm text-zinc-500">
                  {event.team}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <p className="hidden text-xs font-bold uppercase text-zinc-500 sm:block">
                {event.type}
              </p>

              <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm font-bold text-yellow-300">
                {event.minute}&apos;
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

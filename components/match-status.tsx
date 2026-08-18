interface Props {
  status: string
}

export function MatchStatus({
  status,
}: Props) {
  if (status === "LIVE") {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase text-red-300">
        LIVE
      </div>
    )
  }

  if (status === "FINISHED") {
    return (
      <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs font-bold uppercase text-green-300">
        FINISHED
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase text-blue-300">
      SCHEDULED
    </div>
  )
}

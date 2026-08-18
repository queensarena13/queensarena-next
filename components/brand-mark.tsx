import { Crown } from "lucide-react"

interface BrandMarkProps {
  compact?: boolean
  showBeta?: boolean
  showIcon?: boolean
}

export function BrandMark({
  compact = false,
}: BrandMarkProps) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <Crown
        className={`shrink-0 text-yellow-400 ${
          compact ? "h-9 w-9" : "h-10 w-10"
        }`}
      />
      <p
        className={`whitespace-nowrap font-black leading-none ${
          compact ? "text-2xl" : "text-3xl"
        }`}
      >
        <span className="text-white">
          Queens
        </span>
        <span className="text-yellow-400">
          Arena
        </span>
      </p>
    </div>
  )
}

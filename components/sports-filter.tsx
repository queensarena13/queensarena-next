"use client"

import { SPORTS } from "@/lib/sports-config"
import { useLanguage } from "@/components/language-provider"

interface Props {
  selected: string
  onChange: (sport: string) => void
}

export function SportsFilter({
  selected,
  onChange,
}: Props) {
  const { dictionary } = useLanguage()

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onChange("all")}
        className={`
          rounded-full
          px-5
          py-3
          text-sm
          font-semibold
          transition-all

          ${
            selected === "all"
              ? "bg-yellow-400 text-black"
              : "bg-white/[0.05] text-white"
          }
        `}
      >
        {dictionary.common.all}
      </button>

      {SPORTS.map((sport) => (
        <button
          key={sport.key}
          onClick={() =>
            onChange(sport.name)
          }
          className={`
            rounded-full
            px-5
            py-3
            text-sm
            font-semibold
            transition-all

            ${
              selected === sport.name
                ? "bg-yellow-400 text-black"
                : "bg-white/[0.05] text-white"
            }
          `}
        >
          {sport.name}
        </button>
      ))}
    </div>
  )
}

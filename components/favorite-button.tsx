"use client"

import { Heart } from "lucide-react"
import { useEffect, useState } from "react"
import { useLanguage } from "@/components/language-provider"
import {
  favoriteTeamsChangedEvent,
  getFavoriteTeams,
} from "@/lib/local-favorites"
import {
  syncFavoritesFromAccount,
  toggleSyncedFavoriteTeam,
} from "@/lib/synced-favorites"

interface Props {
  teamId?: number
  teamKey?: string
  teamName?: string
  sport?: string
  compact?: boolean
}

export function FavoriteButton({
  teamId,
  teamKey,
  teamName,
  sport,
  compact = false,
}: Props) {
  const { dictionary } = useLanguage()
  const favoriteKey =
    teamKey || teamName || String(teamId || "")
  const [isFavorite, setIsFavorite] =
    useState(() =>
      getFavoriteTeams().includes(favoriteKey)
    )

  useEffect(() => {
    void syncFavoritesFromAccount()

    function sync() {
      setIsFavorite(
        getFavoriteTeams().includes(favoriteKey)
      )
    }

    window.addEventListener(
      favoriteTeamsChangedEvent,
      sync
    )

    return () => {
      window.removeEventListener(
        favoriteTeamsChangedEvent,
        sync
      )
    }
  }, [favoriteKey])

  async function toggleFavorite() {
    if (!favoriteKey) return

    setIsFavorite(
      await toggleSyncedFavoriteTeam({
        key: favoriteKey,
        teamId,
        name: teamName,
        sport,
      })
    )
  }

  const label = isFavorite
    ? dictionary.common.removeFavorite
    : dictionary.common.favorite

  return (
    <button
      aria-label={label}
      title={label}
      onClick={toggleFavorite}
      className={`
        flex
        ${compact ? "h-10 w-10" : "h-12 w-12"}
        items-center
        justify-center
        rounded-lg
        border
        transition-all
        ${
          isFavorite
            ? "border-yellow-400/30 bg-yellow-400/10 text-yellow-400"
            : "border-white/[0.08] bg-white/[0.03] text-white hover:border-yellow-400/30"
        }
      `}
      type="button"
    >
      <Heart
        className={`${compact ? "h-4 w-4" : "h-5 w-5"} ${
          isFavorite ? "fill-yellow-400" : ""
        }`}
      />
    </button>
  )
}

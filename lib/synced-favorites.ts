"use client"

import { supabaseClient } from "@/lib/supabase-client"
import {
  getFavoriteTeams,
  setFavoriteTeams,
  toggleFavoriteTeam,
} from "@/lib/local-favorites"

type FavoriteInput = {
  key: string
  teamId?: number
  name?: string
  sport?: string
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

export async function syncFavoritesFromAccount() {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()

  if (!user) {
    return {
      signedIn: false,
      count: getFavoriteTeams().length,
    }
  }

  const localFavorites = getFavoriteTeams()

  const { data, error } = await supabaseClient
    .from("favorites")
    .select("team_key")
    .eq("user_id", user.id)

  if (error) {
    return {
      signedIn: true,
      count: localFavorites.length,
      error,
    }
  }

  const remoteFavorites =
    data
      ?.map((item) => item.team_key)
      .filter(
        (item): item is string =>
          typeof item === "string" && item.length > 0
      ) || []

  const merged = unique([
    ...localFavorites,
    ...remoteFavorites,
  ])

  if (merged.length > 0) {
    const { error: upsertError } =
      await supabaseClient.from("favorites").upsert(
        merged.map((teamKey) => ({
          user_id: user.id,
          team_key: teamKey,
          updated_at: new Date().toISOString(),
        })),
        {
          onConflict: "user_id,team_key",
        }
      )

    if (upsertError) {
      return {
        signedIn: true,
        count: merged.length,
        error: upsertError,
      }
    }
  }

  setFavoriteTeams(merged)

  return {
    signedIn: true,
    count: merged.length,
  }
}

export async function toggleSyncedFavoriteTeam({
  key,
  teamId,
  name,
  sport,
}: FavoriteInput) {
  const isFavorite = toggleFavoriteTeam(key)

  const {
    data: { user },
  } = await supabaseClient.auth.getUser()

  if (!user) {
    return isFavorite
  }

  try {
    if (isFavorite) {
      const payload = {
        user_id: user.id,
        team_id: teamId || null,
        team_key: key,
        team_name: name || key,
        sport: sport || null,
        updated_at: new Date().toISOString(),
      }

      const { error } =
        await supabaseClient.from("favorites").upsert(
          payload,
          {
            onConflict: "user_id,team_key",
          }
        )

      if (error && teamId) {
        await supabaseClient.from("favorites").upsert(
          {
            user_id: user.id,
            team_id: teamId,
          },
          {
            onConflict: "user_id,team_id",
          }
        )
      }
    } else {
      if (teamId) {
        await supabaseClient
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("team_id", teamId)
      }

      await supabaseClient
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("team_key", key)
    }
  } catch {
    return isFavorite
  }

  return isFavorite
}

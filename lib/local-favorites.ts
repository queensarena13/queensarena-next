export const favoriteTeamsStorageKey =
  "queensarena-favorite-teams"

export const favoriteTeamsChangedEvent =
  "queensarena:favorites-changed"

export function getFavoriteTeams() {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const value = window.localStorage.getItem(
      favoriteTeamsStorageKey
    )

    if (!value) {
      return []
    }

    const parsed = JSON.parse(value)

    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is string =>
            typeof item === "string"
        )
      : []
  } catch {
    return []
  }
}

export function setFavoriteTeams(
  favorites: string[]
) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(
    favoriteTeamsStorageKey,
    JSON.stringify([...new Set(favorites)])
  )

  window.dispatchEvent(
    new Event(favoriteTeamsChangedEvent)
  )
}

export function toggleFavoriteTeam(key: string) {
  const favorites = getFavoriteTeams()

  if (favorites.includes(key)) {
    setFavoriteTeams(
      favorites.filter((item) => item !== key)
    )

    return false
  }

  setFavoriteTeams([...favorites, key])
  return true
}

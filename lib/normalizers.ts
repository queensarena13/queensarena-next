export function normalizeTeamName(
  name: string
) {
  return name
    .trim()
    .replace(/\s+/g, " ")
}

export function normalizeVenue(
  venue: string
) {
  return venue
    .trim()
    .replace(/\s+/g, " ")
}
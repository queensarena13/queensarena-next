import { ExternalMatch } from "@/lib/providers/matches-provider"

export function validateMatch(
  match: ExternalMatch
): boolean {
  // REQUIRED FIELDS
  if (
    !match.external_id ||
    !match.home_team ||
    !match.away_team ||
    !match.sport
  ) {
    return false
  }

  // INVALID SCORES
  if (
    match.home_score < 0 ||
    match.away_score < 0
  ) {
    return false
  }

  // SAME TEAM
  if (
    match.home_team ===
    match.away_team
  ) {
    return false
  }

  // INVALID STATUS
  const validStatuses = [
    "LIVE",
    "FINISHED",
    "SCHEDULED",
    "HALFTIME",
    "POSTPONED",
    "CANCELLED",
  ]

  if (
    !validStatuses.includes(match.status)
  ) {
    return false
  }

  return true
}

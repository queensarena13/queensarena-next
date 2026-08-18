export const defaultAdsenseClient =
  "ca-pub-6310873624938041"

export const adsenseClient =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ||
  defaultAdsenseClient

const defaultDisplaySlot =
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY ||
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME

export const adSlots = {
  home:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME ||
    defaultDisplaySlot,
  matches:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_MATCHES ||
    defaultDisplaySlot,
  teams:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_TEAMS ||
    defaultDisplaySlot,
  leagues:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEAGUES ||
    defaultDisplaySlot,
  stats:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_STATS ||
    defaultDisplaySlot,
  players:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_PLAYERS ||
    defaultDisplaySlot,
}

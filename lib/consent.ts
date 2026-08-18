export const consentStorageKey =
  "queensarena_cookie_consent"

export const consentUpdatedEvent =
  "queensarena-consent-updated"

export interface ConsentPreferences {
  necessary: true
  analytics: boolean
  ads: boolean
  updatedAt: string
}

export function createConsentPreferences({
  analytics,
  ads,
}: {
  analytics: boolean
  ads: boolean
}): ConsentPreferences {
  return {
    necessary: true,
    analytics,
    ads,
    updatedAt: new Date().toISOString(),
  }
}

export function parseConsent(
  value: string | null | undefined
): ConsentPreferences | null {
  if (!value) return null

  if (value === "accepted") {
    return createConsentPreferences({
      analytics: true,
      ads: true,
    })
  }

  if (value === "necessary") {
    return createConsentPreferences({
      analytics: false,
      ads: false,
    })
  }

  try {
    const parsed = JSON.parse(
      value
    ) as Partial<ConsentPreferences>

    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      ads: Boolean(parsed.ads),
      updatedAt:
        parsed.updatedAt ||
        new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function readConsent() {
  if (typeof window === "undefined") {
    return null
  }

  return parseConsent(
    window.localStorage.getItem(consentStorageKey)
  )
}

export function saveConsent(
  preferences: ConsentPreferences
) {
  window.localStorage.setItem(
    consentStorageKey,
    JSON.stringify(preferences)
  )
  window.dispatchEvent(
    new Event(consentUpdatedEvent)
  )
}

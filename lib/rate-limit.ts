let lastRequestTime = 0

export async function rateLimit(
  delay = 1000
) {
  const now = Date.now()

  const difference =
    now - lastRequestTime

  if (difference < delay) {
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        delay - difference
      )
    )
  }

  lastRequestTime = Date.now()
}
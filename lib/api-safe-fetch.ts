export async function apiSafeFetch(
  url: string,
  options?: RequestInit,
  retries = 3
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,

        headers: {
          "Content-Type":
            "application/json",

          ...(options?.headers || {}),
        },

        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        )
      }

      return response.json()
    } catch (error) {
      console.error(
        `API attempt ${attempt} failed`,
        error
      )

      if (attempt === retries) {
        throw error
      }

      // WAIT BEFORE RETRY
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 * attempt)
      )
    }
  }
}
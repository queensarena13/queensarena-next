export function getErrorMessage(
  error: unknown
) {
  if (error instanceof Error) {
    return error.message
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    return String(
      (error as { message: unknown })
        .message
    )
  }

  if (
    error &&
    typeof error === "object"
  ) {
    try {
      return JSON.stringify(error)
    } catch {
      return "Unknown object error"
    }
  }

  return String(error)
}

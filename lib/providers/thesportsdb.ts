const baseUrl =
  "https://www.thesportsdb.com/api/v1/json"

export function getTheSportsDbUrl(path: string) {
  const apiKey =
    process.env.THESPORTSDB_API_KEY || "123"

  return `${baseUrl}/${apiKey}/${path}`
}

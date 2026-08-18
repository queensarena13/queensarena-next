import { getSupabaseAdmin } from "@/lib/supabase-admin"
import { EDITORIAL_SOURCES as STATIC_EDITORIAL_SOURCES } from "./editorial-sources-data"

export type EditorialSource = {
  slug: string
  name: string
  homepage_url: string
  sports_url: string
  rss_url: string | null
  category: string
  region: string
  language: string
  coverage: string[]
  priority: number
  enabled: boolean
  rights_note: string
}

export const EDITORIAL_SOURCES =
  STATIC_EDITORIAL_SOURCES as EditorialSource[]

function activeSources(sources: EditorialSource[]) {
  return sources
    .filter((source) => source.enabled)
    .sort((a, b) => b.priority - a.priority)
}

export async function fetchEditorialSources() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("editorial_sources")
      .select(
        "slug,name,homepage_url,sports_url,rss_url,category,region,language,coverage,priority,enabled,rights_note"
      )
      .eq("enabled", true)
      .order("priority", { ascending: false })

    if (error) {
      return activeSources(EDITORIAL_SOURCES)
    }

    return data && data.length > 0
      ? (data as EditorialSource[])
      : activeSources(EDITORIAL_SOURCES)
  } catch {
    return activeSources(EDITORIAL_SOURCES)
  }
}

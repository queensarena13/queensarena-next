export type OfficialSource = {
  slug: string
  name: string
  sport: string
  country: string | null
  region: string | null
  competition: string
  season: string
  source_url: string
  source_type: string
  ingestion_method: string
  parser_key: string | null
  rights_status: string
  priority: number
  status: string
  notes: string
}

import { OFFICIAL_SOURCES as SOURCES } from "./official-sources-data"

export const OFFICIAL_SOURCES =
  SOURCES as OfficialSource[]

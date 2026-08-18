import { supabase } from "@/lib/supabase"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

const envChecks = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    label: "Supabase URL",
    public: true,
    required: true,
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    label: "Supabase anon key",
    public: true,
    required: true,
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    label: "Supabase service role",
    public: false,
    required: true,
  },
  {
    key: "SPORTMONKS_API_TOKEN",
    label: "Sportmonks token",
    public: false,
    required: false,
  },
  {
    key: "STATSCORE_API_KEY",
    label: "STATSCORE API key",
    public: false,
    required: false,
  },
  {
    key: "STATSCORE_COMPETITIONS_JSON",
    label: "STATSCORE competitions",
    public: false,
    required: false,
  },
  {
    key: "PUSH_BROADCAST_SECRET",
    label: "Push broadcast secret",
    public: false,
    required: false,
  },
  {
    key: "CRON_SECRET",
    label: "Cron secret",
    public: false,
    required: true,
  },
  {
    key: "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
    label: "VAPID public key",
    public: true,
    required: false,
  },
  {
    key: "VAPID_PRIVATE_KEY",
    label: "VAPID private key",
    public: false,
    required: false,
  },
] as const

const tableChecks = [
  "leagues",
  "teams",
  "players",
  "matches",
  "standings",
  "data_sources",
  "roster_memberships",
  "player_season_stats",
  "team_season_stats",
  "push_subscriptions",
  "analytics_events",
] as const

async function checkTable(table: string) {
  const { error, count } = await supabase
    .from(table)
    .select("id", {
      count: "exact",
      head: true,
    })

  return {
    table,
    ready: !error,
    count: count || 0,
    message: error?.message || null,
  }
}

export async function getSetupStatus() {
  const env = envChecks.map((item) => ({
    ...item,
    ready: Boolean(process.env[item.key]),
  }))

  const tables = await Promise.all(
    tableChecks.map((table) =>
      checkTable(table)
    )
  )
  const serviceRoleCheck =
    await checkServiceRole()

  const requiredEnvReady = env
    .filter((item) => item.required)
    .every((item) => item.ready)
  const requiredTablesReady = tables.every(
    (item) => item.ready
  )

  return {
    checkedAt: new Date().toISOString(),
    env,
    tables,
    ready:
      requiredEnvReady &&
      requiredTablesReady &&
      serviceRoleCheck.ready,
    missingEnv: env.filter(
      (item) => item.required && !item.ready
    ),
    missingTables: tables.filter(
      (item) => !item.ready
    ),
    serviceRoleCheck,
  }
}

async function checkServiceRole() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin
      .from("leagues")
      .select("id", {
        head: true,
      })

    return {
      ready: !error,
      message: error?.message || null,
    }
  } catch (error) {
    return {
      ready: false,
      message:
        error instanceof Error
          ? error.message
          : "Service role unavailable",
    }
  }
}

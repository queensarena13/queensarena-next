import { getSupabaseAdmin } from "@/lib/supabase-admin"

export async function logSync(
  status: string,
  message: string
) {
  try {
    await getSupabaseAdmin()
      .from("sync_logs")
      .insert({
        status,
        message,
      })
  } catch (error) {
    console.error("SYNC LOG ERROR:", error)
  }
}

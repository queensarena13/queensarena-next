import { getSupabaseAdmin } from "@/lib/supabase-admin"

function getExternalId(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "external_id" in payload
  ) {
    return String(
      (payload as { external_id?: unknown })
        .external_id || ""
    )
  }

  return ""
}

export async function addToQueue(
  type: string,
  payload: unknown
) {
  const supabaseAdmin = getSupabaseAdmin()
  const externalId = getExternalId(payload)

  if (externalId) {
    const { data: pending } =
      await supabaseAdmin
        .from("sync_queue")
        .select("id")
        .eq("type", type)
        .eq("status", "PENDING")
        .contains("payload", {
          external_id: externalId,
        })
        .limit(1)

    if (pending?.length) {
      return
    }
  }

  const { error } = await supabaseAdmin
    .from("sync_queue")
    .insert({
      type,
      payload,
    })

  if (error) {
    throw error
  }
}

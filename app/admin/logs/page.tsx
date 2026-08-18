import { supabase } from "@/lib/supabase"

export default async function LogsPage() {
  const { data: logs } = await supabase
    .from("sync_logs")
    .select("*")
    .order("created_at", {
      ascending: false,
    })

  return (
    <main className="min-h-screen bg-[#050505] p-10 text-white">
      <section className="rounded-[32px] border border-white/[0.05] bg-[#0b0b0b] p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black">
            Sync Logs
          </h1>

          <p className="mt-3 text-zinc-500">
            Monitoring sync operations and API
            updates.
          </p>
        </div>

        <div className="space-y-4">
          {logs?.map((log) => (
            <div
              key={log.id}
              className="
                rounded-2xl
                border
                border-white/[0.05]
                bg-[#080808]
                p-5
              "
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-yellow-400">
                    {log.status}
                  </p>

                  <p className="mt-2 text-zinc-300">
                    {log.message}
                  </p>
                </div>

                <p className="text-sm text-zinc-500">
                  {new Date(
                    log.created_at
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
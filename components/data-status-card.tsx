import { Database, ShieldCheck } from "lucide-react"
import { getDictionary, Locale } from "@/lib/i18n"

type DataStatusCardProps = {
  title: string
  description: string
  source?: string
  updatedAt?: string | null
  locale?: Locale
}

export function DataStatusCard({
  title,
  description,
  source,
  updatedAt,
  locale = "pt",
}: DataStatusCardProps) {
  const dictionary = getDictionary(locale)

  return (
    <section className="mb-6 rounded-lg border border-white/[0.06] bg-[#071015] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-green-400" />
          <div>
            <h2 className="font-black">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              {description}
            </p>
          </div>
        </div>

        {(source || updatedAt) && (
          <div className="rounded-lg border border-white/[0.08] bg-black px-4 py-3 text-sm">
            {source && (
              <div className="flex items-center gap-2 font-bold text-white">
                <Database className="h-4 w-4 text-yellow-400" />
                {source}
              </div>
            )}
            {updatedAt ? (
              <p className="mt-1 text-xs text-zinc-500">
                {dictionary.common.lastUpdated}: {updatedAt}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}

import type { ReactNode } from "react"

type InfoPageProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export function InfoPage({
  eyebrow,
  title,
  description,
  children,
}: InfoPageProps) {
  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white lg:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="inline-flex rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-xs font-black uppercase text-yellow-300">
          {eyebrow}
        </p>

        <h1 className="mt-6 text-4xl font-black md:text-5xl">
          {title}
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
          {description}
        </p>

        <div className="mt-8 space-y-4 text-sm leading-7 text-zinc-300 [&_a]:font-bold [&_a]:text-yellow-400 [&_a]:transition [&_a:hover]:text-yellow-300 [&_h2]:pt-3 [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-white">
          {children}
        </div>
      </div>
    </main>
  )
}

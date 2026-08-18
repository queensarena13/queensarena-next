import Link from "next/link"

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] p-8 text-white">
      <div className="max-w-[500px] text-center">
        <div className="text-8xl font-black text-yellow-400">
          404
        </div>

        <h1 className="mt-6 text-5xl font-black">
          Page Not Found
        </h1>

        <p className="mt-5 text-zinc-500">
          The page you’re looking for doesn’t
          exist or may have been removed.
        </p>

        <Link
          href="/"
          className="
            mt-8
            inline-flex
            rounded-2xl
            bg-yellow-400
            px-6
            py-4
            font-semibold
            text-black
            transition-all
            hover:scale-[1.03]
          "
        >
          Back Home
        </Link>
      </div>
    </main>
  )
}
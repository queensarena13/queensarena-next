"use client"

export default function ErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] p-8 text-white">
      <div className="max-w-[500px] text-center">
        <div className="text-7xl">⚠️</div>

        <h1 className="mt-6 text-5xl font-black">
          Something went wrong
        </h1>

        <p className="mt-5 text-zinc-500">
          We couldn’t load the requested sports
          data. Please try again later.
        </p>

        <button
          onClick={() => location.reload()}
          className="
            mt-8
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
          Reload
        </button>
      </div>
    </main>
  )
}
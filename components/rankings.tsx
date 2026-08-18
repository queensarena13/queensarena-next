const players = [
  {
    name: "Viper",
    wins: 124,
    rating: 2410,
  },
  {
    name: "Nova",
    wins: 118,
    rating: 2360,
  },
  {
    name: "Blaze",
    wins: 109,
    rating: 2280,
  },
]

export function Rankings() {
  return (
    <section className="mt-8 rounded-[32px] border border-white/[0.05] bg-[#0b0b0b] p-8">
      <div className="mb-8">
        <h3 className="text-2xl font-black">
          Global Rankings
        </h3>

        <p className="mt-1 text-zinc-500">
          Top competitive players this season.
        </p>
      </div>

      <div className="space-y-4">
        {players.map((player, index) => (
          <div
            key={index}
            className="
              flex
              items-center
              justify-between
              rounded-2xl
              border
              border-white/[0.05]
              bg-[#080808]
              px-6
              py-5
              transition-all
              hover:border-yellow-500/20
            "
          >
            <div className="flex items-center gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400 font-black text-black">
                #{index + 1}
              </div>

              <div>
                <h4 className="font-semibold">
                  {player.name}
                </h4>

                <p className="text-sm text-zinc-500">
                  {player.wins} wins
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-zinc-500">
                Rating
              </p>

              <h4 className="text-2xl font-black text-yellow-400">
                {player.rating}
              </h4>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
export function RightSidebar() {
  return (
    <div className="space-y-6">
      {/* ranking */}
      <div className="rounded-[32px] border border-white/[0.05] bg-[#0b0b0b] p-8">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-2xl font-black">
            Ranking Global
          </h3>

          <button className="text-sm text-yellow-400">
            Ver Ranking
          </button>
        </div>

        <div className="space-y-5">
          {[
            ["Empress", "2560"],
            ["Valkyrie", "2350"],
            ["Queen", "2120"],
            ["Artemis", "1980"],
          ].map((player, index) => (
            <div
              key={index}
              className={`
                flex
                items-center
                justify-between
                rounded-2xl
                px-4
                py-4
                ${
                  index === 2
                    ? "bg-yellow-500/10"
                    : ""
                }
              `}
            >
              <div className="flex items-center gap-4">
                <span className="w-5 text-zinc-500">
                  {index + 1}
                </span>

                <span className="font-semibold">
                  {player[0]}
                </span>
              </div>

              <span className="font-semibold text-yellow-400">
                {player[1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* recent matches */}
      <div className="rounded-[32px] border border-white/[0.05] bg-[#0b0b0b] p-8">
        <div className="mb-8">
          <h3 className="text-2xl font-black">
            Jogos Recentes
          </h3>

          <p className="mt-2 text-zinc-500">
            Últimos resultados competitivos.
          </p>
        </div>

        <div className="space-y-4">
          {[
            ["Queens", "2 - 1", "Valkyries"],
            ["Nova", "0 - 3", "Empire"],
            ["Phoenix", "2 - 0", "Shadow"],
          ].map((match, index) => (
            <div
              key={index}
              className="
                rounded-2xl
                border
                border-white/[0.05]
                bg-[#080808]
                px-5
                py-4
              "
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {match[0]}
                </span>

                <span className="font-black text-yellow-400">
                  {match[1]}
                </span>

                <span className="font-semibold">
                  {match[2]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
import { AdSlot } from "@/components/ad-slot"
import { PlayersDirectory } from "@/components/players-directory"
import { adSlots } from "@/lib/ads"

export default function PlayersPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <PlayersDirectory />
      <AdSlot slot={adSlots.players} />
    </main>
  )
}

import { AdSlot } from "@/components/ad-slot"
import { adSlots } from "@/lib/ads"
import { MatchesClient } from "./matches-client"

export default function MatchesPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <MatchesClient />
      <AdSlot slot={adSlots.matches} />
    </main>
  )
}

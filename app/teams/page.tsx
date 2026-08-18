import { AdSlot } from "@/components/ad-slot"
import { TeamsDirectory } from "@/components/teams-directory"
import { adSlots } from "@/lib/ads"

export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <TeamsDirectory />
      <AdSlot slot={adSlots.teams} />
    </main>
  )
}

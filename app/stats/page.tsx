import { AdSlot } from "@/components/ad-slot"
import { StatsDashboard } from "@/components/stats-dashboard"
import { adSlots } from "@/lib/ads"

export default function StatsPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <StatsDashboard />
      <AdSlot slot={adSlots.stats} />
    </main>
  )
}

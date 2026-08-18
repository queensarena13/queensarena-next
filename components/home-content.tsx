import { AdSlot } from "@/components/ad-slot"
import { Hero } from "@/components/hero"
import { adSlots } from "@/lib/ads"

export function HomeContent() {
  return (
    <div>
      <Hero />
      <AdSlot slot={adSlots.home} compact />
    </div>
  )
}

import { AdSlot } from "@/components/ad-slot"
import { Hero } from "@/components/hero"
import { HomeTopics } from "@/components/home-topics"
import { HomeTrust } from "@/components/home-trust"
import { adSlots } from "@/lib/ads"

export function HomeContent() {
  return (
    <div>
      <Hero />
      <HomeTopics />
      <HomeTrust />
      <AdSlot slot={adSlots.home} compact />
    </div>
  )
}

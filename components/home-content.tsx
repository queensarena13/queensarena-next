import { AdSlot } from "@/components/ad-slot"
import { Hero } from "@/components/hero"
import { HomeTopics } from "@/components/home-topics"
import { HomeTrust } from "@/components/home-trust"
import { adSlots } from "@/lib/ads"

export function HomeContent() {
  return (
    <div className="relative overflow-hidden">
      <Hero />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pb-10 sm:gap-7 sm:px-6 sm:pb-14 lg:px-8">
        <HomeTopics />
        <HomeTrust />
        <AdSlot slot={adSlots.home} compact />
      </div>
    </div>
  )
}

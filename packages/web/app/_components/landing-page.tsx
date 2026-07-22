import type { Metadata } from "next"
import type { JSX } from "react"
import { ArchitectureSection } from "@/components/landing/sections/architecture"
import { CtaSection } from "@/components/landing/sections/cta"
import { EditionsSection } from "@/components/landing/sections/editions"
import { ThorSection } from "@/components/landing/sections/thor"
import { HeroSection } from "@/components/landing/sections/hero"
import { MimirHeimdallSection } from "@/components/landing/sections/mimir-heimdall"
import { ReviewsSection } from "@/components/landing/sections/reviews"
import { OdinSection } from "@/components/landing/sections/odin"
import { SubAgentsSection } from "@/components/landing/sections/sub-agents"
import { TeamModeSection } from "@/components/landing/sections/team-mode"
import { UltraworkSection } from "@/components/landing/sections/ultrawork"

export const landingMetadata: Metadata = {
  title: "Oh My OpenAgent — The Best Agent Harness",
  description:
    "Meet Odin: The batteries-included agent that codes like you. Multi-model orchestration, Team Mode, background agents, 60+ lifecycle hooks.",
}

export async function LandingPage(): Promise<JSX.Element> {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <link rel="preload" as="image" href="/images/hero.webp" fetchPriority="low" />
      <HeroSection />
      <UltraworkSection />
      <EditionsSection />
      <OdinSection />
      <MimirHeimdallSection />
      <ThorSection />
      <TeamModeSection />
      <SubAgentsSection />
      <ArchitectureSection />
      <ReviewsSection />
      <CtaSection />
    </div>
  )
}

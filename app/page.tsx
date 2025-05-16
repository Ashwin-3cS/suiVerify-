import { LandingFooter } from "@/components/landing-footer"
import { LandingHeader } from "@/components/landing-header"
import { BenefitsSection } from "@/components/benefits-section"
import { HeroSection } from "@/components/hero-section"
import { VerifiersSection } from "@/components/verifiers-section"
import { AttestationSection } from "@/components/attestation-section"
import { VerifiedIdsSection } from "@/components/verified-ids-section"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <BenefitsSection />
        <VerifiersSection />
        <AttestationSection />
        <VerifiedIdsSection />
      </main>
      <LandingFooter />
    </div>
  )
}

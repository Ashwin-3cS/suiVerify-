import type React from "react"
import { Shield, Briefcase, Award } from "lucide-react"

export function BenefitsSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">Benefits of Decentralized Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <BenefitCard
            icon={<Shield className="h-12 w-12 text-blue-600" />}
            title="Private"
            description="Your data stays with you. Share only what's needed, when needed, with zero-knowledge proofs."
          />
          <BenefitCard
            icon={<Briefcase className="h-12 w-12 text-purple-600" />}
            title="Reusable"
            description="Take your verified credentials anywhere. No more repetitive KYC processes across platforms."
          />
          <BenefitCard
            icon={<Award className="h-12 w-12 text-indigo-600" />}
            title="Trusted"
            description="Cryptographically secure. Tamper-proof verification backed by blockchain technology."
          />
        </div>
      </div>
    </section>
  )
}

interface BenefitCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

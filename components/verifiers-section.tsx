import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Film, Flag, Vote } from "lucide-react"

export function VerifiersSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">🛡️ Partnered Verifiers</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            DApps that rely on SuiVerify for identity checks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <VerifierCard
            name="SuiFlix"
            description="Requires Age Verification"
            icon={<Film className="h-10 w-10 text-blue-600" />}
          />
          <VerifierCard
            name="SuiNation"
            description="Requires Citizenship Status"
            icon={<Flag className="h-10 w-10 text-purple-600" />}
          />
          <VerifierCard
            name="DeID Voting"
            description="Requires Verified Nationality"
            icon={<Vote className="h-10 w-10 text-indigo-600" />}
          />
          <VerifierCard
            name="SuiSwap"
            description="Requires KYC Verification"
            icon={<Film className="h-10 w-10 text-blue-600" />}
          />
          <VerifierCard
            name="SuiLend"
            description="Requires Age & KYC Verification"
            icon={<Flag className="h-10 w-10 text-purple-600" />}
          />
          <VerifierCard
            name="SuiDAO"
            description="Requires Citizenship Status"
            icon={<Vote className="h-10 w-10 text-indigo-600" />}
          />
        </div>
      </div>
    </section>
  )
}

interface VerifierCardProps {
  name: string
  description: string
  icon: React.ReactNode
}

function VerifierCard({ name, description, icon }: VerifierCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-0 bg-gradient-to-br from-slate-50 to-white">
      <CardContent className="p-6 flex items-center">
        <div className="bg-slate-100 p-4 rounded-xl mr-4">{icon}</div>
        <div>
          <h3 className="text-xl font-bold">{name}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
          <Badge className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600">Sui Verified</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

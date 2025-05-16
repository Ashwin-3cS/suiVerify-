"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Flag, FileCheck } from "lucide-react"
import type { VerificationType } from "@/lib/types"

interface IdCardsProps {
  onSelect: (type: VerificationType) => void
}

export function IdCards({ onSelect }: IdCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <VerificationCard
        icon={<Calendar className="h-12 w-12 text-blue-600" />}
        title="Age Verification"
        description="Verify your age without revealing your birth date. Perfect for age-restricted services."
        onClick={() => onSelect("age")}
      />
      <VerificationCard
        icon={<Flag className="h-12 w-12 text-purple-600" />}
        title="Citizenship Status"
        description="Prove your citizenship or residency status without sharing sensitive documents."
        onClick={() => onSelect("citizenship")}
      />
      <VerificationCard
        icon={<FileCheck className="h-12 w-12 text-indigo-600" />}
        title="KYC Document Badge"
        description="Complete full KYC once and use your credential across multiple platforms."
        onClick={() => onSelect("kyc")}
      />
    </div>
  )
}

interface VerificationCardProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}

function VerificationCard({ icon, title, description, onClick }: VerificationCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-6 flex flex-col items-center text-center h-full">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6 flex-grow">{description}</p>
        <Button
          onClick={onClick}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          Verify Now
        </Button>
      </CardContent>
    </Card>
  )
}

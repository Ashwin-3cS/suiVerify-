"use client"

import { useState } from "react"
import { ProviderHeader } from "@/components/provider-header"
import { IdCards } from "@/components/id-cards"
import { VerificationModal } from "@/components/verification-modal"
import type { VerificationType } from "@/lib/types"

export default function ProviderPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVerification, setSelectedVerification] = useState<VerificationType | null>(null)
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  const handleVerificationSelect = (type: VerificationType) => {

    setSelectedVerification(type)
    setIsModalOpen(true)
  }

  const handleConnectWallet = () => {
    setIsWalletConnected(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ProviderHeader   />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-12">Choose the ID you want to verify</h1>
        <IdCards onSelect={handleVerificationSelect} />
        {isModalOpen && selectedVerification && (
          <VerificationModal type={selectedVerification} onClose={() => setIsModalOpen(false)} />
        )}
      </main>
    </div>
  )
}

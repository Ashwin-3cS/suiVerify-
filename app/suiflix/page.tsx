"use client"

import { useState } from "react"
import { SuiFlixHeader } from "@/components/suiflix/suiflix-header"
import { SuiFlixHero } from "@/components/suiflix/suiflix-hero"
import { SuiFlixContent } from "@/components/suiflix/suiflix-content"
import { VerificationModal } from "@/components/suiflix/verification-modal"

export default function SuiFlixPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleConnectWallet = () => {
    setIsWalletConnected(true)
  }

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false)
    setIsVerified(false)
  }

  const handleVerifyClick = () => {
    setIsModalOpen(true)
  }

  const handleVerificationSuccess = () => {
    setIsVerified(true)
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SuiFlixHeader
        isConnected={isWalletConnected}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
      />

      {!isVerified ? <SuiFlixHero onVerifyClick={handleVerifyClick} /> : <SuiFlixContent />}

      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  )
}

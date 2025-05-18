"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IdDetailsModal } from "@/components/id-details-modal"
import { Calendar, Flag, FileCheck, CheckCircle } from "lucide-react"
import type { VerifiedId } from "@/lib/types"

export function VerifiedIdsSection() {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [selectedId, setSelectedId] = useState<VerifiedId | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleConnectWallet = () => {
    setIsWalletConnected(true)
  }

  const handleIdClick = (id: VerifiedId) => {
    setSelectedId(id)
    setIsModalOpen(true)
  }

  // Sample verified IDs
  const verifiedIds: VerifiedId[] = [
    {
      id: "1",
      type: "Age Verification",
      icon: <Calendar className="h-10 w-10 text-blue-600" />,
      status: "Verified",
      issueDate: "2023-05-15",
      issuedBy: "SuiVerify Official",
      scope: "18+ only",
      tokenId: "0x1a2b3c4d5e6f7g8h9i0j",
    },
    {
      id: "2",
      type: "Citizenship Status",
      icon: <Flag className="h-10 w-10 text-purple-600" />,
      status: "Verified",
      issueDate: "2023-06-22",
      issuedBy: "SuiVerify Official",
      scope: "US Citizen",
      tokenId: "0x2b3c4d5e6f7g8h9i0j1a",
    },
    {
      id: "3",
      type: "KYC Document Badge",
      icon: <FileCheck className="h-10 w-10 text-indigo-600" />,
      status: "Pending",
      issueDate: "2023-07-10",
      issuedBy: "SuiVerify Official",
      scope: "Full KYC",
      tokenId: "0x3c4d5e6f7g8h9i0j1a2b",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-3">
          <h2 className="text-3xl font-bold mb-4">🪪 Your Sui IDs</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Verified credentials stored securely in your wallet
          </p>
        </div>



        {selectedId && <IdDetailsModal id={selectedId} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      </div>
    </section>
  )
}

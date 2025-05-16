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

        {!isWalletConnected ? (
          <div className="text-center">
            <p className="mb-6 text-muted-foreground">Connect your wallet to view your verified IDs</p>
            <Button
              onClick={handleConnectWallet}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {verifiedIds.map((id) => (
              <Card
                key={id.id}
                className="overflow-hidden transition-all hover:shadow-md cursor-pointer"
                onClick={() => handleIdClick(id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-slate-100 p-3 rounded-xl mr-4">{id.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold">{id.type}</h3>
                      <div className="flex items-center mt-1">
                        {id.status === "Verified" ? (
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" /> Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-600">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Scope:</span> {id.scope}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      <span className="font-medium">Token ID:</span> {id.tokenId.substring(0, 10)}...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedId && <IdDetailsModal id={selectedId} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
      </div>
    </section>
  )
}

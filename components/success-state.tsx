"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface SuccessStateProps {
  onClose: () => void
}

export function SuccessState({ onClose }: SuccessStateProps) {
  return (
    <div className="py-10 flex flex-col items-center">
      <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
      <h3 className="text-2xl font-bold mb-2">You're Verified!</h3>
      <p className="text-center text-muted-foreground mb-8">Your NFT credential has been sent to your wallet.</p>
      <Button
        onClick={onClose}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        Done
      </Button>
    </div>
  )
}

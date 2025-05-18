"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Ghost } from "lucide-react"

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function VerificationModal({ isOpen, onClose, onSuccess }: VerificationModalProps) {
  const [step, setStep] = useState<"connect" | "loading" | "success">("connect")

  useEffect(() => {
    if (step === "loading") {
      const timer = setTimeout(() => {
        setStep("success")
      }, 10000) // 10 seconds loading

      return () => clearTimeout(timer)
    }
  }, [step])

  const handleVerify = () => {
    setStep("loading")
  }

  const handleClose = () => {
    if (step !== "loading") {
      onClose()
      // Reset state when modal is closed
      setStep("connect")
    }
  }

  const handleContinue = () => {
    onSuccess()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white text-center text-xl">Verification Supported by SuiVerify</DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            {step === "connect" && "Verify your age to access age-restricted content"}
          </DialogDescription>
        </DialogHeader>

        {step === "connect" && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 mb-4 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-full animate-pulse"></div>
                <Ghost className="h-24 w-24 text-white opacity-80" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">Verify with your SoulBoundNFT</h3>
              <p className="text-gray-400 text-center max-w-xs mb-6">
                Connect your wallet to verify your age using your SoulBound NFT attestation
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handleVerify}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 px-8 py-6 h-auto text-lg"
              >
                Verify with NFT
              </Button>
            </div>
          </div>
        )}

        {step === "loading" && (
          <div className="py-10 flex flex-col items-center">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/30 to-blue-500/30 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              <Ghost
                className="absolute inset-0 h-full w-full text-white opacity-70 animate-bounce"
                style={{ animationDuration: "3s" }}
              />
            </div>

            <div className="space-y-6 w-full max-w-sm">
              <div className="h-2 bg-gray-800 rounded animate-pulse" />
              <div className="h-2 bg-gray-800 rounded animate-pulse w-5/6" />
              <div className="h-2 bg-gray-800 rounded animate-pulse w-2/3" />
            </div>

            <div className="text-center text-gray-300 mt-8">
              <p className="text-lg font-medium">Validating your Identity</p>
              <p className="text-sm mt-2 text-gray-400">Powered by SuiVerify - checking attestations</p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="py-10 flex flex-col items-center">
            <div className="relative w-32 h-32 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full"></div>
              <CheckCircle className="absolute inset-0 h-full w-full text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">You're Verified!</h3>
            <p className="text-center text-gray-400 mb-8">You are 18+</p>
            <p className="text-center text-gray-300 mb-6">Thank you for verification</p>

            <Button
              onClick={handleContinue}
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 px-8"
            >
              Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

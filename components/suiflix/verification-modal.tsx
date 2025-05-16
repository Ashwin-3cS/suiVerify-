"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Upload, X, CheckCircle } from "lucide-react"

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function VerificationModal({ isOpen, onClose, onSuccess }: VerificationModalProps) {
  const [step, setStep] = useState<"upload" | "loading" | "success">("upload")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }, [file])

  useEffect(() => {
    if (step === "loading") {
      const timer = setTimeout(() => {
        setStep("success")
      }, 10000) // 10 seconds loading

      return () => clearTimeout(timer)
    }

    if (step === "success") {
      const timer = setTimeout(() => {
        onSuccess()
      }, 3000) // Auto close after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [step, onSuccess])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (file) {
      setStep("loading")
    }
  }

  const handleClose = () => {
    if (step !== "loading") {
      onClose()
      // Reset state when modal is closed
      setStep("upload")
      setFile(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white text-center text-xl">Verification Supported by SuiVerify</DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            {step === "upload" && "Verify your age to access age-restricted content"}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="document" className="text-white">
                Upload My Proof
              </Label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-700 px-6 py-10">
                <div className="text-center">
                  {previewUrl ? (
                    <div className="relative mx-auto w-full max-w-sm">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Document preview"
                        className="mx-auto h-32 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                        onClick={() => setFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-500" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-400">
                        <label
                          htmlFor="document-upload"
                          className="relative cursor-pointer rounded-md font-semibold text-violet-400 hover:text-violet-300"
                        >
                          <span>Upload a file</span>
                          <Input
                            id="document-upload"
                            name="document"
                            type="file"
                            className="sr-only"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!file}
                className="bg-gradient-to-r from-red-600 to-violet-600 hover:from-red-700 hover:to-violet-700"
              >
                Submit for Verification
              </Button>
            </div>
          </form>
        )}

        {step === "loading" && (
          <div className="py-10 flex flex-col items-center">
            <div className="space-y-8 w-full">
              <div className="h-4 bg-gray-800 rounded animate-pulse" />
              <div className="space-y-3">
                <div className="h-3 bg-gray-800 rounded animate-pulse" />
                <div className="h-3 bg-gray-800 rounded animate-pulse w-5/6" />
                <div className="h-3 bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="h-24 bg-gray-800 rounded animate-pulse" />
              <div className="flex justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
              </div>
              <div className="text-center text-gray-400">
                <p>Verifying your document...</p>
                <p className="text-sm mt-2">This may take a few moments</p>
              </div>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="py-10 flex flex-col items-center">
            <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
            <h3 className="text-2xl font-bold mb-2 text-white">You're Verified!</h3>
            <p className="text-center text-gray-400 mb-8">You are 18+</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

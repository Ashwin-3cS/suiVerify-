"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { VerificationType } from "@/lib/types"
import { LoadingState } from "@/components/loading-state"
import { SuccessState } from "@/components/success-state"
import { Upload, X } from "lucide-react"

interface VerificationModalProps {
  type: VerificationType
  onClose: () => void
}

export function VerificationModal({ type, onClose }: VerificationModalProps) {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (file) {
      setStep("loading")
      // Simulate verification process
      setTimeout(() => {
        setStep("success")
      }, 10000) // 10 seconds loading
    }
  }

  const handleClose = () => {
    if (step === "success") {
      onClose()
    } else if (confirm("Are you sure you want to cancel the verification process?")) {
      onClose()
    }
  }

  const getTitle = () => {
    switch (type) {
      case "age":
        return "Age Verification"
      case "citizenship":
        return "Citizenship Status"
      case "kyc":
        return "KYC Document Badge"
    }
  }

  const getDescription = () => {
    switch (type) {
      case "age":
        return "Please upload a government-issued ID that shows your date of birth."
      case "citizenship":
        return "Please upload a document that proves your citizenship or residency status."
      case "kyc":
        return "Please upload your identification documents for KYC verification."
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{step === "upload" && getDescription()}</DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="document">Upload Document</Label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
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
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => setFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                        <label
                          htmlFor="document-upload"
                          className="relative cursor-pointer rounded-md bg-background font-semibold text-primary hover:text-primary/80"
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
                      <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!file}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Submit for Verification
              </Button>
            </div>
          </form>
        )}

        {step === "loading" && <LoadingState />}

        {step === "success" && <SuccessState onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

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
import { Upload, X, AlertCircle } from "lucide-react"
import { useWallet } from '@suiet/wallet-kit'
import axios from 'axios'

interface VerificationModalProps {
  type: VerificationType
  onClose: () => void
}

// API endpoint configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_ENDPOINT = `${API_BASE_URL}/api/encrypt-upload`;

export function VerificationModal({ type, onClose }: VerificationModalProps) {
  const [step, setStep] = useState<"upload" | "loading" | "success" | "error">("upload")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transactionDetails, setTransactionDetails] = useState<any>(null)

  const wallet = useWallet();
  const userAddress = wallet.account?.address;
  console.log('connected account info', userAddress)

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
      setError(null) // Clear any previous errors
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userAddress) {
      setError("Wallet not connected. Please connect your wallet first.")
      return
    }
    
    setStep("loading")
    
    try {
      // Create form data for the API request
      const formData = new FormData()
      formData.append('userAddress', userAddress)
      
      if (file) {
        formData.append('file', file)
      }
      
      console.log('Sending request to:', API_ENDPOINT);
      console.log('With user address:', userAddress);
      console.log('And file:', file ? file.name : 'No file');
      
      // Make the API request
      const response = await axios.post(API_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      console.log('API Response:', response.data)
      
      if (response.data.success) {
        // Store transaction details for display in success state
        setTransactionDetails(response.data.data)
        setStep("success")
      } else {
        setError(response.data.message || 'Verification failed')
        setStep("error")
      }
    } catch (err: any) {
      console.error('Error during verification:', err)
      
      // Enhanced error handling
      let errorMessage = 'An unknown error occurred';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        if (err.response.status === 404) {
          errorMessage = 'API endpoint not found. Please check server configuration.';
        } else {
          errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Error request:', err.request);
        errorMessage = 'No response from server. Please check your network connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = err.message || 'Error setting up request';
      }
      
      setError(errorMessage);
      setStep("error")
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="grid w-full gap-1.5">
              <Label htmlFor="wallet-address">Wallet Address</Label>
              <Input
                id="wallet-address"
                value={userAddress || "Wallet not connected"}
                disabled
                className="font-mono text-sm"
              />
            </div>
            
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
                disabled={!userAddress}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Submit for Verification
              </Button>
            </div>
          </form>
        )}

        {step === "loading" && <LoadingState />}

        {step === "error" && (
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-center">
              <div className="bg-red-100 rounded-full p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-center">Verification Failed</h3>
            <p className="text-center text-muted-foreground">{error}</p>
            <div className="flex justify-center">
              <Button onClick={() => setStep("upload")} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <SuccessState 
            onClose={onClose} 
            message="Your SoulBound NFT credential has been sent to your wallet!"
            transactionDetails={transactionDetails}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
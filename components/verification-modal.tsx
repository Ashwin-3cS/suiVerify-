
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
// Import Transaction from the correct package to match the wallet's expected type
import { Transaction } from "@mysten/sui/transactions"

interface VerificationModalProps {
  type: VerificationType
  onClose: () => void
}

// API endpoint configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_ENDPOINT = `${API_BASE_URL}/api/encrypt-upload`;
const DID_API_ENDPOINT = `${API_BASE_URL}/api/did/create`;

// Package ID for the DID module
const DID_PACKAGE_ID = process.env.NEXT_PUBLIC_DID_PACKAGE_ID || '0x0c455043782c532f56972ad562a2638a8ce59855d451c583c283f8c33e8f7059'; // Replace with your actual package ID

export function VerificationModal({ type, onClose }: VerificationModalProps) {
  const [step, setStep] = useState<"upload" | "loading" | "success" | "claiming" | "claimed" | "error">("upload")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transactionDetails, setTransactionDetails] = useState<any>(null)
  const [didTransactionDetails, setDidTransactionDetails] = useState<any>(null)
  const encoder = new TextEncoder();

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


const buildAndSignTransaction = async () => {
  if (!userAddress) {
    throw new Error("Wallet not connected");
  }

  if (!transactionDetails) {
    throw new Error("Transaction details not available");
  }

  try {
    // Create a new transaction
    const tx = new Transaction();
    
    // Extract required data from transaction details
    const encryptionId = transactionDetails.file?.encryptionId || '';
    const blobId = transactionDetails.storage?.blobId || '';
    const name = "SuiVerify ID";
    const description = "Use this ID within the verifier SuiVerifiers across the ecosystem";
    
    // Extract the whitelist object ID from the transaction details
    const wlObjectId = transactionDetails.whitelist?.whitelistId || 
                       transactionDetails.file?.whitelistId || 
                       transactionDetails.storage?.whitelistId;
    
    if (!wlObjectId) {
      throw new Error("Whitelist object ID not found in transaction details");
    }
    
    console.log('Using values:', {
      wlObjectId,
      encryptionId,
      blobId,
      name,
      description
    });
    
    // Convert strings to Uint8Array for proper BCS encoding
    const encryptionIdBytes = Array.from(new TextEncoder().encode(encryptionId));
    const blobIdBytes = Array.from(new TextEncoder().encode(blobId));
    const nameBytes = Array.from(new TextEncoder().encode(name));
    const descriptionBytes = Array.from(new TextEncoder().encode(description));
    
    // Add a move call to create a DID
    tx.moveCall({
      target: `${DID_PACKAGE_ID}::did_whitelist_contract::create_did_entry`,
      arguments: [
        tx.object(wlObjectId), // wl: &mut Whitelist
        tx.pure.vector('u8', encryptionIdBytes), // encryption_id: vector<u8>
        tx.pure.vector('u8', blobIdBytes),       // blob_id: vector<u8>
        tx.pure.vector('u8', nameBytes),         // name: vector<u8>
        tx.pure.vector('u8', descriptionBytes),  // description: vector<u8>
        // ctx is handled automatically
      ],
    });

    console.log('Transaction built:', tx);

    // Sign the transaction using the wallet
    // This only signs the transaction but doesn't execute it
    const signedTx = await wallet.signTransaction({
      transaction: tx,
    });

    console.log('Signed transaction:', signedTx);

    // Extract the transaction bytes and signature
    // The structure may vary depending on the wallet implementation
    // For Suiet wallet, we need to handle its specific response format
    
    // Convert the transaction bytes to base64 if needed
    let txBytes = '';
    if (signedTx.bytes) {
      // If bytes is already a string, use it directly
      txBytes = typeof signedTx.bytes === 'string' 
        ? signedTx.bytes 
        : Buffer.from(signedTx.bytes).toString('base64');
    } else if (signedTx.bytes) {
      // Some wallets use txBytes instead of bytes
      txBytes = typeof signedTx.bytes === 'string'
        ? signedTx.bytes
        : Buffer.from(signedTx.bytes).toString('base64');
    } else {
      throw new Error("Could not extract transaction bytes from wallet response");
    }

    // Extract the signature
    const signature = signedTx.signature || '';

    return {
      txBytes,
      signature,
    };
  } catch (err: any) {
    console.error('Error building or signing transaction:', err);
    throw new Error(err.message || 'Failed to build or sign transaction');
  }
};

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

const handleClaimNFT = async () => {
  if (!userAddress) {
    setError("Wallet not connected. Please connect your wallet first.")
    return
  }
  
  setStep("claiming")
  
  try {
    console.log('Building and signing transaction for DID creation');
    
    // Build and sign the transaction
    const signedTx = await buildAndSignTransaction();
    
    console.log('Sending transaction to backend:', DID_API_ENDPOINT);
    console.log('Transaction data:', signedTx);
    
    // Send the signed transaction to the backend for execution
    const response = await axios.post(DID_API_ENDPOINT, signedTx, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('DID API Response:', response.data);
    
    if (response.data.success) {
      // Create a structured transaction details object that includes the digest
      const didTransactionDetails = {
        did: {
          transactionDigest: response.data.suiResponse?.digest,
          confirmedLocalExecution: response.data.suiResponse?.confirmedLocalExecution
        },
        // Include original transaction details if needed
        ...transactionDetails,
        // Add timestamp if not already present
        timestamp: transactionDetails?.timestamp || new Date().toISOString()
      };
      
      setDidTransactionDetails(didTransactionDetails);
      setStep("claimed");
    } else {
      setError(response.data.message || 'DID creation failed');
      setStep("error");
    }
  } catch (err: any) {
    console.error('Error during NFT claiming:', err);
    
    let errorMessage = 'An unknown error occurred';
    
    if (err.response) {
      console.error('Error response data:', err.response.data);
      console.error('Error response status:', err.response.status);
      
      if (err.response.status === 404) {
        errorMessage = 'API endpoint not found. Please check server configuration.';
      } else {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      }
    } else if (err.request) {
      console.error('Error request:', err.request);
      errorMessage = 'No response from server. Please check your network connection.';
    } else {
      errorMessage = err.message || 'Error setting up request';
    }
    
    setError(errorMessage);
    setStep("error");
  }
}

  const handleClose = () => {
    if (step === "claimed") {
      onClose()
    } else if (step === "success") {
      if (confirm("Are you sure you want to close without claiming your NFT?")) {
        onClose()
      }
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

        {step === "claiming" && (
          <div className="py-10 flex flex-col items-center">
            <div className="flex justify-center">
              <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            </div>
            <p className="mt-4 text-center text-muted-foreground">
              Creating your NFT credential...
            </p>
            <p className="text-sm mt-2 text-center text-muted-foreground">
              Please wait while we process your transaction
            </p>
          </div>
        )}

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
          <div className="py-10 flex flex-col items-center">
            <div className="mb-6 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">You're Verified!</h3>
            <p className="text-center text-muted-foreground mb-6">
              Your document has been successfully verified.
            </p>
            
            {transactionDetails && (
              <div className="w-full mb-6">
                <div className="bg-gray-50 p-4 rounded-md mb-6 text-sm">
                  <h4 className="font-medium mb-2">Verification Details</h4>
                  <div className="space-y-2">
                    {transactionDetails.whitelist && (
                      <p className="text-xs font-mono break-all">
                        <span className="font-medium">Transaction: </span>
                        {transactionDetails.whitelist.transactionDigest}
                      </p>
                    )}
                    {transactionDetails.timestamp && (
                      <p className="text-xs text-gray-500">
                        Timestamp: {new Date(transactionDetails.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <Button
              onClick={handleClaimNFT}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mb-3"
            >
              Claim Your NFT
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
            >
              Close
            </Button>
          </div>
        )}

        {step === "claimed" && (
          <SuccessState 
            onClose={onClose} 
            message="Your SoulBound NFT credential has been sent to your wallet!"
            transactionDetails={didTransactionDetails}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface SuccessStateProps {
  onClose: () => void
  message?: string
  transactionDetails?: any
}

export function SuccessState({ onClose, message, transactionDetails }: SuccessStateProps) {
  return (
    <div className="py-10 flex flex-col items-center">
      <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
      <h3 className="text-2xl font-bold mb-2">You're Verified!</h3>
      <p className="text-center text-muted-foreground mb-4">
        {message || "Your NFT credential has been sent to your wallet."}
      </p>
      
      {transactionDetails && (
        <Accordion type="single" collapsible className="w-full mb-6">
          <AccordionItem value="transaction-details">
            <AccordionTrigger className="text-sm">View Transaction Details</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm space-y-3 bg-gray-50 p-3 rounded-md overflow-auto max-h-60">
                {/* DID Transaction Details */}
                {transactionDetails.did && (
                  <div className="space-y-1">
                    <h4 className="font-medium">DID Transaction Information</h4>
                    <p className="text-xs font-mono break-all">
                      <span className="font-medium">Transaction Digest: </span>
                      <a 
                        href={`https://suiscan.xyz/testnet/tx/${transactionDetails.did.transactionDigest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center"
                      >
                        {transactionDetails.did.transactionDigest}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </p>
                  </div>
                )}
                                              
                {transactionDetails.storage && (
                  <div className="space-y-1">
                    <h4 className="font-medium">Storage Information</h4>
                    <p className="text-xs">
                      <span className="font-medium">Status: </span>
                      {transactionDetails.storage.status}
                    </p>
                    
                    {transactionDetails.storage.blobId && (
                      <p className="text-xs font-mono break-all">
                        <span className="font-medium">Blob ID: </span>
                        {transactionDetails.storage.blobId}
                      </p>
                    )}
                    
                  </div>
                )}
                
                {transactionDetails.timestamp && (
                  <p className="text-xs text-gray-500">
                    Timestamp: {new Date(transactionDetails.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      
      <Button
        onClick={onClose}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        Done
      </Button>
    </div>
  )
}
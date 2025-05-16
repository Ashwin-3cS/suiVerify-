import type React from "react"
export type VerificationType = "age" | "citizenship" | "kyc"

export interface VerifiedId {
  id: string
  type: string
  icon: React.ReactNode
  status: "Verified" | "Pending"
  issueDate: string
  issuedBy: string
  scope: string
  tokenId: string
}

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

interface ProviderHeaderProps {
  isConnected: boolean
  onConnectWallet: () => void
}

export function ProviderHeader({ isConnected, onConnectWallet }: ProviderHeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SuiVerify
          </span>
        </Link>
        <Button
          onClick={onConnectWallet}
          className={
            isConnected
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          }
        >
          <Wallet className="mr-2 h-4 w-4" />
          {isConnected ? "Connected" : "Connect Wallet"}
        </Button>
      </div>
    </header>
  )
}

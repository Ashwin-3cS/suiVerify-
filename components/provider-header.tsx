"use client"

import Link from "next/link"
import { ConnectButton, useWallet } from "@suiet/wallet-kit"

export function ProviderHeader() {
  const { connected, account } = useWallet()
  
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SuiVerify
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {connected && account && (
            <div className="hidden md:flex items-center text-sm">
              <span className="font-medium">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </span>
            </div>
          )}
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
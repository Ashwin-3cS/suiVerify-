"use client"

import Link from "next/link"
import { ConnectButton } from '@mysten/dapp-kit';

export function ProviderHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SuiVerify
          </span>
        </Link>
        
        <ConnectButton />
      </div>
    </header>
  )
}
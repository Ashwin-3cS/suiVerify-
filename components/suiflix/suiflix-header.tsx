"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { ConnectButton } from "@suiet/wallet-kit"

interface SuiFlixHeaderProps {
  isConnected: boolean
  onConnect: () => void
  onDisconnect: () => void
}

export function SuiFlixHeader({ isConnected, onConnect, onDisconnect }: SuiFlixHeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-black/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/suiflix" className="flex items-center space-x-2">
          <span className="font-bold text-2xl bg-gradient-to-r from-red-600 to-violet-600 bg-clip-text text-transparent">
            SuiFlix
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {isConnected ? (
            <>
              <div className="text-sm text-gray-400">
                <span className="px-3 py-1 rounded-full bg-gray-800">0x7a6b...3f9d</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onDisconnect} className="text-gray-400 hover:text-white">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Disconnect Wallet</span>
              </Button>
            </>
          ) : (
            <ConnectButton/>
          )}
        </div>
      </div>
    </header>
  )
}

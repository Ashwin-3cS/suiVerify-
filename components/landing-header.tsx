import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingHeader() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SuiVerify
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/provider">
            <Button variant="ghost">Providers</Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost">About</Button>
          </Link>
          <Link href="/provider">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Get Your ID
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

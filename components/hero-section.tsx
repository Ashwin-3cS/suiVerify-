import Link from "next/link"
import { Button } from "@/components/ui/button"
import { IdentityShapes } from "@/components/identity-shapes"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <IdentityShapes />
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          <span className="block">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SuiVerify
            </span>
          </span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground md:text-2xl">
          Decentralized Identity. Verified on Sui.
        </p>
        <Link href="/provider">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Get Your ID
          </Button>
        </Link>
      </div>
    </section>
  )
}

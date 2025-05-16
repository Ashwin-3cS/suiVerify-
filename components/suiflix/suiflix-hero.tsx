"use client"

import { Button } from "@/components/ui/button"

interface SuiFlixHeroProps {
  onVerifyClick: () => void
}

export function SuiFlixHero({ onVerifyClick }: SuiFlixHeroProps) {
  return (
    <section className="relative py-32 md:py-48">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-violet-900 opacity-90"></div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
          <span className="block text-white">SuiFlix – Age-Gated Streaming</span>
          <span className="block mt-2 bg-gradient-to-r from-red-500 to-violet-500 bg-clip-text text-transparent">
            Powered by SuiVerify
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-300">
          Verify your age once, access content everywhere. No personal data stored.
        </p>

        <Button
          size="lg"
          onClick={onVerifyClick}
          className="bg-gradient-to-r from-red-600 to-violet-600 hover:from-red-700 hover:to-violet-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Verify Myself
        </Button>
      </div>
    </section>
  )
}

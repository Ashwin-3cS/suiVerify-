import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

// This must be in a server component (no 'use client' directive)
export const metadata = {
  title: "SuiVerify - Decentralized Identity. Verified on Sui.",
  description: "Secure, private, and portable identity verification on the Sui blockchain.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
import Link from "next/link"
import { Twitter, Github, Linkedin } from "lucide-react"

export function LandingFooter() {
  return (
    <footer className="border-t py-12 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SuiVerify
              </span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">Decentralized Identity. Verified on Sui.</p>
          </div>
          <div className="flex space-x-6">
            <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="h-5 w-5" />
              <span className="sr-only">LinkedIn</span>
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SuiVerify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

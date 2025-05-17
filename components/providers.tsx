
'use client'

import React from 'react'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
// import { ThemeProvider } from "@/components/theme-provider"
// import { networkConfig } from '@/hooks/netWorkConfig'
import {
  WalletProvider,
  Chain
} from "@suiet/wallet-kit";// Import the wallet kit styles
import "@suiet/wallet-kit/style.css";




// const customChain: Chain = {
//   id: "testnet",
//   name: "Testnet",
//   rpcUrl: "https://fullnode.testnet.sui.io:443",
// };


export function Providers({ children }: { children: React.ReactNode }) {
  // Create a client
  // const [queryClient] = React.useState(() => new QueryClient())

  return (
    // <QueryClientProvider client={queryClient}>
    //   <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
    //     <WalletProvider autoConnect>
    //       <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
    //         {children}
    //       </ThemeProvider>
    //     </WalletProvider>
    //   </SuiClientProvider>
    // </QueryClientProvider>
    <WalletProvider autoConnect> 
      {children}
    </WalletProvider>
    
  )
}

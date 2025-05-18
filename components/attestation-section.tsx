"use client"

export function AttestationSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">🌱 How We Do Attestation</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">How SuiVerify Builds Trust</p>
        </div>

        <div className="flex justify-center">
          <div className="relative w-full max-w-4xl">
            {/* Central vertical line */}
            <div className="absolute left-1/2 top-[10%] bottom-[10%] w-1 bg-purple-500 transform -translate-x-1/2"></div>

            {/* Step 1: User submits document */}
            <div className="flex justify-end mb-24 relative">
              <div className="w-1/2 pr-12">{/* Empty space on left side */}</div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-purple-500"></div>
                <div className="absolute top-0 left-3 w-[150px] h-1 bg-purple-500"></div>
              </div>
              <div className="w-1/2 pl-40">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg">User submits document</h3>
                  <p className="text-sm text-muted-foreground">Securely upload your ID document</p>
                </div>
              </div>
            </div>

            {/* Step 2: Provider verifies */}
            <div className="flex justify-start mb-24 relative">
              <div className="w-1/2 pr-40">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg">Provider verifies</h3>
                  <p className="text-sm text-muted-foreground">Webcam verification with encryption</p>
                </div>
              </div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-purple-500"></div>
                <div className="absolute top-0 right-3 w-[150px] h-1 bg-purple-500"></div>
              </div>
              <div className="w-1/2 pl-12">{/* Empty space on right side */}</div>
            </div>

            {/* Step 3: Data encrypted */}
            <div className="flex justify-end mb-24 relative">
              <div className="w-1/2 pr-12">{/* Empty space on left side */}</div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-purple-500"></div>
                <div className="absolute top-0 left-3 w-[150px] h-1 bg-purple-500"></div>
              </div>
              <div className="w-1/2 pl-40">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg">Data encrypted & stored after verification</h3>
                  <p className="text-sm text-muted-foreground">Using Seal & Walrus protocols</p>
                </div>
              </div>
            </div>

            {/* Step 4: NFT ID issued */}
            <div className="flex justify-start mb-24 relative">
              <div className="w-1/2 pr-40">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg">NFT ID issued</h3>
                  <p className="text-sm text-muted-foreground">Credential sent to your wallet</p>
                </div>
              </div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-purple-500"></div>
                <div className="absolute top-0 right-3 w-[150px] h-1 bg-purple-500"></div>
              </div>
              <div className="w-1/2 pl-12">{/* Empty space on right side */}</div>
            </div>

            {/* Step 5: Verifier checks */}
            <div className="flex justify-end relative">
              <div className="w-1/2 pr-12">{/* Empty space on left side */}</div>
              <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-purple-500"></div>
                <div className="absolute top-0 left-3 w-[150px] h-1 bg-purple-500"></div>
              </div>
              <div className="w-1/2 pl-40">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg">Verifier checks</h3>
                  <p className="text-sm text-muted-foreground">Only metadata, never raw data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

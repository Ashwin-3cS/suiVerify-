export function LoadingState() {
  return (
    <div className="py-10 flex flex-col items-center">
      <div className="space-y-8 w-full">
        <div className="h-4 bg-slate-200 rounded animate-pulse" />
        <div className="space-y-3">
          <div className="h-3 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 bg-slate-200 rounded animate-pulse w-5/6" />
          <div className="h-3 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="h-24 bg-slate-200 rounded animate-pulse" />
        <div className="flex justify-center">
          <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <div className="text-center text-muted-foreground">
          <p>Verifying your document...</p>
          <p className="text-sm mt-2">This may take a few moments</p>
        </div>
      </div>
    </div>
  )
}

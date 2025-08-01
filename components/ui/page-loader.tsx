import { Loader2 } from 'lucide-react'

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-teal-600 dark:text-teal-400" />
        <p className="text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-border-subtle bg-surface-primary px-4 py-3 text-sm text-text-primary ring-offset-background placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-border-default resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }

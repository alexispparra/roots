
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, children, ...props },
    ref
  ) => (
    <div className={cn("relative my-4", orientation === "vertical" ? "w-px h-full" : "h-px w-full")}>
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          "shrink-0 bg-border",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        {...props}
      />
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
            {children}
        </div>
      )}
    </div>
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }

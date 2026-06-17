"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// ⚡ Bolt Optimization: Hoist static toastOptions
// Why: The Toaster component wraps the entire app layout and may re-render
// frequently. By moving the static toastOptions object outside the component,
// we prevent it from being unnecessarily re-allocated on every render,
// reducing garbage collection overhead and preventing unnecessary
// re-renders of the underlying Sonner toaster component.
const defaultToastOptions = {
  classNames: {
    toast:
      "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
    description: "group-[.toast]:text-muted-foreground",
    actionButton:
      "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
    cancelButton:
      "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
  },
}

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={defaultToastOptions}
      {...props}
    />
  )
}

export { Toaster }

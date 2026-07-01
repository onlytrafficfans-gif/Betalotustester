import * as React from "react"
import { cn } from "@/lib/utils"

interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function InputGroup({ className, children, ...props }: InputGroupProps) {
  return (
    <div
      className={cn(
        "flex rounded-md shadow-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface InputGroupTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function InputGroupText({ className, children, ...props }: InputGroupTextProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border border-input bg-muted px-3 text-sm text-muted-foreground first:rounded-l-md last:rounded-r-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface InputGroupButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "ghost"
}

function InputGroupButton({
  className,
  children,
  variant = "default",
  ...props
}: InputGroupButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center border border-input bg-background px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground first:rounded-l-md last:rounded-r-md",
        variant === "ghost" && "border-transparent bg-transparent",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { InputGroup, InputGroupText, InputGroupButton }

/**
 * Item Components
 * 
 * Provides consistent list item layouts with icon, label, description,
 * and action support. Similar to how settings items are commonly displayed.
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  label: string
  description?: string
  action?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
}

function Item({
  icon,
  label,
  description,
  action,
  onClick,
  disabled,
  destructive,
  className,
  ...props
}: ItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3",
        onClick && !disabled && "cursor-pointer hover:bg-accent",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      {icon && (
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted",
          destructive && "bg-destructive/10 text-destructive"
        )}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium",
          destructive && "text-destructive"
        )}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        )}
      </div>
      {action}
      {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
    </div>
  )
}

interface ItemGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  title?: string
}

function ItemGroup({ title, children, className, ...props }: ItemGroupProps) {
  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", className)} {...props}>
      {title && (
        <div className="px-4 py-2 bg-muted/50">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
        </div>
      )}
      <div className="divide-y divide-border">{children}</div>
    </div>
  )
}

export { Item, ItemGroup }

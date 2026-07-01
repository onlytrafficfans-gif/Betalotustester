import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

const buttonGroupVariants = cva("inline-flex", {
  variants: {
    variant: {
      default: "rounded-md",
      outline: "rounded-md border border-input bg-transparent",
      ghost: "",
    },
    size: {
      default: "",
      sm: "h-8",
      lg: "h-11",
      icon: "h-9 w-9",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {}

function ButtonGroup({ className, variant, size, ...props }: ButtonGroupProps) {
  return (
    <div
      className={cn(buttonGroupVariants({ variant, size }), className)}
      role="group"
      {...props}
    />
  )
}

const buttonGroupItemVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 data-[active=true]:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 data-[active=true]:bg-secondary/80",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
        ghost:
          "hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-8",
        icon: "h-9 w-9",
      },
      position: {
        default: "",
        first: "rounded-l-md",
        last: "rounded-r-md",
        middle: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      position: "default",
    },
  }
)

interface ButtonGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonGroupItemVariants> {
  asChild?: boolean
  isActive?: boolean
}

const ButtonGroupItem = React.forwardRef<HTMLButtonElement, ButtonGroupItemProps>(
  ({ className, variant, size, position, asChild = false, isActive = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          buttonGroupItemVariants({ variant, size, position }),
          "-ml-[1px] first:ml-0",
          className
        )}
        ref={ref}
        data-active={isActive}
        {...props}
      />
    )
  }
)
ButtonGroupItem.displayName = "ButtonGroupItem"

export { ButtonGroup, ButtonGroupItem, buttonGroupVariants, buttonGroupItemVariants }

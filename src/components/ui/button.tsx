import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed cursor-pointer hover:translate-y-[-1px] active:translate-y-0",
  {
    variants: {
      variant: {
        default: "bg-royal-blue-700 text-white hover:bg-royal-blue-600 active:bg-royal-blue-500 shadow-sm hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline:
          "border-2 border-royal-blue-700 bg-background text-royal-blue-800 hover:bg-royal-blue-50 hover:border-royal-blue-600 active:bg-royal-blue-100",
        secondary:
          "bg-polynesian-blue-700 text-white hover:bg-polynesian-blue-600 active:bg-polynesian-blue-500 shadow-sm hover:shadow-md",
        ghost: "text-royal-blue-800 hover:bg-royal-blue-50 hover:text-royal-blue-700 active:bg-royal-blue-100",
        link: "text-royal-blue-700 underline-offset-4 hover:underline hover:text-royal-blue-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
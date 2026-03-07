import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffdb57] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-[#0a1840] to-[#11296b] text-white border-2 border-white/80 hover:border-[#ffdb57] hover:shadow-[0_0_20px_rgba(255,219,87,0.4)] shadow-[0_4px_12px_rgba(10,24,64,0.3)] hover:shadow-[0_6px_20px_rgba(255,219,87,0.3)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        destructive:
          "bg-gradient-to-br from-red-600 to-red-700 text-white border-2 border-white/80 hover:border-[#ffdb57] hover:shadow-[0_0_20px_rgba(255,219,87,0.4)] shadow-[0_4px_12px_rgba(220,38,38,0.3)]",
        outline:
          "bg-transparent text-foreground border-2 border-white/60 hover:border-[#ffdb57] hover:bg-[#0a1840]/10 hover:shadow-[0_0_15px_rgba(255,219,87,0.3)]",
        secondary:
          "bg-gradient-to-br from-[#00509d] to-[#00417e] text-white border-2 border-white/80 hover:border-[#ffdb57] hover:shadow-[0_0_20px_rgba(255,219,87,0.4)] shadow-[0_4px_12px_rgba(0,80,157,0.3)]",
        ghost: "hover:bg-accent hover:text-accent-foreground border-2 border-transparent",
        link: "text-primary underline-offset-4 hover:underline border-2 border-transparent",
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
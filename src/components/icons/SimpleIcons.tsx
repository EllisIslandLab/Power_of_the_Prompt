import { cn } from "@/lib/utils"

interface IconProps {
  className?: string
  size?: number
}

/**
 * Semantic Icon System
 *
 * Each icon has specific meaning:
 * - CheckIcon: Independent, confirmed, completed features
 * - DollarIcon: Cost-effective, pricing, value
 * - LightningIcon: Speed, performance, AI features
 *
 * All icons have a yellow glow (#ffdb57) for consistency
 */

// Check icon - represents independence, confirmation, completion
export function CheckIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-[#ffdb57] drop-shadow-[0_0_8px_rgba(255,219,87,0.6)]", className)}
      aria-hidden="true"
    >
      <path
        d="M13.5 4.5L6 12L2.5 8.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Dollar icon - represents cost-effectiveness, value, pricing
export function DollarIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-[#ffdb57] drop-shadow-[0_0_8px_rgba(255,219,87,0.6)]", className)}
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 3.5V4.5M8 11.5V12.5M5.5 6C5.5 5.17157 6.17157 4.5 7 4.5H9C9.82843 4.5 10.5 5.17157 10.5 6C10.5 6.82843 9.82843 7.5 9 7.5H7C6.17157 7.5 5.5 8.17157 5.5 9C5.5 9.82843 6.17157 10.5 7 10.5H9C9.82843 10.5 10.5 9.82843 10.5 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Lightning icon - represents speed, performance, AI features
export function LightningIcon({ className, size = 20 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-[#ffdb57] drop-shadow-[0_0_8px_rgba(255,219,87,0.6)]", className)}
      aria-hidden="true"
    >
      <path
        d="M8.5 1.5L3 9H8L7.5 14.5L13 7H8L8.5 1.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Export all icons together for convenience
export const SimpleIcons = {
  Check: CheckIcon,
  Dollar: DollarIcon,
  Lightning: LightningIcon,
}

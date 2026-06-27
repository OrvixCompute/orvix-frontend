import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  // Used sparingly — one per view max.
  primary: "bg-accent text-white hover:bg-accent-hover",
  // Default for most actions.
  secondary: "border border-border-strong text-text-primary hover:bg-bg-secondary",
  // Nav and minor links.
  ghost: "text-text-secondary hover:text-text-primary",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium",
          "transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-border-strong",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

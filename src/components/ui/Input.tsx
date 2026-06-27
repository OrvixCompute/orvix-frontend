import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm",
          "text-text-primary placeholder:text-text-tertiary",
          "focus:border-accent focus:outline-none",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

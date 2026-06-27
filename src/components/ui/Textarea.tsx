import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full resize-y rounded-md border border-border bg-bg-secondary px-3 py-2 text-sm",
        "text-text-primary placeholder:text-text-tertiary",
        "focus:border-accent focus:outline-none",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

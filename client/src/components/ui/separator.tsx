import { forwardRef, type HTMLAttributes } from "react";

export const Separator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`h-px w-full bg-[var(--border)] ${className}`}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

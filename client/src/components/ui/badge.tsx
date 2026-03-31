import { forwardRef, type HTMLAttributes } from "react";

export const Badge = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-md bg-[var(--accent)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text)] ${className}`}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

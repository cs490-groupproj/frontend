import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Loading indicator (shadcn-style: Lucide icon + Tailwind animate-spin).
 */
function Spinner({ className, ...props }) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      className={cn("size-6 animate-spin text-primary", className)}
      {...props}
    />
  );
}

export { Spinner };

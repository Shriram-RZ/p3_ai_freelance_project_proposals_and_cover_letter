import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-brand-500/15 text-brand-300 border border-brand-400/30",
        secondary: "bg-white/5 text-white/70 border border-white/10",
        success: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30",
        warning: "bg-amber-500/15 text-amber-300 border border-amber-400/30",
        danger: "bg-red-500/15 text-red-300 border border-red-400/30",
        outline: "border border-white/15 text-white/70",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

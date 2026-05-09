"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        default:
          "btn-shimmer relative bg-gradient-to-b from-brand-500 to-brand-700 text-white shadow-[0_8px_24px_-8px_rgba(99,102,241,0.6)] hover:shadow-[0_12px_30px_-6px_rgba(99,102,241,0.7)] hover:-translate-y-px active:translate-y-0",
        secondary:
          "bg-white/5 text-white/90 border border-white/10 hover:bg-white/10 hover:border-white/20",
        ghost: "text-white/70 hover:bg-white/5 hover:text-white",
        outline:
          "border border-white/10 bg-transparent text-white/90 hover:bg-white/5 hover:border-white/20",
        destructive:
          "bg-red-500/90 text-white hover:bg-red-500 shadow-[0_8px_24px_-8px_rgba(239,68,68,0.5)]",
        link: "text-brand-300 underline-offset-4 hover:underline",
        glow: "btn-shimmer bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500 bg-[length:200%_100%] text-white animate-gradient-shift glow-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="thinking-dot" />
            <span className="thinking-dot" />
            <span className="thinking-dot" />
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

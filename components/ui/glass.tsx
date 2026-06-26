"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type HTMLAttributes } from "react";

/**
 * Reusable glassmorphism surface. Replaces the repeated
 * `bg-white/5 backdrop-blur-xl border border-white/10` pattern.
 */
export const GlassPanel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { hover?: boolean }>(
    ({ className, hover = false, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-3xl border border-black/5 dark:border-white/10",
                "bg-white/60 dark:bg-white/[0.04] backdrop-blur-xl",
                "shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
                hover &&
                    "transition-all duration-300 hover:border-brand/40 hover:bg-white/80 dark:hover:bg-white/[0.07] hover:shadow-[0_12px_48px_rgba(168,85,247,0.18)]",
                className,
            )}
            {...props}
        />
    ),
);
GlassPanel.displayName = "GlassPanel";

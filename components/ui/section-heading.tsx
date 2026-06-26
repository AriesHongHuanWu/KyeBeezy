"use client";

import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import type { ReactNode } from "react";

/**
 * Standard section heading: small uppercase eyebrow + big display title with a
 * brand-gradient accent word. Keeps typography consistent across sections.
 */
export function SectionHeading({
    eyebrow,
    title,
    accent,
    align = "left",
    className,
    children,
}: {
    eyebrow?: string;
    title: ReactNode;
    accent?: string;
    align?: "left" | "center";
    className?: string;
    children?: ReactNode;
}) {
    return (
        <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
            {eyebrow && (
                <div
                    className={cn(
                        "inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full text-xs font-bold uppercase tracking-[0.2em]",
                        "bg-brand/10 text-brand border border-brand/20 backdrop-blur-md",
                    )}
                >
                    <span className="size-1.5 rounded-full bg-brand animate-pulse" />
                    {eyebrow}
                </div>
            )}
            <h2 className="text-4xl md:text-6xl font-black font-outfit tracking-tighter text-foreground leading-[0.95]">
                {title} {accent && <span className="text-gradient-brand">{accent}</span>}
            </h2>
            {children && <div className="mt-5 text-lg text-muted-foreground font-light">{children}</div>}
        </Reveal>
    );
}

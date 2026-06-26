"use client";

import { motion } from "framer-motion";
import { Mic2, Music4, Briefcase, CalendarDays, Repeat, Sparkles, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { COLLAB_TYPES } from "@/lib/site";
import { staggerContainer, staggerItem } from "@/components/ui/reveal";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

/** Maps the COLLAB_TYPES[].icon string to the actual lucide component. */
const ICONS: Record<string, LucideIcon> = {
    Mic2,
    Music4,
    Briefcase,
    CalendarDays,
    Repeat,
    Sparkles,
};

export interface CollabTypeGridProps {
    /** Currently selected COLLAB_TYPES id, or null when nothing chosen yet. */
    value: string | null;
    /** Called with the chosen COLLAB_TYPES id. */
    onChange: (id: string) => void;
    className?: string;
    /** Optional id used to wire up an aria-label / error association. */
    id?: string;
}

/**
 * Selectable grid of collaboration types rendered as glass cards.
 * Controlled via { value, onChange }. Behaves as a radiogroup.
 */
export function CollabTypeGrid({ value, onChange, className, id }: CollabTypeGridProps) {
    const reduced = usePrefersReducedMotion();

    return (
        <motion.div
            id={id}
            role="radiogroup"
            aria-label="Choose a collaboration type"
            variants={reduced ? undefined : staggerContainer}
            initial={reduced ? undefined : "hidden"}
            whileInView={reduced ? undefined : "show"}
            viewport={{ once: true, amount: 0.2 }}
            className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4", className)}
        >
            {COLLAB_TYPES.map((type) => {
                const Icon = ICONS[type.icon] ?? Sparkles;
                const selected = value === type.id;

                return (
                    <motion.button
                        key={type.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(type.id)}
                        variants={reduced ? undefined : staggerItem}
                        whileHover={reduced ? undefined : { y: -4 }}
                        whileTap={reduced ? undefined : { scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 320, damping: 22 }}
                        className={cn(
                            "group relative text-left min-h-[44px] rounded-2xl p-4 sm:p-5",
                            "border backdrop-blur-xl transition-colors duration-300",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            selected
                                ? "border-brand/60 bg-brand/10 shadow-[0_8px_40px_rgba(168,85,247,0.25)]"
                                : "border-white/10 bg-white/[0.04] hover:border-brand/40 hover:bg-white/[0.07]",
                        )}
                    >
                        {/* Selected check badge */}
                        <span
                            aria-hidden="true"
                            className={cn(
                                "absolute right-3 top-3 grid size-6 place-items-center rounded-full transition-all duration-300",
                                selected
                                    ? "scale-100 bg-brand text-white opacity-100"
                                    : "scale-75 bg-white/5 text-transparent opacity-0",
                            )}
                        >
                            <Check className="size-3.5" strokeWidth={3} />
                        </span>

                        <span
                            className={cn(
                                "mb-3 inline-grid size-11 place-items-center rounded-xl transition-colors duration-300",
                                selected
                                    ? "bg-brand-gradient text-white"
                                    : "bg-white/5 text-brand group-hover:bg-brand/15",
                            )}
                        >
                            <Icon className="size-5" />
                        </span>

                        <h3 className="font-outfit text-base font-bold tracking-tight text-foreground">
                            {type.label}
                        </h3>
                        <p className="mt-1 text-sm font-light leading-snug text-muted-foreground">
                            {type.description}
                        </p>
                    </motion.button>
                );
            })}
        </motion.div>
    );
}

export default CollabTypeGrid;

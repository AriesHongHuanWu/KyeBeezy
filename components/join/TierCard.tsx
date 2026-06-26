"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Crown, Sparkles, Users } from "lucide-react";
import type { Tier } from "@/lib/site";
import { DISCORD_INVITE } from "@/lib/site";
import { GlassPanel } from "@/components/ui/glass";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

/**
 * One membership "door" / rope station. Renders a single tier from TIERS:
 * tagline, price/period, perks (check icons) and a Discord CTA.
 * The highlighted tier (highlight) is lifted, haloed and badged.
 * Accent styling switches on tier.accent ('zinc' | 'purple' | 'gold').
 */

const ACCENT: Record<
    Tier["accent"],
    { icon: typeof Crown; ring: string; rope: string; chip: string; check: string; glow: string }
> = {
    zinc: {
        icon: Users,
        ring: "border-white/10",
        rope: "from-zinc-400/60 via-zinc-500/30 to-transparent",
        chip: "bg-white/10 text-foreground",
        check: "text-zinc-300",
        glow: "",
    },
    purple: {
        icon: Sparkles,
        ring: "border-brand/40",
        rope: "from-brand via-brand-2 to-brand-3",
        chip: "bg-brand/15 text-brand",
        check: "text-brand-2",
        glow: "shadow-[0_24px_90px_-20px_rgba(168,85,247,0.55)]",
    },
    gold: {
        icon: Crown,
        ring: "border-amber-300/40",
        rope: "from-amber-300 via-amber-400/70 to-amber-600/40",
        chip: "bg-amber-300/15 text-amber-200",
        check: "text-amber-300",
        glow: "shadow-[0_24px_90px_-20px_rgba(251,191,36,0.4)]",
    },
};

export function TierCard({ tier }: { tier: Tier }) {
    const reduced = usePrefersReducedMotion();
    const a = ACCENT[tier.accent];
    const AccentIcon = a.icon;
    const highlight = !!tier.highlight;

    return (
        <motion.div
            whileHover={reduced ? undefined : { y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
                "group relative h-full",
                // Highlighted door is lifted + ~12% taller via padding.
                highlight && "md:-translate-y-4",
            )}
        >
            <GlassPanel
                className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-3xl p-7 md:p-8",
                    a.ring,
                    highlight && "border-2 bg-white/[0.06]",
                    highlight && a.glow,
                    tier.accent === "gold" && a.glow,
                )}
            >
                {/* vertical rope line up the left edge */}
                <span
                    aria-hidden="true"
                    className={cn(
                        "absolute inset-y-6 left-0 w-[3px] rounded-full bg-gradient-to-b opacity-80 transition-opacity group-hover:opacity-100",
                        a.rope,
                    )}
                />

                {/* halo for highlighted door */}
                {highlight && (
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-brand/30 blur-3xl"
                    />
                )}

                {/* badge */}
                {tier.badge && (
                    <div
                        className={cn(
                            "relative mb-5 inline-flex w-fit items-center gap-1.5 self-start overflow-hidden rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                            a.chip,
                        )}
                    >
                        {highlight && !reduced && (
                            <motion.span
                                aria-hidden="true"
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                initial={{ x: "-150%" }}
                                animate={{ x: "150%" }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 0.5 }}
                            />
                        )}
                        <AccentIcon className="size-3.5" />
                        {tier.badge}
                    </div>
                )}

                {/* name + tagline */}
                <div className={cn("relative", !tier.badge && "mt-1")}>
                    <h3 className="font-outfit text-2xl font-black tracking-tight text-foreground md:text-3xl">
                        {tier.name}
                    </h3>
                    <p className="mt-1.5 text-sm font-light text-muted-foreground">{tier.tagline}</p>
                </div>

                {/* price */}
                <div className="relative mt-6 flex items-baseline gap-1">
                    <span
                        className={cn(
                            "font-outfit text-4xl font-black tracking-tight md:text-5xl",
                            highlight ? "text-gradient-brand" : "text-foreground",
                        )}
                    >
                        {tier.price}
                    </span>
                    {tier.period && (
                        <span className="text-base font-light text-muted-foreground">{tier.period}</span>
                    )}
                </div>

                {/* queue-priority callout — the through-line */}
                <div className="relative mt-5 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm">
                    <span aria-hidden="true" className="text-brand-2">
                        ↑
                    </span>
                    <span className="font-medium text-foreground/90">
                        {tier.submitPriority >= 100
                            ? "Front of the queue — #1, always"
                            : tier.submitPriority > 0
                              ? "Priority placement in the queue"
                              : "Standard queue placement"}
                    </span>
                </div>

                {/* perks */}
                <ul className="relative mt-6 flex-1 space-y-3">
                    {tier.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <Check className={cn("mt-0.5 size-4 shrink-0", a.check)} aria-hidden="true" />
                            <span className="leading-snug">{perk}</span>
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <motion.a
                    href={DISCORD_INVITE}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={reduced ? undefined : { scale: 1.03 }}
                    whileTap={reduced ? undefined : { scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cn(
                        "relative mt-8 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        highlight
                            ? "btn-brand focus-visible:ring-brand"
                            : "border border-white/15 bg-white/5 text-foreground backdrop-blur-md transition-colors hover:border-brand/40 hover:bg-white/10 focus-visible:ring-brand",
                    )}
                >
                    {tier.cta}
                    <ArrowRight className="size-4" aria-hidden="true" />
                </motion.a>
            </GlassPanel>
        </motion.div>
    );
}

export default TierCard;

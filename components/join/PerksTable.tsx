"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Minus } from "lucide-react";
import { TIERS } from "@/lib/site";
import { GlassPanel } from "@/components/ui/glass";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Section 04 — THE LEDGER. Responsive perk comparison across the 3 tiers.
 * Desktop = a refined dark table that fills in row-by-row on scroll.
 * Mobile = stacked per-tier cards (a table doesn't survive 380px).
 * Emphasizes "Priority in BonnetSubmit live queue".
 */

type PerkRow = {
    label: string;
    /** included flag per tier id, keyed squad / supporter / vip */
    squad: boolean | string;
    supporter: boolean | string;
    vip: boolean | string;
    emphasize?: boolean;
};

const ROWS: PerkRow[] = [
    { label: "Community Discord channels", squad: true, supporter: true, vip: true },
    { label: "Live stream & drop alerts", squad: true, supporter: true, vip: true },
    { label: "Submit a track each round", squad: true, supporter: true, vip: true },
    {
        label: "Priority in BonnetSubmit live queue",
        squad: false,
        supporter: "Priority",
        vip: "#1 lock",
        emphasize: true,
    },
    { label: "Colored name & supporter role", squad: false, supporter: true, vip: true },
    { label: "Early track previews & BTS drops", squad: false, supporter: true, vip: true },
    { label: "Monthly shout-out on stream", squad: false, supporter: true, vip: true },
    { label: "Guaranteed feedback every submission", squad: false, supporter: false, vip: true },
    { label: "Private VIP channel + hangout", squad: false, supporter: false, vip: true },
    { label: "Collab & feature spotlights", squad: false, supporter: false, vip: true },
];

const TIER_IDS = ["squad", "supporter", "vip"] as const;

function Cell({
    value,
    emphasize,
    reduced,
    index,
    play,
}: {
    value: boolean | string;
    emphasize?: boolean;
    reduced: boolean;
    index: number;
    play: boolean;
}) {
    if (value === false) {
        return <Minus className="mx-auto size-4 text-muted-foreground/40" aria-label="Not included" />;
    }
    if (typeof value === "string") {
        return (
            <span
                className={cn(
                    "mx-auto inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold",
                    emphasize ? "bg-brand/20 text-brand" : "bg-white/10 text-foreground",
                )}
            >
                {value}
            </span>
        );
    }
    // Boolean true — animated check draw-on.
    return (
        <span className="mx-auto inline-flex" aria-label="Included">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
                <motion.path
                    d="M5 12.5l4 4L19 7"
                    stroke="url(#perkCheckGrad)"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduced ? false : { pathLength: 0 }}
                    animate={reduced || play ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 0.5, delay: reduced ? 0 : 0.06 * index }}
                />
            </svg>
        </span>
    );
}

export function PerksTable() {
    const reduced = usePrefersReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const play = reduced || inView;

    return (
        <div ref={ref}>
            {/* shared gradient def for all checkmarks */}
            <svg width="0" height="0" className="absolute" aria-hidden="true">
                <defs>
                    <linearGradient id="perkCheckGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                </defs>
            </svg>

            {/* DESKTOP TABLE */}
            <GlassPanel className="hidden overflow-hidden rounded-3xl md:block">
                <table className="w-full border-collapse text-left">
                    <caption className="sr-only">Perk comparison across membership tiers</caption>
                    <thead>
                        <tr className="border-b border-white/10">
                            <th
                                scope="col"
                                className="px-6 py-5 text-sm font-medium uppercase tracking-wider text-muted-foreground"
                            >
                                Perk
                            </th>
                            {TIER_IDS.map((id) => {
                                const tier = TIERS.find((t) => t.id === id)!;
                                return (
                                    <th
                                        scope="col"
                                        key={id}
                                        className={cn(
                                            "px-4 py-5 text-center",
                                            tier.highlight && "bg-white/[0.03]",
                                        )}
                                    >
                                        <span className="block font-outfit text-lg font-black tracking-tight text-foreground">
                                            {tier.name}
                                        </span>
                                        <span className="text-xs font-light text-muted-foreground">
                                            {tier.price}
                                            {tier.period}
                                        </span>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {ROWS.map((row, ri) => (
                            <motion.tr
                                key={row.label}
                                initial={reduced ? false : { opacity: 0, y: 12 }}
                                animate={play ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                                transition={{ duration: 0.4, delay: reduced ? 0 : 0.06 * ri }}
                                className={cn(
                                    "border-b border-white/[0.06] last:border-0",
                                    row.emphasize && "bg-brand/[0.06]",
                                )}
                            >
                                <th
                                    scope="row"
                                    className={cn(
                                        "px-6 py-4 text-left text-sm font-normal",
                                        row.emphasize ? "font-semibold text-foreground" : "text-muted-foreground",
                                    )}
                                >
                                    {row.label}
                                </th>
                                {TIER_IDS.map((id) => {
                                    const tier = TIERS.find((t) => t.id === id)!;
                                    return (
                                        <td
                                            key={id}
                                            className={cn(
                                                "px-4 py-4 text-center",
                                                tier.highlight && "bg-white/[0.03]",
                                            )}
                                        >
                                            <Cell
                                                value={row[id]}
                                                emphasize={row.emphasize}
                                                reduced={reduced}
                                                index={ri}
                                                play={play}
                                            />
                                        </td>
                                    );
                                })}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </GlassPanel>

            {/* MOBILE STACKED CARDS — Inner Circle first to lead with the recommended. */}
            <div className="space-y-5 md:hidden">
                {["supporter", "squad", "vip"].map((id) => {
                    const tier = TIERS.find((t) => t.id === id)!;
                    const included = ROWS.filter((r) => r[id as keyof PerkRow] !== false);
                    return (
                        <GlassPanel
                            key={id}
                            className={cn(
                                "rounded-3xl p-6",
                                tier.highlight && "border-brand/40 bg-white/[0.06]",
                            )}
                        >
                            <div className="mb-4 flex items-baseline justify-between">
                                <h3 className="font-outfit text-xl font-black tracking-tight text-foreground">
                                    {tier.name}
                                </h3>
                                <span className="text-sm font-light text-muted-foreground">
                                    {tier.price}
                                    {tier.period}
                                </span>
                            </div>
                            <ul className="space-y-2.5">
                                {included.map((r) => {
                                    const v = r[id as keyof PerkRow];
                                    return (
                                        <li
                                            key={r.label}
                                            className={cn(
                                                "flex items-start gap-2.5 text-sm",
                                                r.emphasize
                                                    ? "font-semibold text-foreground"
                                                    : "text-muted-foreground",
                                            )}
                                        >
                                            <Check
                                                className={cn(
                                                    "mt-0.5 size-4 shrink-0",
                                                    r.emphasize ? "text-brand-2" : "text-brand",
                                                )}
                                                aria-hidden="true"
                                            />
                                            <span className="leading-snug">
                                                {r.label}
                                                {typeof v === "string" && (
                                                    <span className="ml-1 text-brand">({v})</span>
                                                )}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </GlassPanel>
                    );
                })}
            </div>
        </div>
    );
}

export default PerksTable;

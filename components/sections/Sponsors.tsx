"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Partner / sponsor wordmark marquee.
 *
 * Seamless infinite scroll: the list is duplicated TWICE inside a single flex
 * track, and the global `animate-marquee` keyframe slides the track from
 * translateX(0) to translateX(-50%) — so when the first copy fully exits, the
 * second copy is in the exact same position, looping with no visible seam.
 *
 * Motion is paused on hover (group-hover) and disabled entirely under
 * prefers-reduced-motion via global CSS (no JS gate required for the loop).
 */

const SPONSORS: readonly string[] = [
    "DUBBY ENERGY",
    "BANDLAB",
    "TWITCH",
    "YOUTUBE",
    "KYE BEEZY",
    "BONNET GANG",
];

function Wordmark({ label, ariaHidden }: { label: string; ariaHidden?: boolean }) {
    return (
        <li
            aria-hidden={ariaHidden}
            className="flex shrink-0 items-center gap-6 md:gap-12"
        >
            <span
                className={cn(
                    "font-outfit text-xl font-black uppercase tracking-tight whitespace-nowrap",
                    "text-transparent bg-clip-text bg-gradient-to-b from-foreground/45 to-foreground/15",
                    "transition-colors duration-300 hover:from-brand hover:to-brand-2",
                    "sm:text-2xl md:text-4xl",
                )}
            >
                {label}
            </span>
            {/* Separator dot between wordmarks */}
            <span
                aria-hidden="true"
                className="size-1.5 shrink-0 rounded-full bg-brand/40"
            />
        </li>
    );
}

export default function SponsorsSection() {
    // Render the list twice so the -50% translate loops seamlessly. The second
    // copy is purely decorative for the loop, so it is hidden from a11y tree.
    return (
        <section
            aria-label="Partners and sponsors"
            className="relative overflow-hidden border-y border-border/40 bg-card/20 py-10 backdrop-blur-sm select-none md:py-12"
        >
            {/* Eyebrow */}
            <div className="mb-7 flex items-center justify-center px-4 md:mb-9">
                <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                    <Sparkles aria-hidden="true" className="size-3.5 text-brand" />
                    Powered by the Bonnet Gang
                </span>
            </div>

            {/* Marquee viewport: `group` so children can react to hover; fade
                masks on the left/right edges keep the loop feeling endless. */}
            <div className="group relative overflow-hidden">
                {/* Edge fade masks */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-24 md:w-40"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-24 md:w-40"
                />

                {/* The track: width is content-driven; the two ULs sit side by
                    side. animate-marquee shifts the whole track by -50%, which
                    is exactly one copy's width. Pauses on hover; stops under
                    prefers-reduced-motion via global CSS. */}
                <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none">
                    <ul className="flex items-center gap-6 pr-6 md:gap-12 md:pr-12">
                        {SPONSORS.map((name, i) => (
                            <Wordmark key={`a-${i}`} label={name} />
                        ))}
                    </ul>
                    <ul className="flex items-center gap-6 pr-6 md:gap-12 md:pr-12">
                        {SPONSORS.map((name, i) => (
                            <Wordmark key={`b-${i}`} label={name} ariaHidden />
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

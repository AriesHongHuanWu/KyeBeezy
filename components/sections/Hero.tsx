"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import { GooeyText } from "@/components/ui/gooey-text-morphing";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Hero — overlays the fixed scroll-driven video background.
 * Centerpiece is the gooey "ink-morph" title cycling KYE BEEZY / ARTIST /
 * STREAMER / VISIONARY. Minimal: one white primary CTA + one ghost CTA.
 * Renders no background of its own, only a soft scrim for legibility.
 */

const MORPH_TEXTS = ["KYE BEEZY", "ARTIST", "STREAMER", "VISIONARY"];

export default function Hero() {
    const reduced = usePrefersReducedMotion();

    return (
        <section
            id="hero"
            className="relative min-h-[100svh] flex flex-col items-center justify-center pt-24 pb-20 overflow-hidden text-foreground text-center"
        >
            {/* Soft centered scrim — keeps copy legible over the moving video */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0
                    bg-[radial-gradient(115%_80%_at_50%_50%,rgba(8,6,16,0.7)_0%,rgba(8,6,16,0.28)_44%,transparent_72%)]"
            />

            <div className="container mx-auto px-5 sm:px-6 relative z-10 w-full flex flex-col items-center">
                {/* Eyebrow */}
                <motion.p
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    animate={reduced ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 backdrop-blur-xl
                        font-mono text-[0.65rem] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground"
                >
                    <span className={cn("h-1.5 w-1.5 rounded-full bg-brand", !reduced && "animate-pulse")} />
                    Digital Creator &amp; Artist
                </motion.p>

                {/* Gooey ink-morph title */}
                <motion.div
                    initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                    animate={reduced ? undefined : { opacity: 1, scale: 1 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-4xl"
                >
                    {reduced ? (
                        <h1 className="font-outfit font-black uppercase tracking-tighter text-white text-6xl md:text-8xl">
                            Kye Beezy
                        </h1>
                    ) : (
                        <>
                            <h1 className="sr-only">Kye Beezy — Artist, Producer &amp; Streamer</h1>
                            <div aria-hidden className="h-28 sm:h-32 md:h-44 flex items-center justify-center">
                                <GooeyText
                                    texts={MORPH_TEXTS}
                                    morphTime={1.4}
                                    cooldownTime={1.1}
                                    className="font-outfit"
                                    textClassName="text-5xl sm:text-6xl md:text-[78pt]"
                                />
                            </div>
                        </>
                    )}
                </motion.div>

                {/* Subcopy */}
                <motion.p
                    initial={reduced ? false : { opacity: 0, y: 16 }}
                    animate={reduced ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-6 max-w-md text-base sm:text-lg font-light text-white/70
                        [text-shadow:0_1px_18px_rgba(8,6,16,0.85)]"
                >
                    Independent hip-hop, broadcast nightly. Drop your track and roll with the Bonnet Gang.
                </motion.p>

                {/* CTA cluster — two buttons only */}
                <motion.div
                    initial={reduced ? false : { opacity: 0, y: 16 }}
                    animate={reduced ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3"
                >
                    <Link
                        href="/submit"
                        className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold min-h-[44px]
                            bg-white text-black hover:bg-white/90 transition-all
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        Drop a Track
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </Link>
                    <Link
                        href="/join"
                        className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold min-h-[44px]
                            border border-white/15 bg-white/[0.03] backdrop-blur-xl text-white/90
                            transition-all duration-300 hover:border-brand/60 hover:bg-white/[0.07]
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        Join the Gang
                    </Link>
                </motion.div>
            </div>

            {/* Scroll cue */}
            <Link
                href="#about"
                aria-label="Scroll to the story"
                className="group absolute bottom-6 left-1/2 -translate-x-1/2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full
                    text-white/50 transition-colors hover:text-white
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
                <ChevronDown className={cn("h-6 w-6", !reduced && "animate-float")} aria-hidden />
            </Link>
        </section>
    );
}

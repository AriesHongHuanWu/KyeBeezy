"use client";

import { motion } from "framer-motion";
import { Mic2, Music4, Briefcase, CalendarDays, Repeat, ArrowDown } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

const PILLS = [
    { icon: Mic2, label: "Features" },
    { icon: Music4, label: "Beats" },
    { icon: Briefcase, label: "Brand deals" },
    { icon: CalendarDays, label: "Bookings" },
    { icon: Repeat, label: "Remixes" },
] as const;

/**
 * Top-of-page hero for the collaboration / booking inquiry page.
 * Big display headline + inviting subcopy + a row of "what we do" pills.
 */
export function CollabHero() {
    const reduced = usePrefersReducedMotion();

    return (
        <section className="relative overflow-hidden px-5 pb-12 pt-32 sm:px-8 sm:pt-40 lg:pb-20">
            {/* Soft brand glows */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                <div
                    className={cn(
                        "absolute -top-24 left-1/2 size-[34rem] max-w-[90vw] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]",
                        !reduced && "animate-glow",
                    )}
                />
                <div className="absolute -right-24 top-40 size-[24rem] max-w-[80vw] rounded-full bg-brand-2/15 blur-[120px]" />
            </div>

            <div className="mx-auto max-w-4xl text-center">
                <Reveal direction="up">
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand backdrop-blur-md">
                        <span className={cn("size-1.5 rounded-full bg-brand", !reduced && "animate-pulse")} />
                        Collab &amp; Bookings
                    </span>
                </Reveal>

                <Reveal direction="up" delay={0.08}>
                    <h1 className="mt-6 font-outfit text-5xl font-black leading-[0.95] tracking-tighter text-foreground sm:text-7xl lg:text-8xl">
                        LET&apos;S BUILD
                        <br />
                        <span className="text-gradient-brand">SOMETHING</span>
                    </h1>
                </Reveal>

                <Reveal direction="up" delay={0.16}>
                    <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-muted-foreground sm:text-lg">
                        Features, beats, brand deals, bookings, remixes — if it moves the culture, the
                        Bonnet Gang is in. Pitch your idea and let&apos;s make some noise together.
                    </p>
                </Reveal>

                {/* What-we-do pills */}
                <motion.ul
                    initial={reduced ? undefined : "hidden"}
                    whileInView={reduced ? undefined : "show"}
                    viewport={{ once: true, amount: 0.4 }}
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } } }}
                    className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
                >
                    {PILLS.map(({ icon: Icon, label }) => (
                        <motion.li
                            key={label}
                            variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-foreground/90 backdrop-blur-md"
                        >
                            <Icon className="size-4 text-brand" aria-hidden="true" />
                            {label}
                        </motion.li>
                    ))}
                </motion.ul>

                <Reveal direction="up" delay={0.4}>
                    <a
                        href="#collab-form"
                        className="mt-10 inline-flex min-h-[44px] items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        Start your pitch
                        <ArrowDown className={cn("size-4 text-brand", !reduced && "animate-float")} aria-hidden="true" />
                    </a>
                </Reveal>
            </div>
        </section>
    );
}

export default CollabHero;

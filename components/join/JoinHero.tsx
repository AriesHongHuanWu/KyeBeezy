"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Crown } from "lucide-react";
import { DISCORD_INVITE } from "@/lib/site";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Section 01 — THE DOOR (hero).
 * Big hook headline + subcopy + primary Discord CTA + secondary "See perks" anchor.
 * Includes a restrained "● LIVE — N in the Gang · online now" signal that ticks
 * (seeded fake-live), and a cursor-parallax bonnet mark (autonomous float on mobile
 * / reduced-motion holds still).
 */
export function JoinHero() {
    const reduced = usePrefersReducedMotion();
    const [online, setOnline] = useState(1204);
    const heroRef = useRef<HTMLDivElement>(null);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    // Seeded fake-live counter — jitters by 1–3 every few seconds.
    useEffect(() => {
        if (reduced) return;
        const id = window.setInterval(() => {
            setOnline((n) => {
                const delta = Math.round((Math.random() - 0.5) * 6); // -3..+3
                const next = n + delta;
                return Math.min(1320, Math.max(1180, next));
            });
        }, 3200);
        return () => window.clearInterval(id);
    }, [reduced]);

    // Cursor parallax for the bonnet mark (desktop, motion allowed).
    function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
        if (reduced) return;
        const el = heroRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: -py * 24, y: px * 24 }); // max ±12°
    }

    return (
        <section
            ref={heroRef}
            onPointerMove={onPointerMove}
            className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-28 text-center md:px-8"
        >
            {/* Live signal */}
            <Reveal>
                <div className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-xl">
                    <span className="relative flex size-2.5">
                        {!reduced && (
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-2 opacity-75" />
                        )}
                        <span className="relative inline-flex size-2.5 rounded-full bg-brand-2" />
                    </span>
                    <span className="text-sm font-medium text-foreground/90">
                        <span className="tabular-nums font-bold text-foreground">{online.toLocaleString()}</span>{" "}
                        <span className="text-muted-foreground">in the Gang · online now</span>
                    </span>
                </div>
            </Reveal>

            {/* Bonnet mark */}
            <div
                className="relative mb-12"
                style={{ perspective: "1000px" }}
                aria-hidden="true"
            >
                <motion.div
                    className="relative grid size-32 place-items-center rounded-[2rem] border border-white/10 bg-brand-gradient shadow-[0_20px_80px_-10px_rgba(168,85,247,0.55)] md:size-40"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={
                        reduced
                            ? undefined
                            : { rotateX: tilt.x, rotateY: tilt.y, y: [0, -10, 0] }
                    }
                    transition={{
                        rotateX: { type: "spring", stiffness: 120, damping: 18 },
                        rotateY: { type: "spring", stiffness: 120, damping: 18 },
                        y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                    }}
                >
                    <Crown className="size-16 text-white drop-shadow md:size-20" strokeWidth={1.5} />
                    <span className="pointer-events-none absolute -bottom-10 left-1/2 h-16 w-3/4 -translate-x-1/2 rounded-full bg-brand-2/40 blur-2xl" />
                </motion.div>
            </div>

            {/* Headline */}
            <Reveal delay={0.05}>
                <h1 className="font-outfit text-5xl font-black uppercase leading-[0.92] tracking-tighter text-foreground sm:text-6xl md:text-8xl">
                    Step past <br className="hidden sm:block" />
                    <span className="text-gradient-brand">the rope.</span>
                </h1>
            </Reveal>

            {/* Sub */}
            <Reveal delay={0.12}>
                <p className="mx-auto mt-7 max-w-xl text-lg font-light leading-relaxed text-muted-foreground">
                    The Bonnet Gang doesn&apos;t wait in line. Join the Discord, claim your tier, and
                    skip straight to the front of the BonnetSubmit queue — get heard first, live on
                    stream.
                </p>
            </Reveal>

            {/* CTAs */}
            <Reveal delay={0.18}>
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <motion.a
                        href={DISCORD_INVITE}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={reduced ? undefined : { scale: 1.04 }}
                        whileTap={reduced ? undefined : { scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="btn-brand inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-bold"
                    >
                        Join the Discord
                        <ArrowRight className="size-5" />
                    </motion.a>
                    <a
                        href="#perks"
                        className={cn(
                            "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold",
                            "border border-white/15 bg-white/5 text-foreground backdrop-blur-md",
                            "transition-colors hover:border-brand/40 hover:bg-white/10",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        )}
                    >
                        See the perks
                    </a>
                </div>
            </Reveal>

            {/* Scroll cue */}
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground">
                <span className="text-xs uppercase tracking-[0.25em]">the line starts here</span>
                <motion.span
                    animate={reduced ? undefined : { y: [0, 6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ChevronDown className="size-5" aria-hidden="true" />
                </motion.span>
            </div>
        </section>
    );
}

// Tiny local Reveal wrapper that honors reduced motion (mirrors site Reveal but
// keeps the hero self-contained for entrance timing).
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const reduced = usePrefersReducedMotion();
    if (reduced) return <>{children}</>;
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

export default JoinHero;

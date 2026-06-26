"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Crown, Users } from "lucide-react";

import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { GlassPanel } from "@/components/ui/glass";
import { TIERS, DISCORD_INVITE, SITE } from "@/lib/site";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

import JoinHero from "@/components/join/JoinHero";
import TierCard from "@/components/join/TierCard";
import PerksTable from "@/components/join/PerksTable";
import HowItWorks from "@/components/join/HowItWorks";
import JoinFAQ from "@/components/join/JoinFAQ";

/* ------------------------------------------------------------------ */
/* Page background ornaments                                          */
/* ------------------------------------------------------------------ */

function GrainOverlay() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0 opacity-[0.04] mix-blend-overlay"
            style={{
                backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
        />
    );
}

function BreathingGlow() {
    const reduced = usePrefersReducedMotion();
    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            <motion.div
                className="absolute left-1/2 top-1/3 h-[60vmax] w-[60vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                    background:
                        "radial-gradient(closest-side, rgba(168,85,247,0.10), rgba(236,72,153,0.06) 50%, transparent 75%)",
                }}
                animate={reduced ? undefined : { scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Sticky mini-nav (desktop) — fades in after hero scrolls out        */
/* ------------------------------------------------------------------ */

function StickyNav() {
    const [show, setShow] = useState(false);
    useEffect(() => {
        const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.85);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <motion.div
            initial={false}
            animate={{ opacity: show ? 1 : 0, y: show ? 0 : -16, pointerEvents: show ? "auto" : "none" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-20 z-40 hidden -translate-x-1/2 md:block"
            aria-hidden={!show}
        >
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 backdrop-blur-xl">
                <span className="grid size-8 place-items-center rounded-full bg-brand-gradient text-white">
                    <Crown className="size-4" aria-hidden="true" />
                </span>
                <a
                    href="#tiers"
                    className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                    Tiers
                </a>
                <a
                    href="#perks"
                    className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                    Perks
                </a>
                <a
                    href={DISCORD_INVITE}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-brand ml-1 rounded-full px-4 py-1.5 text-sm font-bold"
                >
                    Join
                </a>
            </div>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/* Section 02 — THE CUT-LINE (killer perk, the hero animation)        */
/* ------------------------------------------------------------------ */

type QueueRow = {
    handle: string;
    title: string;
    /** start position */
    from: number;
    /** end position */
    to: number;
    state: "free" | "inner" | "vip" | "filler";
};

const QUEUE: QueueRow[] = [
    { handle: "@442hz", title: "midnight oil (demo)", from: 1, to: 1, state: "vip" },
    { handle: "@nightowl_", title: "purple static", from: 2, to: 2, state: "filler" },
    { handle: "@bonnetboy", title: "no hook needed", from: 3, to: 3, state: "filler" },
    { handle: "@velvetwav", title: "rope burn", from: 4, to: 4, state: "filler" },
    { handle: "@looplord", title: "808 confession", from: 5, to: 5, state: "filler" },
    { handle: "you", title: "your track", from: 47, to: 6, state: "inner" },
    { handle: "@graveyard", title: "3am bounce", from: 48, to: 48, state: "filler" },
    { handle: "@sirenfm", title: "after hours", from: 49, to: 49, state: "filler" },
];

function CountRoll({ from, to, play }: { from: number; to: number; play: boolean }) {
    const reduced = usePrefersReducedMotion();
    const [value, setValue] = useState(reduced ? to : from);

    useEffect(() => {
        if (reduced) {
            setValue(to);
            return;
        }
        if (!play || from === to) {
            setValue(play ? to : from);
            return;
        }
        const duration = 1100;
        const start = performance.now();
        let raf = 0;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(from + (to - from) * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [from, to, play, reduced]);

    return <span className="tabular-nums">#{value}</span>;
}

function CutLine() {
    const reduced = usePrefersReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-120px" });
    const play = reduced || inView;

    // Sort rows by their played position so framer `layout` animates the reorder.
    const ordered = [...QUEUE].sort((a, b) => (play ? a.to - b.to : a.from - b.from));

    return (
        <section className="relative py-28 md:py-36">
            <div className="mx-auto max-w-6xl px-6 md:px-8">
                <GlassPanel className="relative overflow-hidden rounded-[2.5rem] p-7 md:p-14">
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-brand/20 blur-3xl"
                    />
                    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                        {/* Copy */}
                        <div className="flex flex-col justify-center">
                            <SectionHeading
                                eyebrow="The perk that matters"
                                title="Your track."
                                accent="Front of the queue."
                            >
                                Every beat, every feature request, every BonnetSubmit drop runs
                                through one queue. Free riders wait. The Gang cuts the line — and
                                gets heard first, live on stream.
                            </SectionHeading>
                            <Reveal delay={0.1} className="mt-8">
                                <a
                                    href={DISCORD_INVITE}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-brand inline-flex min-h-[44px] w-fit items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold"
                                >
                                    Cut the line <ArrowRight className="size-4" aria-hidden="true" />
                                </a>
                            </Reveal>
                        </div>

                        {/* Queue visual */}
                        <div
                            ref={ref}
                            className="relative"
                            role="img"
                            aria-label="BonnetSubmit live queue: your track jumps from position 47 to position 6 as an Inner Circle member, while a VIP member holds position 1."
                        >
                            <div className="mb-3 flex items-center justify-between px-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                <span>BonnetSubmit · live queue</span>
                                <span className="flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-brand-2 [animation:pulse_2s_ease-in-out_infinite]" />
                                    live
                                </span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {ordered.map((row) => {
                                    const isYou = row.state === "inner";
                                    const isVip = row.state === "vip";
                                    return (
                                        <motion.div
                                            key={row.handle + row.title}
                                            layout={!reduced}
                                            transition={{
                                                layout: { type: "spring", stiffness: 220, damping: 26 },
                                            }}
                                            className={cn(
                                                "flex items-center gap-3 rounded-2xl border px-4 py-3",
                                                isYou &&
                                                    "border-brand/60 bg-brand/10 shadow-[0_0_0_1px_rgba(236,72,153,0.4),0_10px_40px_-10px_rgba(168,85,247,0.6)]",
                                                isVip &&
                                                    "border-amber-300/50 bg-amber-300/[0.07] shadow-[0_0_40px_-10px_rgba(251,191,36,0.5)]",
                                                !isYou &&
                                                    !isVip &&
                                                    "border-white/10 bg-white/[0.03] opacity-60",
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "w-12 shrink-0 font-outfit text-lg font-black tracking-tight",
                                                    isYou && "text-brand-2",
                                                    isVip && "text-amber-300",
                                                    !isYou && !isVip && "text-muted-foreground",
                                                )}
                                            >
                                                <CountRoll from={row.from} to={row.to} play={play} />
                                            </span>
                                            <span
                                                className={cn(
                                                    "grid size-9 shrink-0 place-items-center rounded-full",
                                                    isYou && "bg-brand/20 text-brand-2",
                                                    isVip && "bg-amber-300/15 text-amber-300",
                                                    !isYou && !isVip && "bg-white/5 text-muted-foreground",
                                                )}
                                            >
                                                {isVip ? (
                                                    <Crown className="size-4" aria-hidden="true" />
                                                ) : (
                                                    <Users className="size-4" aria-hidden="true" />
                                                )}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className={cn(
                                                        "truncate text-sm font-bold",
                                                        isYou || isVip
                                                            ? "text-foreground"
                                                            : "text-foreground/70",
                                                    )}
                                                >
                                                    {row.handle === "you" ? "you" : row.handle}
                                                    {isYou && (
                                                        <span className="ml-2 rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                                                            Inner Circle
                                                        </span>
                                                    )}
                                                    {isVip && (
                                                        <span className="ml-2 rounded-full bg-amber-300/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                                                            VIP · skips everyone
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="truncate text-xs font-light text-muted-foreground">
                                                    {row.title}
                                                </p>
                                            </div>
                                            {isYou && (
                                                <span
                                                    aria-hidden="true"
                                                    className="shrink-0 text-xs font-bold text-brand-2"
                                                >
                                                    skips ahead ↑
                                                </span>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </GlassPanel>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Section 03 — THE THREE DOORS (tiers)                                */
/* ------------------------------------------------------------------ */

function Tiers() {
    // Mobile order: Inner Circle (highlight) first, then the rest.
    const mobileOrder = [...TIERS].sort((a, b) => Number(!!b.highlight) - Number(!!a.highlight));

    return (
        <section id="tiers" className="relative py-28 md:py-36">
            <div className="mx-auto max-w-6xl px-6 md:px-8">
                <SectionHeading align="center" eyebrow="Three ways in" title="Pick your" accent="door.">
                    Three doors into the Bonnet Gang. One of them moves you to the front of the line.
                </SectionHeading>

                {/* Desktop / tablet: unequal-height row */}
                <div className="mt-14 hidden grid-cols-1 items-stretch gap-6 md:grid md:grid-cols-3">
                    {TIERS.map((tier) => (
                        <Reveal key={tier.id} className="h-full">
                            <TierCard tier={tier} />
                        </Reveal>
                    ))}
                </div>

                {/* Mobile: single column, Inner Circle first */}
                <div className="mt-12 space-y-6 md:hidden">
                    {mobileOrder.map((tier) => (
                        <Reveal key={tier.id}>
                            <TierCard tier={tier} />
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={0.1} className="mt-8 text-center">
                    <p className="text-sm font-light text-muted-foreground">
                        Secure checkout happens inside Discord. Cancel anytime.
                    </p>
                </Reveal>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Section 05 — VOICES INSIDE (proof + FOMO)                           */
/* ------------------------------------------------------------------ */

function CountUp({ target, format }: { target: number; format?: (n: number) => string }) {
    const reduced = usePrefersReducedMotion();
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    const [value, setValue] = useState(reduced ? target : 0);

    useEffect(() => {
        if (reduced) {
            setValue(target);
            return;
        }
        if (!inView) return;
        const duration = 1400;
        const start = performance.now();
        let raf = 0;
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(target * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, target, reduced]);

    return <span ref={ref}>{format ? format(value) : value.toLocaleString()}</span>;
}

const MARQUEE = [
    "@442hz · midnight oil",
    "@nightowl_ · purple static",
    "@bonnetboy · no hook needed",
    "@velvetwav · rope burn",
    "@looplord · 808 confession",
    "@sirenfm · after hours",
    "@graveyard · 3am bounce",
];

const QUOTES = [
    {
        q: "got my beat to #1, Kye flipped it on stream that night.",
        by: "@velvetwav · Inner Circle",
    },
    {
        q: "the free tier is generous but priority is unreal — heard every week now.",
        by: "@looplord · VIP",
    },
    {
        q: "best $5 in my whole production budget. straight to the front.",
        by: "@442hz · Inner Circle",
    },
];

function Proof() {
    const reduced = usePrefersReducedMotion();
    const stats = [
        { value: 1204, label: "members in the Gang" },
        { value: 38, label: "spots claimed this week" },
        { value: 12, label: "drops this month" },
    ];

    return (
        <section className="relative py-28 md:py-36">
            <div className="mx-auto max-w-6xl px-6 md:px-8">
                <SectionHeading align="center" eyebrow="Voices inside" title="The Gang's" accent="already in.">
                    Real handles, real drops, real spots filling up.
                </SectionHeading>

                {/* Marquee */}
                <Reveal className="mt-12">
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] py-4">
                        {reduced ? (
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 px-4 text-sm text-muted-foreground">
                                {MARQUEE.map((m) => (
                                    <span key={m}>{m}</span>
                                ))}
                            </div>
                        ) : (
                            <div className="group flex w-max animate-marquee gap-8 px-4 [&:hover]:[animation-play-state:paused]">
                                {[...MARQUEE, ...MARQUEE].map((m, i) => (
                                    <span
                                        key={m + i}
                                        className="whitespace-nowrap text-sm text-muted-foreground"
                                    >
                                        {m}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </Reveal>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {stats.map((s, i) => (
                        <Reveal key={s.label} delay={i * 0.08}>
                            <GlassPanel className="rounded-3xl p-7 text-center">
                                <div className="font-outfit text-4xl font-black tracking-tighter text-gradient-brand md:text-5xl">
                                    <CountUp target={s.value} />
                                </div>
                                <p className="mt-2 text-sm font-light text-muted-foreground">{s.label}</p>
                            </GlassPanel>
                        </Reveal>
                    ))}
                </div>

                {/* FOMO pulse */}
                <Reveal className="mt-8 text-center">
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-medium text-brand">
                        <span className="relative flex size-2">
                            {!reduced && (
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-2 opacity-75" />
                            )}
                            <span className="relative inline-flex size-2 rounded-full bg-brand-2" />
                        </span>
                        Inner Circle filling fast
                    </span>
                </Reveal>

                {/* Quotes */}
                <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
                    {QUOTES.map((quote, i) => (
                        <Reveal key={quote.by} delay={i * 0.08}>
                            <GlassPanel className="flex h-full flex-col rounded-3xl p-6">
                                <p className="flex-1 text-base font-light leading-relaxed text-foreground/90">
                                    &ldquo;{quote.q}&rdquo;
                                </p>
                                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-brand">
                                    {quote.by}
                                </p>
                            </GlassPanel>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* Section 07 — THE FINAL DOOR (closing CTA)                           */
/* ------------------------------------------------------------------ */

function FinalCTA() {
    const reduced = usePrefersReducedMotion();
    return (
        <section className="relative py-28 text-center md:py-36">
            <div className="mx-auto max-w-3xl px-6 md:px-8">
                <div className="relative mx-auto mb-10 w-fit" aria-hidden="true">
                    <motion.span
                        className="grid size-20 place-items-center rounded-[1.5rem] border border-white/10 bg-brand-gradient shadow-[0_20px_80px_-10px_rgba(168,85,247,0.6)]"
                        animate={reduced ? undefined : { y: [0, -8, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Crown className="size-10 text-white" strokeWidth={1.5} />
                    </motion.span>
                </div>
                <Reveal>
                    <h2 className="font-outfit text-5xl font-black leading-[0.95] tracking-tighter text-foreground md:text-7xl">
                        The rope&apos;s <span className="text-gradient-brand">right there.</span>
                    </h2>
                </Reveal>
                <Reveal delay={0.08}>
                    <p className="mx-auto mt-6 max-w-xl text-lg font-light leading-relaxed text-muted-foreground">
                        Step inside, claim your tier, and never wait in line again. Get your track
                        heard first — live on {SITE.name}&apos;s stream.
                    </p>
                </Reveal>
                <Reveal delay={0.16}>
                    <motion.a
                        href={DISCORD_INVITE}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={reduced ? undefined : { scale: 1.04 }}
                        whileTap={reduced ? undefined : { scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="btn-brand mt-10 inline-flex min-h-[44px] items-center gap-2 rounded-full px-10 py-5 text-lg font-bold"
                    >
                        Join the Discord <ArrowRight className="size-5" aria-hidden="true" />
                    </motion.a>
                </Reveal>
                <Reveal delay={0.22}>
                    <p className="mt-5 text-sm font-light text-muted-foreground">
                        Checkout happens safely inside Discord.
                    </p>
                </Reveal>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/* PAGE                                                                */
/* ------------------------------------------------------------------ */

export default function JoinPage() {
    return (
        <div className="relative min-h-screen bg-background text-foreground">
            {/* Subtle brand-aurora wash over the dark canvas (faint so text stays legible) */}
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 opacity-[0.12] blur-3xl bg-brand-aurora" />
            <BreathingGlow />
            <GrainOverlay />

            <div className="relative z-10">
                <SiteNav />
                <StickyNav />

                <main>
                    {/* 01 — The door */}
                    <JoinHero />

                    {/* 02 — The cut-line (make-or-break) */}
                    <CutLine />

                    {/* 03 — The three doors */}
                    <Tiers />

                    {/* How it works */}
                    <section className="relative py-28 md:py-36">
                        <div className="mx-auto max-w-6xl px-6 md:px-8">
                            <SectionHeading
                                align="center"
                                eyebrow="How it works"
                                title="Four steps to the"
                                accent="front."
                            >
                                From outside the rope to first in line — in about a minute.
                            </SectionHeading>
                            <div className="mt-14">
                                <HowItWorks />
                            </div>
                        </div>
                    </section>

                    {/* 04 — The ledger */}
                    <section id="perks" className="relative py-28 md:py-36">
                        <div className="mx-auto max-w-6xl px-6 md:px-8">
                            <SectionHeading
                                align="center"
                                eyebrow="The ledger"
                                title="What's behind each"
                                accent="door."
                            >
                                Every perk, side by side. Queue priority is the line that matters.
                            </SectionHeading>
                            <div className="mt-14">
                                <PerksTable />
                            </div>
                        </div>
                    </section>

                    {/* 05 — Voices inside */}
                    <Proof />

                    {/* 06 — The bouncer (FAQ) */}
                    <section className="relative py-28 md:py-36">
                        <div className="mx-auto max-w-6xl px-6 md:px-8">
                            <SectionHeading
                                align="center"
                                eyebrow="Ask the doorman"
                                title="Questions at the"
                                accent="rope."
                            >
                                Everything you need to know before you step past it.
                            </SectionHeading>
                            <div className="mt-14">
                                <JoinFAQ />
                            </div>
                        </div>
                    </section>

                    {/* 07 — The final door */}
                    <FinalCTA />
                </main>

                <SiteFooter />
            </div>
        </div>
    );
}

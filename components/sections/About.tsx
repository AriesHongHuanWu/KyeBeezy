"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate, type Variants } from "framer-motion";
import { Disc3, Globe2, Users } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

type Stat = {
    icon: typeof Disc3;
    /** Numeric portion to count up to. 0 means show the label string instead. */
    value: number;
    /** Rendered prefix/suffix around the number, e.g. "+" or "K". */
    suffix?: string;
    /** Non-numeric headline (used when value is 0). */
    text?: string;
    label: string;
};

const STATS: Stat[] = [
    { icon: Disc3, value: 100, suffix: "+", label: "Live Streams" },
    { icon: Globe2, value: 0, text: "Global", label: "Audience" },
    { icon: Users, value: 0, text: "Bonnet", label: "Gang" },
];

const ROLES = [
    "Artist",
    "Producer",
    "Streamer",
    "Beatmaker",
    "Songwriter",
    "Bonnet Gang",
    "Hip-Hop",
    "Nocturnal",
];

const PARAGRAPHS = [
    {
        lead: "Born in the rhythm, raised by the beat.",
        body: " Kye Beezy isn't just a name — it's a frequency. From late-night Twitch sessions that light up the timeline to tracks that hit the soul, the journey has always been about one thing: connection.",
    },
    {
        lead: "What started in a small room with big dreams",
        body: " grew into a full multimedia movement. Raw musical talent, high-energy visuals, and a community that shows up — that's the Bonnet Gang formula, and it's only getting louder.",
    },
    {
        lead: "Independent, unfiltered, always pushing.",
        body: " Every drop, every stream, every beat is built with the gang in mind. This isn't a brand chasing a trend — it's an artist building a world, in real time, with you in it.",
    },
];

/** Animated count-up number that respects reduced motion. */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
    const reduced = usePrefersReducedMotion();
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.6 });
    const [display, setDisplay] = useState(reduced ? to : 0);

    useEffect(() => {
        if (reduced) {
            setDisplay(to);
            return;
        }
        if (!inView) return;
        const controls = animate(0, to, {
            duration: 1.6,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (v) => setDisplay(Math.round(v)),
        });
        return () => controls.stop();
    }, [inView, to, reduced]);

    return (
        <span ref={ref} className="tabular-nums">
            {display}
            {suffix}
        </span>
    );
}

const cluster: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const clusterItem: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 24 } },
};

export default function AboutSection() {
    const reduced = usePrefersReducedMotion();

    return (
        <section
            id="about"
            className="relative isolate flex min-h-[100svh] flex-col justify-start lg:justify-center overflow-hidden py-24 text-foreground"
        >
            {/* Soft brand glows only — the background video (his face) stays visible
                in the empty right half for an editorial, page-by-page feel. */}
            <div
                aria-hidden
                className="pointer-events-none absolute -left-32 top-1/4 -z-10 size-[28rem] rounded-full bg-brand/12 blur-[130px]"
            />

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 w-full">
                <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
                    {/* LEFT: the content column */}
                    <div className="max-w-lg">
                        <SectionHeading eyebrow="The Story" title="THE" accent="STORY" align="left">
                            The frequency behind the bonnet — and the gang building it loud.
                        </SectionHeading>

                        <Reveal direction="up" delay={0.05} className="mt-10">
                            <GlassPanel className="relative overflow-hidden p-7 sm:p-9">
                                <span
                                    aria-hidden
                                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent"
                                />
                                <div className="space-y-5">
                                    {PARAGRAPHS.map((p, i) => (
                                        <p
                                            key={i}
                                            className="text-base font-light leading-relaxed text-muted-foreground"
                                        >
                                            <span className="font-semibold text-foreground">{p.lead}</span>
                                            {p.body}
                                        </p>
                                    ))}
                                </div>
                            </GlassPanel>
                        </Reveal>

                        {/* Stat cluster — compact row under the story */}
                        <motion.div
                            variants={cluster}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.3 }}
                            className="mt-6 grid grid-cols-3 gap-3"
                        >
                            {STATS.map((stat) => {
                                const Icon = stat.icon;
                                return (
                                    <motion.div key={stat.label} variants={clusterItem}>
                                        <GlassPanel className="group flex h-full flex-col gap-2 p-4">
                                            <span
                                                aria-hidden
                                                className="grid size-9 place-items-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/20"
                                            >
                                                <Icon className="size-4.5" />
                                            </span>
                                            <div className="font-outfit text-2xl font-black leading-none tracking-tighter text-gradient-brand">
                                                {stat.value > 0 ? (
                                                    <CountUp to={stat.value} suffix={stat.suffix} />
                                                ) : (
                                                    stat.text
                                                )}
                                            </div>
                                            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                                {stat.label}
                                            </div>
                                        </GlassPanel>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>

                    {/* RIGHT: intentional negative space — reveals the artist's face
                        in the fixed background video. Hidden on mobile (single column). */}
                    <div aria-hidden className="hidden lg:block" />
                </div>
            </div>

            {/* Roles / keywords marquee — constrained to the page container */}
            <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal direction="up" delay={0.1} className="mt-16 lg:mt-20">
                <div
                    className="group relative flex overflow-hidden border-y border-brand/15 bg-brand/[0.04] py-5"
                    role="marquee"
                    aria-label="Kye Beezy roles and keywords"
                >
                    {/* edge fades */}
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-28"
                    />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-28"
                    />

                    <div
                        className={cn(
                            "flex shrink-0 items-center gap-6 pr-6 sm:gap-10 sm:pr-10",
                            !reduced && "animate-marquee group-hover:[animation-play-state:paused]",
                        )}
                    >
                        {/* duplicate the list for a seamless -50% loop */}
                        {[...ROLES, ...ROLES].map((role, i) => (
                            <span key={i} className="flex shrink-0 items-center gap-6 sm:gap-10">
                                <span className="font-outfit text-2xl font-black uppercase tracking-tight text-foreground/80 sm:text-4xl">
                                    {role}
                                </span>
                                <span
                                    aria-hidden
                                    className="size-1.5 shrink-0 rounded-full bg-brand sm:size-2"
                                />
                            </span>
                        ))}
                    </div>
                </div>
            </Reveal>
            </div>
        </section>
    );
}

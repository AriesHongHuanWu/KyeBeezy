"use client";

import { motion } from "framer-motion";
import { MessagesSquare, Crown, BadgeCheck, Rocket } from "lucide-react";
import { Reveal, staggerContainer, staggerItem } from "@/components/ui/reveal";
import { GlassPanel } from "@/components/ui/glass";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

/**
 * Section — HowItWorks. 3–4 step explainer:
 * Join Discord → Pick a tier via Discord Server Subscriptions → Get your role →
 * Skip the line in BonnetSubmit.
 */

const STEPS = [
    {
        n: "01",
        icon: MessagesSquare,
        title: "Join the Discord",
        body: "Tap in, grab the @Squad role, and you're inside the Bonnet Gang — free, instantly.",
    },
    {
        n: "02",
        icon: Crown,
        title: "Pick your tier",
        body: "Upgrade through Discord's own Server Subscriptions. Checkout never leaves the server.",
    },
    {
        n: "03",
        icon: BadgeCheck,
        title: "Get your role",
        body: "Your colored role drops automatically — unlocking channels, previews, and perks.",
    },
    {
        n: "04",
        icon: Rocket,
        title: "Skip the line",
        body: "Drop a track in BonnetSubmit and your tier jumps you up the live queue — heard first on stream.",
    },
];

export function HowItWorks() {
    const reduced = usePrefersReducedMotion();

    return (
        <motion.div
            variants={reduced ? undefined : staggerContainer}
            initial={reduced ? undefined : "hidden"}
            whileInView={reduced ? undefined : "show"}
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
            {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                    <motion.div key={step.n} variants={reduced ? undefined : staggerItem} className="relative">
                        {/* connector line on large screens */}
                        {i < STEPS.length - 1 && (
                            <span
                                aria-hidden="true"
                                className="absolute right-0 top-12 hidden h-px w-5 translate-x-full bg-gradient-to-r from-brand/40 to-transparent lg:block"
                            />
                        )}
                        <GlassPanel hover className="flex h-full flex-col rounded-3xl p-6">
                            <div className="mb-5 flex items-center justify-between">
                                <span className="grid size-12 place-items-center rounded-2xl border border-brand/20 bg-brand/10 text-brand">
                                    <Icon className="size-6" aria-hidden="true" />
                                </span>
                                <span className="font-outfit text-3xl font-black tracking-tighter text-white/10">
                                    {step.n}
                                </span>
                            </div>
                            <h3 className="font-outfit text-lg font-black tracking-tight text-foreground">
                                {step.title}
                            </h3>
                            <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
                                {step.body}
                            </p>
                        </GlassPanel>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}

export default HowItWorks;

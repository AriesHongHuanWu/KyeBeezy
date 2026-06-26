"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Section 06 — THE BOUNCER (FAQ). Accessible accordion (real <button> disclosure,
 * aria-expanded / aria-controls). Voiced as a calm doorman.
 */

const FAQS: { q: string; a: string }[] = [
    {
        q: "How do I pay?",
        a: "Everything runs through Discord's own Server Subscriptions checkout. You pick your tier right inside the server, Discord handles the card, and we never touch your payment details. You never have to leave Discord.",
    },
    {
        q: "Can I cancel anytime?",
        a: "Yes — any time, no questions. Manage or cancel your tier straight from your Discord membership settings. You keep your perks until the end of the period you've paid for.",
    },
    {
        q: "How does BonnetSubmit priority work?",
        a: "Every beat and feature request runs through one live queue. Free riders sit in standard order; Inner Circle cuts toward the top; VIP locks the #1 spot. Higher tier = your track gets heard sooner on stream.",
    },
    {
        q: "What's the difference between the tiers?",
        a: "The Squad gets you in the door free. Inner Circle adds queue priority, early drops, a colored role and a monthly shout-out. Bonnet Gang VIP is all-access: #1 queue, guaranteed feedback, a private channel, and collab spotlights.",
    },
    {
        q: "Is the Squad really free?",
        a: "Completely. Joining the Discord and rolling with the Bonnet Gang costs nothing — you get community channels, drop alerts, and a track submission each round. Upgrade only when you want to skip the line.",
    },
];

function FaqItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    const reduced = usePrefersReducedMotion();
    const id = useId();
    const panelId = `faq-panel-${id}`;
    const btnId = `faq-btn-${id}`;

    return (
        <GlassPanel className="overflow-hidden rounded-2xl">
            <h3 className="m-0">
                <button
                    type="button"
                    id={btnId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpen((o) => !o)}
                    className={cn(
                        "flex w-full items-center justify-between gap-4 px-6 py-5 text-left",
                        "min-h-[48px] font-outfit text-base font-bold tracking-tight text-foreground md:text-lg",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand",
                        "transition-colors hover:text-brand",
                    )}
                >
                    <span>{q}</span>
                    <motion.span
                        animate={reduced ? undefined : { rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="shrink-0 text-brand"
                    >
                        <ChevronDown className="size-5" aria-hidden="true" />
                    </motion.span>
                </button>
            </h3>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={btnId}
                        initial={reduced ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduced ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="px-6 pb-6 text-sm font-light leading-relaxed text-muted-foreground md:text-base">
                            {a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassPanel>
    );
}

export function JoinFAQ() {
    return (
        <div className="mx-auto max-w-3xl space-y-4">
            {FAQS.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
        </div>
    );
}

export default JoinFAQ;

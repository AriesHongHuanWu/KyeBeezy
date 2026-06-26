"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ExternalLink, Zap } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { GlassPanel } from "@/components/ui/glass";
import { Reveal, staggerContainer, staggerItem } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

/** A single affiliate product card, mirrored from the Firestore `products` collection. */
interface Product {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
    tag: string;
    /** Tailwind bg-* class for the tag badge. */
    tagColor: string;
    /** Tailwind gradient classes for the card surface. */
    gradient: string;
    /** Hex/rgba glow used in the image drop-shadow. */
    glowColor: string;
    /** Tailwind text-* class applied to title on hover. */
    hoverText: string;
    buttonText: string;
    /** Tailwind text-* class for the buy affordance. */
    buttonColor: string;
    order: number;
}

const DISCOUNT_CODE = "KYEBEEZY";
const DUBBY_HOME = "https://www.dubby.gg?ref=gvqslrbj";

/** Fallback catalog used until Firestore streams in real data (or if it errors / is empty). */
const DEFAULT_PRODUCTS: Product[] = [
    {
        id: "chefs-choice",
        title: "Chef's Choice Energy Tub",
        description: "Can't decide? Let the staff surprise you with a flavor they think you'll love.",
        image: "/dubby/chef-choice.png",
        link: "https://www.dubby.gg/products/chefs-choice-energy-tub-we-surprise-you?ref=gvqslrbj",
        tag: "MYSTERY FLAVOR",
        tagColor: "bg-brand",
        gradient: "from-brand/15 to-brand-3/10",
        glowColor: "rgba(168,85,247,0.5)",
        hoverText: "group-hover:text-brand",
        buttonText: "GET SURPRISED",
        buttonColor: "text-brand",
        order: 0,
    },
    {
        id: "hydro-sampler",
        title: "Hydro Sampler Pack",
        description: "6 caffeine-free refreshers. Hydrate with flavor and electrolytes, zero crash.",
        image: "/dubby/hydro-sampler.png",
        link: "https://www.dubby.gg/products/hydro-sampler-pack-6-caffeine-free-drinks?ref=gvqslrbj",
        tag: "CAFFEINE FREE",
        tagColor: "bg-brand-3",
        gradient: "from-brand-3/15 to-brand/10",
        glowColor: "rgba(99,102,241,0.5)",
        hoverText: "group-hover:text-brand-3",
        buttonText: "HYDRATE NOW",
        buttonColor: "text-brand-3",
        order: 1,
    },
    {
        id: "pushin-punch",
        title: "Pushin Punch",
        description: "A refreshing fruit-punch kick. The perfect daily driver without the jitters.",
        image: "/dubby/PushinPunch_Front.png",
        link: "https://www.dubby.gg/products/pushin-punch-energy-drink-tub?ref=gvqslrbj",
        tag: "BEST SELLER",
        tagColor: "bg-brand-2",
        gradient: "from-brand-2/15 to-brand/10",
        glowColor: "rgba(236,72,153,0.5)",
        hoverText: "group-hover:text-brand-2",
        buttonText: "GET PUNCHED",
        buttonColor: "text-brand-2",
        order: 2,
    },
    {
        id: "japanese-soda",
        title: "Japanese Soda",
        description: "Sweet, bubbly, and unique. The iconic Ramune flavor with a clean kick.",
        image: "/dubby/Dubby_JapaneseSoda_Front.png",
        link: "https://www.dubby.gg/products/japanese-soda-flavor-energy-drink-tub?ref=gvqslrbj",
        tag: "FAN FAVORITE",
        tagColor: "bg-brand-2",
        gradient: "from-brand-2/15 to-brand-3/10",
        glowColor: "rgba(236,72,153,0.5)",
        hoverText: "group-hover:text-brand-2",
        buttonText: "TASTE JAPAN",
        buttonColor: "text-brand-2",
        order: 3,
    },
];

export default function DubbyPromo() {
    const reduced = usePrefersReducedMotion();
    const [copied, setCopied] = useState(false);
    const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);

    // Live products from Firestore, ordered ascending. Falls back to defaults on
    // empty/error so the section always renders something.
    useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        try {
            const q = query(collection(db, "products"), orderBy("order", "asc"));
            unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    if (!snapshot.empty) {
                        const fetched = snapshot.docs.map(
                            (d) => ({ id: d.id, ...d.data() }) as Product,
                        );
                        setProducts(fetched);
                    }
                },
                () => {
                    // Permission denied / offline — keep defaults silently.
                },
            );
        } catch {
            // Firebase not initialised — keep defaults.
        }
        return () => unsubscribe?.();
    }, []);

    const copyCode = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(DISCOUNT_CODE);
            setCopied(true);
            toast.success("Code copied — paste it at checkout", {
                description: `${DISCOUNT_CODE} unlocks your Bonnet Gang discount.`,
            });
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Couldn't copy — long-press the code to copy it manually.");
        }
    }, []);

    return (
        <section
            id="dubby"
            className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden py-24 text-foreground"
        >
            {/* Soft brand glow only — no full-bleed wash so the fixed background
                video (his face) stays visible in the empty right half. */}
            <div
                aria-hidden
                className="pointer-events-none absolute -left-24 top-1/3 -z-10 size-[28rem] rounded-full bg-brand/12 blur-[130px]"
            />

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 w-full">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    {/* LEFT: the content column */}
                    <div className="max-w-xl">
                        <SectionHeading eyebrow="Fuel" title="POWERED BY" accent="DUBBY" align="left">
                            No crash. No jitters. The clean energy behind every late-night stream
                            and studio session — at a Bonnet Gang price.
                        </SectionHeading>

                        {/* Partner lockup + click-to-copy code + CTA */}
                        <Reveal direction="up" delay={0.05} className="mt-8">
                            <GlassPanel className="relative overflow-hidden p-6 sm:p-8">
                                <span
                                    aria-hidden
                                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent"
                                />

                                <div className="flex flex-wrap items-center gap-3">
                                    <Image
                                        src="/dubby/dubby-logo.webp"
                                        alt="Dubby Energy"
                                        width={132}
                                        height={44}
                                        className="h-8 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
                                    />
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
                                        <Zap className="size-3" aria-hidden />
                                        Official Partner
                                    </span>
                                </div>

                                <p className="mt-5 text-base font-light leading-relaxed text-muted-foreground">
                                    Use my code at checkout for a discount on every tub. Same fuel
                                    I run on — grab a flavor and power up.
                                </p>

                                {/* Click-to-copy code chip + CTA. Full-width on mobile. */}
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                                    <button
                                        type="button"
                                        onClick={copyCode}
                                        aria-label={`Copy discount code ${DISCOUNT_CODE}`}
                                        className={cn(
                                            "group inline-flex min-h-[44px] flex-1 items-center justify-between gap-3 rounded-2xl",
                                            "border border-brand/30 bg-brand/10 px-5 py-2.5 backdrop-blur-md",
                                            "transition-all duration-300 hover:border-brand/60 hover:bg-brand/15",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                            !reduced && "hover:-translate-y-0.5",
                                        )}
                                    >
                                        <span className="flex flex-col text-left leading-tight">
                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                                Discount Code
                                            </span>
                                            <span className="font-mono text-xl font-bold tracking-tight text-foreground">
                                                {DISCOUNT_CODE}
                                            </span>
                                        </span>
                                        <span
                                            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-lg"
                                            aria-hidden
                                        >
                                            <AnimatePresence mode="wait" initial={false}>
                                                {copied ? (
                                                    <motion.span
                                                        key="check"
                                                        initial={reduced ? false : { scale: 0.4, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={reduced ? undefined : { scale: 0.4, opacity: 0 }}
                                                        transition={{ duration: 0.18 }}
                                                    >
                                                        <Check className="size-4" />
                                                    </motion.span>
                                                ) : (
                                                    <motion.span
                                                        key="copy"
                                                        initial={reduced ? false : { scale: 0.4, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={reduced ? undefined : { scale: 0.4, opacity: 0 }}
                                                        transition={{ duration: 0.18 }}
                                                    >
                                                        <Copy className="size-4" />
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </span>
                                    </button>

                                    <a
                                        href={DUBBY_HOME}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-6 py-2.5",
                                            "btn-brand text-sm font-bold",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                        )}
                                    >
                                        Shop Dubby
                                        <ExternalLink className="size-4" aria-hidden />
                                    </a>
                                </div>
                            </GlassPanel>
                        </Reveal>

                        {/* Compact 2-up product grid — a taste of the catalog. */}
                        <motion.div
                            className="mt-5 grid grid-cols-2 gap-3 sm:gap-4"
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: "-80px" }}
                        >
                            {products.slice(0, 4).map((product) => (
                                <motion.div key={product.id} variants={staggerItem}>
                                    <a
                                        href={product.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Buy ${product.title} on Dubby (opens in a new tab)`}
                                        className={cn(
                                            "group relative flex h-full flex-col overflow-hidden rounded-2xl",
                                            "border border-white/10 bg-gradient-to-br",
                                            product.gradient,
                                            "backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
                                            "transition-all duration-300",
                                            "hover:border-brand/40 hover:shadow-[0_16px_48px_rgba(168,85,247,0.22)]",
                                            !reduced && "hover:-translate-y-1.5",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                        )}
                                    >
                                        {/* Tag badge */}
                                        <span
                                            className={cn(
                                                "absolute right-2.5 top-2.5 z-10 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white shadow",
                                                product.tagColor,
                                            )}
                                        >
                                            {product.tag}
                                        </span>

                                        {/* Product image */}
                                        <div className="relative flex aspect-square items-center justify-center p-4">
                                            <span
                                                aria-hidden
                                                className="absolute inset-5 rounded-full opacity-25 blur-3xl transition-opacity duration-500 group-hover:opacity-50"
                                                style={{ backgroundColor: product.glowColor }}
                                            />
                                            <Image
                                                src={product.image}
                                                alt={product.title}
                                                width={200}
                                                height={200}
                                                className={cn(
                                                    "relative z-10 h-full w-auto object-contain drop-shadow-2xl",
                                                    !reduced &&
                                                        "transition-transform duration-500 ease-out group-hover:scale-110",
                                                )}
                                            />
                                        </div>

                                        {/* Copy */}
                                        <div className="flex flex-1 flex-col p-4 pt-0">
                                            <h3
                                                className={cn(
                                                    "font-outfit text-sm font-bold leading-tight tracking-tight text-foreground transition-colors",
                                                    product.hoverText,
                                                )}
                                            >
                                                {product.title}
                                            </h3>
                                            <span
                                                className={cn(
                                                    "mt-3 inline-flex items-center gap-1.5 text-xs font-bold transition-transform",
                                                    !reduced && "group-hover:translate-x-1",
                                                    product.buttonColor,
                                                )}
                                            >
                                                {product.buttonText}
                                                <ExternalLink className="size-3.5" aria-hidden />
                                            </span>
                                        </div>
                                    </a>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* RIGHT: intentional negative space — reveals the artist's face
                        in the fixed background video. Hidden on mobile (single column). */}
                    <div aria-hidden className="hidden lg:block" />
                </div>
            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import { Music2, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SOCIALS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/glass";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, staggerContainer, staggerItem } from "@/components/ui/reveal";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

/** A single track sourced from Firestore (or the hardcoded fallback). */
interface Track {
    id: string;
    title: string;
    /** Full <iframe> HTML, rendered via dangerouslySetInnerHTML. */
    embedCode: string;
    order?: number;
    createdAt?: Timestamp | null;
}

/** Shape of a Firestore "music" document. */
interface MusicDoc {
    title?: string;
    embedCode?: string;
    order?: number;
    createdAt?: Timestamp | null;
}

/** Build a BandLab embed iframe with consistent attributes. */
function bandlabEmbed(src: string, title: string): string {
    return `<iframe width="100%" height="450" src="${src}" frameborder="0" allowfullscreen title="${title} — BandLab player"></iframe>`;
}

/** Fallback tracks shown when the Firestore collection is empty. */
const FALLBACK_TRACKS: Track[] = [
    {
        id: "fallback-latest-heat",
        title: "Latest Heat",
        embedCode: bandlabEmbed(
            "https://www.bandlab.com/embed/?id=7d44e991-08cf-f011-8196-000d3a96100f&blur=true",
            "Latest Heat",
        ),
    },
    {
        id: "fallback-studio-sessions",
        title: "Studio Sessions",
        embedCode: bandlabEmbed(
            "https://www.bandlab.com/embed/?id=bcdc5788-3f63-f011-8dc9-000d3a960be3&blur=true",
            "Studio Sessions",
        ),
    },
];

export default function MusicSection() {
    const reduced = usePrefersReducedMotion();
    const [tracks, setTracks] = useState<Track[]>(FALLBACK_TRACKS);

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        try {
            const q = query(collection(db, "music"), orderBy("createdAt", "desc"));
            unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    if (snapshot.empty) {
                        setTracks(FALLBACK_TRACKS);
                        return;
                    }

                    const fetched: Track[] = snapshot.docs
                        .map((d) => {
                            const data = d.data() as MusicDoc;
                            return {
                                id: d.id,
                                title: data.title ?? "Untitled",
                                embedCode: data.embedCode ?? "",
                                order: data.order,
                                createdAt: data.createdAt ?? null,
                            };
                        })
                        // Only keep docs that actually carry an embed.
                        .filter((t) => t.embedCode.trim().length > 0);

                    setTracks(fetched.length > 0 ? fetched : FALLBACK_TRACKS);
                },
                () => {
                    // On any read error, gracefully fall back.
                    setTracks(FALLBACK_TRACKS);
                },
            );
        } catch {
            setTracks(FALLBACK_TRACKS);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    return (
        <section
            id="music"
            className="relative isolate flex min-h-[100svh] flex-col justify-start lg:justify-center overflow-hidden py-24 text-foreground"
        >
            {/* Soft brand glow only — the fixed background video (his face) stays
                visible in the empty LEFT half for an editorial, page-by-page feel.
                No full-bleed scrim, so the video reads through. */}
            <div
                aria-hidden
                className={cn(
                    "pointer-events-none absolute -right-32 top-1/4 -z-10 size-[28rem] rounded-full bg-brand/12 blur-[130px]",
                    !reduced && "animate-glow",
                )}
            />

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 w-full">
                <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
                    {/* LEFT: intentional negative space — reveals the artist's face
                        in the fixed background video. Hidden on mobile (single column). */}
                    <div aria-hidden className="hidden lg:block" />

                    {/* RIGHT: the content column */}
                    <div className="max-w-lg lg:ml-auto">
                        <SectionHeading
                            eyebrow="Listen"
                            title="THE"
                            accent="SOUND"
                            align="left"
                        >
                            Fresh heat straight from the lab — press play and roll with
                            the Bonnet Gang.
                        </SectionHeading>

                        {/* Compact stack of larger track cards: single column, two on xl.
                            Fewer, bigger cards read more premium than a wide grid. */}
                        <motion.ul
                            className="mt-10 grid list-none grid-cols-1 gap-5 xl:grid-cols-2"
                            variants={reduced ? undefined : staggerContainer}
                            initial={reduced ? undefined : "hidden"}
                            whileInView={reduced ? undefined : "show"}
                            viewport={{ once: true, amount: 0.15 }}
                        >
                            {tracks.map((track) => (
                                <motion.li
                                    key={track.id}
                                    variants={reduced ? undefined : staggerItem}
                                    className="group"
                                >
                                    <GlassPanel
                                        hover
                                        className="flex h-full flex-col gap-4 p-3 sm:p-4"
                                    >
                                        {/* Aspect-square embed frame */}
                                        <div
                                            title={`${track.title} — BandLab player`}
                                            className={cn(
                                                "relative aspect-square w-full overflow-hidden rounded-2xl",
                                                "border border-white/10 bg-black/30",
                                                // Make the injected iframe fill the frame.
                                                "[&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0",
                                            )}
                                            dangerouslySetInnerHTML={{
                                                __html: track.embedCode,
                                            }}
                                        />

                                        {/* Title row */}
                                        <div className="flex items-center justify-between gap-3 px-1.5 pb-1">
                                            <div className="min-w-0">
                                                <h3 className="truncate font-outfit text-lg font-bold tracking-tight text-foreground">
                                                    {track.title}
                                                </h3>
                                                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                                    On BandLab
                                                </p>
                                            </div>
                                            <span
                                                aria-hidden
                                                className={cn(
                                                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                                                    "bg-brand-gradient text-white shadow-lg shadow-brand/30",
                                                    "transition-all duration-300",
                                                    !reduced &&
                                                        "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
                                                )}
                                            >
                                                <Music2 className="size-4" />
                                            </span>
                                        </div>
                                    </GlassPanel>
                                </motion.li>
                            ))}
                        </motion.ul>

                        {/* BandLab CTA — full-width on mobile, inline on desktop */}
                        <Reveal direction="up" delay={0.1} className="mt-6">
                            <a
                                href={SOCIALS.bandlab}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 sm:w-auto",
                                    "text-sm font-bold tracking-wide text-white btn-brand",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                )}
                            >
                                Hear it all on BandLab
                                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
}

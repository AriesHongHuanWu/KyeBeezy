"use client";

import { useEffect, useMemo, useState } from "react";
import {
    collection,
    limit,
    onSnapshot,
    orderBy,
    query,
    type Timestamp,
} from "firebase/firestore";
import { Twitch, Youtube, MessageCircle, ArrowUpRight } from "lucide-react";

import { db } from "@/lib/firebase";
import { SOCIALS, TWITCH_CHANNEL, TWITCH_PARENTS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { GlassPanel } from "@/components/ui/glass";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

/** Fallback highlight if no Firestore doc exists yet. */
const FALLBACK_YT_ID = "7UN_eYHLssE";

type VideoDoc = {
    url: string;
    platform?: string;
    createdAt?: Timestamp;
};

/**
 * Convert a YouTube watch / youtu.be / shorts / live URL into its /embed/ form.
 * Returns null if no id could be extracted (so callers can fall back).
 */
function toYouTubeEmbed(url: string): string | null {
    if (!url) return null;
    try {
        const u = new URL(url);
        const host = u.hostname.replace(/^www\./, "");
        let id = "";

        if (host === "youtu.be") {
            id = u.pathname.slice(1);
        } else if (host.endsWith("youtube.com")) {
            if (u.pathname === "/watch") {
                id = u.searchParams.get("v") ?? "";
            } else if (u.pathname.startsWith("/embed/")) {
                id = u.pathname.replace("/embed/", "");
            } else if (u.pathname.startsWith("/shorts/")) {
                id = u.pathname.replace("/shorts/", "");
            } else if (u.pathname.startsWith("/live/")) {
                id = u.pathname.replace("/live/", "");
            }
        }

        id = id.split("/")[0].split("?")[0].trim();
        return id ? `https://www.youtube.com/embed/${id}` : null;
    } catch {
        return null;
    }
}

export default function StreamingSection() {
    const reduced = usePrefersReducedMotion();
    const [video, setVideo] = useState<VideoDoc | null>(null);

    // Live latest-highlight subscription. Keep cleanup intact.
    useEffect(() => {
        const q = query(
            collection(db, "videos"),
            orderBy("createdAt", "desc"),
            limit(1),
        );
        const unsubscribe = onSnapshot(
            q,
            (snap) => {
                const first = snap.docs[0];
                setVideo(first ? (first.data() as VideoDoc) : null);
            },
            () => setVideo(null),
        );
        return () => unsubscribe();
    }, []);

    // Twitch player needs one parent= param per whitelisted domain.
    const twitchSrc = useMemo(() => {
        const parents = TWITCH_PARENTS.map((p) => `parent=${encodeURIComponent(p)}`).join("&");
        return `https://player.twitch.tv/?channel=${encodeURIComponent(TWITCH_CHANNEL)}&${parents}&muted=true`;
    }, []);

    // Resolve the YouTube highlight, with graceful fallback. Kept so the latest
    // Firestore doc still drives the "Subscribe on YouTube" fallback embed.
    const youtubeSrc = useMemo(() => {
        const fromDoc = video?.url ? toYouTubeEmbed(video.url) : null;
        return fromDoc ?? `https://www.youtube.com/embed/${FALLBACK_YT_ID}`;
    }, [video]);

    return (
        <section
            id="stream"
            className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden py-24 text-foreground"
        >
            {/* Soft brand glow only — the fixed background video (his face) stays
                visible in the empty right half for an editorial, page-by-page feel. */}
            <div
                aria-hidden
                className={cn(
                    "pointer-events-none absolute -left-32 top-1/3 -z-10 size-[28rem] rounded-full bg-brand/12 blur-[130px]",
                    !reduced && "animate-glow",
                )}
            />

            {/* Directional scrim: darkens the content (left) half; the right
                half stays open to reveal the face. */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden lg:block bg-gradient-to-r from-background via-background/55 to-transparent" />

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 w-full">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    {/* LEFT: the content column */}
                    <div className="max-w-xl">
                        <SectionHeading eyebrow="Live" title="THE" accent="STREAM" align="left">
                            Tune in to the chaos. Catch Kye live on Twitch — drop in, hang out, and
                            get your track heard in real time.
                        </SectionHeading>

                        {/* ONE prominent Twitch embed in a glass frame */}
                        <Reveal direction="up" delay={0.05} className="mt-8">
                            <GlassPanel className="relative overflow-hidden p-3 sm:p-4">
                                <span
                                    aria-hidden
                                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent"
                                />
                                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                                    <div className="flex items-center gap-2.5">
                                        <span className="relative flex size-2.5">
                                            {!reduced && (
                                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-75" />
                                            )}
                                            <span className="relative inline-flex size-2.5 rounded-full bg-brand" />
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                                            Live on Twitch
                                        </span>
                                    </div>
                                    <Twitch className="size-5 text-brand" aria-hidden />
                                </div>

                                <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
                                    <iframe
                                        src={twitchSrc}
                                        title={`${TWITCH_CHANNEL} live on Twitch`}
                                        allowFullScreen
                                        loading="lazy"
                                        className="size-full"
                                    />
                                </div>

                                {/* YouTube fallback highlight — kept (hidden visually but
                                    title preserved) so the Firestore highlight still loads. */}
                                <iframe
                                    src={youtubeSrc}
                                    title="Latest Kye Beezy YouTube highlight"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    loading="lazy"
                                    aria-hidden
                                    tabIndex={-1}
                                    className="sr-only h-0 w-0"
                                />
                            </GlassPanel>
                        </Reveal>

                        {/* Compact row of actions */}
                        <Reveal direction="up" delay={0.1} className="mt-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <a
                                    href={SOCIALS.twitch}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "btn-brand inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-bold sm:w-auto",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                    )}
                                >
                                    <Twitch className="size-4" aria-hidden />
                                    Follow on Twitch
                                </a>

                                <a
                                    href={SOCIALS.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "glass-panel inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-foreground sm:w-auto",
                                        "transition-colors hover:border-brand/40 hover:text-brand",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                    )}
                                >
                                    <Youtube className="size-4" aria-hidden />
                                    Subscribe on YouTube
                                </a>

                                <a
                                    href={SOCIALS.discord}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "glass-panel inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-foreground sm:w-auto",
                                        "transition-colors hover:border-brand/40 hover:text-brand",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                    )}
                                >
                                    <MessageCircle className="size-4" aria-hidden />
                                    Join Discord
                                    <ArrowUpRight className="size-4" aria-hidden />
                                </a>
                            </div>
                        </Reveal>
                    </div>

                    {/* RIGHT: intentional negative space — reveals the artist's face
                        in the fixed background video. Hidden on mobile (single column). */}
                    <div aria-hidden className="hidden lg:block" />
                </div>
            </div>
        </section>
    );
}

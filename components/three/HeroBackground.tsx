"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion, useIsLowPower } from "@/lib/hooks/usePrefersReducedMotion";

// Heavy / client-only — load on demand.
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });
const ScrollVideo = dynamic(() => import("@/components/three/ScrollVideo"), { ssr: false });
const Atmosphere = dynamic(() => import("@/components/three/Atmosphere"), { ssr: false });

type Mode = "loading" | "glb" | "video" | "image";

async function exists(url: string): Promise<boolean> {
    try {
        const r = await fetch(url, { method: "HEAD" });
        const ct = r.headers.get("content-type") || "";
        return r.ok && !ct.includes("text/html");
    } catch {
        return false;
    }
}

/**
 * Fixed full-viewport homepage background. Picks the best available asset:
 *   /models/kye.glb   → 3D model (WebGL, scroll-orbit camera)
 *   /hero/turntable.mp4 → scroll-scrubbed video (Apple-style)
 *   else              → 2.5D cutout (WebGL)
 * A scroll-driven scrim keeps the stacked content readable.
 */
export default function HeroBackground() {
    const reduced = usePrefersReducedMotion();
    const lowPower = useIsLowPower();
    const dimRef = useRef<HTMLDivElement>(null);
    const [mode, setMode] = useState<Mode>("loading");
    // Which optional source variants actually ship (dark portrait is required).
    const [assets, setAssets] = useState<{
        wide?: boolean;
        light?: boolean;
        wideLight?: boolean;
    }>({});

    useEffect(() => {
        let on = true;
        (async () => {
            if (await exists("/models/kye.glb")) return on && setMode("glb");
            if (await exists("/hero/turntable.mp4")) {
                const [wide, light, wideLight] = await Promise.all([
                    exists("/hero/turntable-wide.mp4"),
                    exists("/hero/turntable-light.mp4"),
                    exists("/hero/turntable-wide-light.mp4"),
                ]);
                if (on) setAssets({ wide, light, wideLight });
                return on && setMode("video");
            }
            return on && setMode("image");
        })();
        return () => {
            on = false;
        };
    }, []);

    useEffect(() => {
        const onScroll = () => {
            const vh = window.innerHeight || 1;
            // keep the video clearly visible up top; ease in a gentle scrim lower down
            const p = Math.min(1, Math.max(0, (window.scrollY - vh * 0.5) / (vh * 1.1)));
            if (dimRef.current) dimRef.current.style.opacity = String(p * 0.22);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Atmosphere is layered BEHIND the video (so the video's blend reveals it
    // through the backdrop while the subject occludes it). Video only, on
    // capable devices, never under reduced motion.
    const showAtmosphere = mode === "video" && !reduced && !lowPower;

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
            {/* Clean near-black canvas — no loud color washes */}

            {/* 3D depth atmosphere — monochrome motes + crystals, rendered BEHIND
                the video. ScrollVideo's lighten/darken blend lets the clip's
                uniform backdrop reveal them while the lit subject occludes them,
                so they read as depth behind the person. */}
            {showAtmosphere ? <Atmosphere lowPower={lowPower} /> : null}

            {reduced ? (
                <div className="absolute inset-0 flex items-end justify-center">
                    <Image
                        src="/kye-cutout-new.png"
                        alt=""
                        width={620}
                        height={420}
                        priority
                        className="max-h-[72vh] w-auto object-contain opacity-90 drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]"
                    />
                </div>
            ) : mode === "video" ? (
                <ScrollVideo
                    darkPortrait="/hero/turntable.mp4"
                    darkWide={assets.wide ? "/hero/turntable-wide.mp4" : undefined}
                    lightPortrait={assets.light ? "/hero/turntable-light.mp4" : undefined}
                    lightWide={
                        assets.wideLight ? "/hero/turntable-wide-light.mp4" : undefined
                    }
                    behindParticles={showAtmosphere}
                />
            ) : mode === "glb" || mode === "image" ? (
                <HeroScene lowPower={lowPower} />
            ) : null}

            {/* Modern purple tint — a soft glow from the bottom + a faint top
                bloom (not a flat wash). Dark theme only: on the light theme these
                dark purple washes read as an unwanted black gradient, so the
                light-background clip is left clean. */}
            <div className="absolute inset-0 pointer-events-none dark:[background:radial-gradient(85%_55%_at_50%_120%,rgba(139,47,230,0.24),transparent_70%)]" />
            <div className="absolute inset-0 pointer-events-none dark:[background:radial-gradient(70%_42%_at_50%_-12%,rgba(139,47,230,0.12),transparent_60%)]" />

            {/* Scroll-driven readability scrim (kept light so the video stays visible) */}
            <div ref={dimRef} className="absolute inset-0 bg-background pointer-events-none" style={{ opacity: 0 }} />

            {/* Soft vignette + bottom fade so foreground text always reads */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/65" />
            <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_60%,var(--background)_145%)]" />
        </div>
    );
}

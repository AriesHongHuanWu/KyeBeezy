"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Full-bleed background video driven by SECTIONS. Each section maps to a
 * chapter timestamp in the clip. When you scroll into a new section the video
 * actually PLAYS (native decode → buttery smooth) forward to that chapter and
 * settles — so arriving at a section feels like the visual switches to a new
 * look. Scrolling back up eases the time backward. Needs an all-intra encode
 * for clean seeking on reverse.
 *
 * The source adapts to two axes:
 *   • viewport  — a wide 16:9 clip fills desktop; a portrait clip suits mobile.
 *   • theme     — a light-background clip for light mode, dark for dark mode.
 * Missing variants fall back gracefully (light→dark, wide→portrait).
 */
const SECTIONS = ["hero", "about", "music", "stream", "schedule", "dubby", "contact"];
const FWD_RATE = 1.6; // play a touch faster so the "beat" lands quickly
const DESKTOP_MQ = "(min-width: 1024px)"; // matches Tailwind's lg breakpoint

function pickSrc(
    s: {
        darkPortrait: string;
        darkWide?: string;
        lightPortrait?: string;
        lightWide?: string;
    },
    light: boolean,
    wide: boolean,
): string {
    if (light) {
        // Light theme renders dark text, so a light-background clip is required
        // for legibility — prefer light sources over a wide-but-dark fallback.
        if (wide) return s.lightWide ?? s.lightPortrait ?? s.darkWide ?? s.darkPortrait;
        return s.lightPortrait ?? s.darkPortrait;
    }
    if (wide) return s.darkWide ?? s.darkPortrait;
    return s.darkPortrait;
}

export default function ScrollVideo({
    darkPortrait,
    darkWide,
    lightPortrait,
    lightWide,
}: {
    /** Required dark portrait source — also the universal fallback. */
    darkPortrait: string;
    /** Wide (16:9) dark source for desktop. */
    darkWide?: string;
    /** Portrait light-mode source. */
    lightPortrait?: string;
    /** Wide light-mode source for desktop. */
    lightWide?: string;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { resolvedTheme } = useTheme();

    // Pick the source matching theme + viewport, swapping when either changes.
    // SSR-safe default: dark portrait (matches defaultTheme="dark").
    const [activeSrc, setActiveSrc] = useState(darkPortrait);
    useEffect(() => {
        const mq = window.matchMedia(DESKTOP_MQ);
        const apply = () =>
            setActiveSrc(
                pickSrc(
                    { darkPortrait, darkWide, lightPortrait, lightWide },
                    resolvedTheme === "light",
                    mq.matches,
                ),
            );
        apply();
        mq.addEventListener("change", apply);
        return () => mq.removeEventListener("change", apply);
    }, [darkPortrait, darkWide, lightPortrait, lightWide, resolvedTheme]);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        let raf = 0;
        let dur = 0;
        let ready = false;
        let visible = !document.hidden;
        let target = 0;
        let activeIdx = -1;

        const chapter = (idx: number) => {
            const frac = SECTIONS.length > 1 ? idx / (SECTIONS.length - 1) : 0;
            return frac * Math.max(0, dur - 0.06);
        };

        const computeActive = () => {
            const mid = window.scrollY + window.innerHeight * 0.42;
            let idx = 0;
            for (let i = 0; i < SECTIONS.length; i++) {
                const el = document.getElementById(SECTIONS[i]);
                if (el && el.offsetTop <= mid) idx = i;
            }
            if (idx !== activeIdx) {
                activeIdx = idx;
                target = chapter(idx);
            }
        };

        const onMeta = () => {
            dur = v.duration || 0;
            ready = true;
            computeActive();
        };
        v.addEventListener("loadedmetadata", onMeta);
        if (v.readyState >= 1) onMeta();

        v.muted = true;
        v.playbackRate = FWD_RATE;
        // prime the decoder
        v.play().then(() => v.pause()).catch(() => void 0);

        const onScroll = () => {
            if (ready) computeActive();
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        const tick = () => {
            raf = visible ? requestAnimationFrame(tick) : 0;
            if (!ready || !dur) return;
            const now = v.currentTime;
            const diff = target - now;

            if (diff > 0.05) {
                // forward → real playback to the chapter (smooth)
                if (v.paused) v.play().catch(() => void 0);
                if (v.playbackRate !== FWD_RATE) v.playbackRate = FWD_RATE;
            } else if (diff < -0.05) {
                // backward → ease the time down (reverse playback isn't native)
                if (!v.paused) v.pause();
                try {
                    v.currentTime = now + diff * 0.16;
                } catch {
                    /* ignore transient seek errors */
                }
            } else {
                // arrived → hold on the pose
                if (!v.paused) {
                    v.pause();
                    try {
                        v.currentTime = target;
                    } catch {
                        /* noop */
                    }
                }
            }
        };
        raf = requestAnimationFrame(tick);

        const onVis = () => {
            visible = !document.hidden;
            if (!visible && !v.paused) v.pause();
            if (visible && !raf) raf = requestAnimationFrame(tick);
        };
        document.addEventListener("visibilitychange", onVis);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            document.removeEventListener("visibilitychange", onVis);
            v.removeEventListener("loadedmetadata", onMeta);
        };
    }, [activeSrc]);

    return (
        <video
            key={activeSrc}
            ref={videoRef}
            src={activeSrc}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover [object-position:50%_20%] [filter:contrast(1.05)_saturate(0.96)_brightness(0.94)] lg:[object-position:50%_32%]"
        />
    );
}

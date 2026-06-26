"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Full-bleed background video driven by SECTIONS. Each section maps to a
 * chapter timestamp in the clip. When you scroll into a new section the video
 * actually PLAYS (native decode → buttery smooth) forward to that chapter and
 * settles. Scrolling back up eases the time backward. Needs an all-intra encode
 * for clean seeking on reverse.
 *
 * Theme switching is a CROSSFADE, not a reload: the dark and light clips are
 * both mounted as stacked layers, driven by the SAME scroll logic so they hold
 * the identical frame, and a theme toggle only fades opacity between them. The
 * clip never remounts on a theme change, so it does not restart from the top —
 * it simply recolours on the same frame. (The element only remounts when the
 * viewport crosses the wide/portrait breakpoint, which is rare.)
 *
 * Source axes:
 *   • viewport — a wide 16:9 clip fills desktop; a portrait clip suits mobile.
 *   • theme    — a light-background clip for light mode, dark for dark mode.
 * Missing variants fall back gracefully (light→dark, wide→portrait).
 */
const SECTIONS = ["hero", "about", "music", "stream", "schedule", "dubby", "contact"];
const FWD_RATE = 1.6; // play a touch faster so the "beat" lands quickly
const DESKTOP_MQ = "(min-width: 1024px)"; // matches Tailwind's lg breakpoint

const VIDEO_BASE =
    "absolute inset-0 h-full w-full object-cover [object-position:50%_20%] [filter:contrast(1.05)_saturate(0.96)_brightness(0.94)] lg:[object-position:50%_32%] transition-opacity duration-500 ease-out";

export default function ScrollVideo({
    darkPortrait,
    darkWide,
    lightPortrait,
    lightWide,
    behindParticles = false,
}: {
    /** Required dark portrait source — also the universal fallback. */
    darkPortrait: string;
    /** Wide (16:9) dark source for desktop. */
    darkWide?: string;
    /** Portrait light-mode source. */
    lightPortrait?: string;
    /** Wide light-mode source for desktop. */
    lightWide?: string;
    /**
     * When true, blend the clip so its uniform backdrop reveals the atmosphere
     * motes rendered behind it (lighten over the dark clip, darken over the
     * light clip), while the lit subject stays opaque.
     */
    behindParticles?: boolean;
}) {
    const { resolvedTheme } = useTheme();
    const darkRef = useRef<HTMLVideoElement>(null);
    const lightRef = useRef<HTMLVideoElement>(null);

    const [isWide, setIsWide] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia(DESKTOP_MQ);
        const apply = () => setIsWide(mq.matches);
        apply();
        mq.addEventListener("change", apply);
        return () => mq.removeEventListener("change", apply);
    }, []);

    // Only the active clip loads up front; the other mounts shortly after so the
    // initial paint isn't slowed by a second ~17MB download. By the time anyone
    // toggles the theme, both are mounted and frame-synced for a clean crossfade.
    const [armed, setArmed] = useState(false);
    useEffect(() => {
        const id = window.setTimeout(() => setArmed(true), 1500);
        return () => window.clearTimeout(id);
    }, []);

    // The two clips for the current viewport. They only change when the viewport
    // crosses the lg breakpoint (which legitimately remounts), NOT on theme.
    const darkSrc = isWide ? darkWide ?? darkPortrait : darkPortrait;
    const lightSrc = isWide
        ? lightWide ?? lightPortrait ?? darkWide ?? darkPortrait
        : lightPortrait ?? darkPortrait;
    const hasTwo = lightSrc !== darkSrc;
    const showLight = resolvedTheme === "light" && hasTwo;
    // Active clip mounts immediately; the standby mounts once armed.
    const mountDark = !showLight || armed;
    const mountLight = hasTwo && (showLight || armed);

    // Drive every mounted clip with one shared scroll loop so both layers hold
    // the same frame — making the crossfade a pure recolour.
    useEffect(() => {
        const vids = [darkRef.current, lightRef.current].filter(
            (v): v is HTMLVideoElement => !!v,
        );
        if (!vids.length) return;

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
            const loaded = vids.find((v) => v.duration > 0);
            if (loaded) {
                dur = loaded.duration;
                ready = true;
                computeActive();
            }
        };
        vids.forEach((v) => {
            v.muted = true;
            v.playbackRate = FWD_RATE;
            v.addEventListener("loadedmetadata", onMeta);
            // prime the decoder so the first frame is ready (skip if already
            // buffered, so a theme toggle doesn't re-prime the visible clip)
            if (v.readyState < 2) v.play().then(() => v.pause()).catch(() => void 0);
        });
        if (vids.some((v) => v.readyState >= 1)) onMeta();

        const onScroll = () => {
            if (ready) computeActive();
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        const tick = () => {
            raf = visible ? requestAnimationFrame(tick) : 0;
            if (!ready || !dur) return;
            for (const v of vids) {
                const now = v.currentTime;
                const diff = target - now;
                if (diff > 0.05) {
                    // forward → real playback to the chapter (smooth)
                    if (v.paused) v.play().catch(() => void 0);
                    if (v.playbackRate !== FWD_RATE) v.playbackRate = FWD_RATE;
                } else if (diff < -0.05) {
                    // backward → ease the time down (reverse isn't native)
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
            }
        };
        raf = requestAnimationFrame(tick);

        const onVis = () => {
            visible = !document.hidden;
            if (!visible) vids.forEach((v) => !v.paused && v.pause());
            if (visible && !raf) raf = requestAnimationFrame(tick);
        };
        document.addEventListener("visibilitychange", onVis);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            document.removeEventListener("visibilitychange", onVis);
            vids.forEach((v) => v.removeEventListener("loadedmetadata", onMeta));
        };
        // Re-init only when the mounted set changes (src swap or standby mount).
        // A plain theme toggle leaves both mounted → no re-init, pure crossfade.
    }, [darkSrc, lightSrc, mountDark, mountLight]);

    // Single-clip fallback (no distinct light variant): one element, theme blend.
    if (!hasTwo) {
        return (
            <video
                key={darkSrc}
                ref={darkRef}
                src={darkSrc}
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
                className={cn(
                    VIDEO_BASE,
                    "opacity-100",
                    behindParticles && "mix-blend-darken dark:mix-blend-lighten",
                )}
            />
        );
    }

    return (
        <>
            {mountDark && (
                <video
                    key={darkSrc}
                    ref={darkRef}
                    src={darkSrc}
                    muted
                    playsInline
                    preload="auto"
                    aria-hidden="true"
                    className={cn(
                        VIDEO_BASE,
                        showLight ? "opacity-0" : "opacity-100",
                        behindParticles && "mix-blend-lighten",
                    )}
                />
            )}
            {mountLight && (
                <video
                    key={lightSrc}
                    ref={lightRef}
                    src={lightSrc}
                    muted
                    playsInline
                    preload="auto"
                    aria-hidden="true"
                    className={cn(
                        VIDEO_BASE,
                        showLight ? "opacity-100" : "opacity-0",
                        behindParticles && "mix-blend-darken",
                    )}
                />
            )}
        </>
    );
}

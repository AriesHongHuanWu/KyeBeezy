"use client";

import { useEffect, useRef } from "react";

/**
 * Full-bleed background video driven by SECTIONS. Each section maps to a
 * chapter timestamp in the clip. When you scroll into a new section the video
 * actually PLAYS (native decode → buttery smooth) forward to that chapter and
 * settles — so arriving at a section feels like the visual switches to a new
 * look. Scrolling back up eases the time backward. Kept in colour with a light
 * cinematic grade. Needs an all-intra encode for clean seeking on reverse.
 */
const SECTIONS = ["hero", "about", "music", "stream", "schedule", "dubby", "contact"];
const FWD_RATE = 1.6; // play a touch faster so the "beat" lands quickly

export default function ScrollVideo({ src }: { src: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);

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
    }, [src]);

    return (
        <video
            ref={videoRef}
            src={src}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover [object-position:50%_18%] [filter:contrast(1.05)_saturate(0.96)_brightness(0.94)]"
        />
    );
}

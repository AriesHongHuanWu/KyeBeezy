"use client";

import { useEffect, useState } from "react";

/**
 * Returns true when the user has requested reduced motion at the OS level.
 * Use this to skip heavy animations / WebGL effects for accessibility.
 */
export function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReduced(mq.matches);
        update();
        mq.addEventListener?.("change", update);
        return () => mq.removeEventListener?.("change", update);
    }, []);

    return reduced;
}

/**
 * Coarse heuristic for "is this a low-power / mobile device" so we can dial
 * down particle counts and pixel ratio in the 3D scene.
 */
export function useIsLowPower(): boolean {
    const [low, setLow] = useState(false);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const coarse = window.matchMedia?.("(pointer: coarse)")?.matches;
        const narrow = window.innerWidth < 768;
        const fewCores = (navigator.hardwareConcurrency || 8) <= 4;
        const lowMem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
        setLow(Boolean(coarse || narrow || fewCores || (lowMem !== undefined && lowMem <= 4)));
    }, []);
    return low;
}

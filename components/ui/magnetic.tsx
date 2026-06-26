"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

/**
 * Magnetic wrapper — the child (a button / link) is pulled toward the cursor as
 * it approaches and lifts toward the viewer in 3D, snapping back on leave. Adds
 * a tactile, physical feel to primary CTAs. Pure transforms on one rAF; no-ops
 * under reduced motion and on touch.
 */
export function Magnetic({
    children,
    className,
    strength = 0.4,
    lift = 14,
}: {
    children: ReactNode;
    className?: string;
    /** How strongly the element follows the cursor (0..1). */
    strength?: number;
    /** translateZ lift toward the viewer, px. */
    lift?: number;
}) {
    const reduced = usePrefersReducedMotion();
    const ref = useRef<HTMLSpanElement>(null);
    const raf = useRef(0);
    const target = useRef({ x: 0, y: 0, on: false });
    const cur = useRef({ x: 0, y: 0, z: 0 });

    useEffect(() => {
        if (reduced) return;
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia?.("(pointer: coarse)")?.matches) return;

        const tick = () => {
            const tz = target.current.on ? lift : 0;
            cur.current.x += (target.current.x - cur.current.x) * 0.15;
            cur.current.y += (target.current.y - cur.current.y) * 0.15;
            cur.current.z += (tz - cur.current.z) * 0.15;
            el.style.transform = `perspective(600px) translate3d(${cur.current.x.toFixed(2)}px, ${cur.current.y.toFixed(2)}px, ${cur.current.z.toFixed(2)}px)`;
            const settled =
                Math.abs(target.current.x - cur.current.x) < 0.1 &&
                Math.abs(target.current.y - cur.current.y) < 0.1 &&
                Math.abs(tz - cur.current.z) < 0.1;
            raf.current = settled ? 0 : requestAnimationFrame(tick);
        };
        const wake = () => {
            if (!raf.current) raf.current = requestAnimationFrame(tick);
        };
        const onMove = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            target.current.x = (e.clientX - cx) * strength;
            target.current.y = (e.clientY - cy) * strength;
            target.current.on = true;
            wake();
        };
        const onLeave = () => {
            target.current.x = 0;
            target.current.y = 0;
            target.current.on = false;
            wake();
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return () => {
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerleave", onLeave);
            if (raf.current) cancelAnimationFrame(raf.current);
        };
    }, [reduced, strength, lift]);

    if (reduced) return <span className={cn("inline-flex", className)}>{children}</span>;

    return (
        <span
            ref={ref}
            className={cn("inline-flex will-change-transform", className)}
            style={{ transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)" }}
        >
            {children}
        </span>
    );
}

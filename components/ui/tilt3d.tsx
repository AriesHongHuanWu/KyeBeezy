"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

/**
 * Pointer-driven 3D tilt. Wraps any card / panel and tilts it on a perspective
 * plane toward the cursor, with a soft moving glare — so the glass surfaces feel
 * like they float above the background video. Pure CSS transforms (one rAF,
 * no React state per move) so it's cheap, and it no-ops under reduced motion.
 *
 * Tilt is also disabled on coarse pointers (touch) where there is no hover.
 */
export function Tilt3D({
    children,
    className,
    max = 7,
    scale = 1.02,
    glare = true,
    radiusClassName = "rounded-3xl",
}: {
    children: ReactNode;
    className?: string;
    /** Maximum tilt in degrees on each axis. */
    max?: number;
    /** Hover lift scale. */
    scale?: number;
    /** Show the moving sheen. */
    glare?: boolean;
    /** Corner radius utility for the glare so it matches the wrapped card. */
    radiusClassName?: string;
}) {
    const reduced = usePrefersReducedMotion();
    const wrapRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const glareRef = useRef<HTMLDivElement>(null);
    const raf = useRef(0);
    const next = useRef<{ rx: number; ry: number; gx: number; gy: number; on: boolean } | null>(null);

    useEffect(() => {
        if (reduced) return;
        const wrap = wrapRef.current;
        const inner = innerRef.current;
        if (!wrap || !inner) return;

        // Skip on devices without a fine hover pointer (touch) — no cursor to follow.
        if (window.matchMedia?.("(pointer: coarse)")?.matches) return;

        const apply = () => {
            raf.current = 0;
            const n = next.current;
            if (!n) return;
            if (n.on) {
                inner.style.transform = `perspective(1100px) rotateX(${n.rx.toFixed(2)}deg) rotateY(${n.ry.toFixed(2)}deg) scale(${scale})`;
                if (glareRef.current) {
                    glareRef.current.style.opacity = "1";
                    glareRef.current.style.background = `radial-gradient(40% 60% at ${n.gx.toFixed(1)}% ${n.gy.toFixed(1)}%, rgba(255,255,255,0.16), transparent 70%)`;
                }
            } else {
                inner.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) scale(1)";
                if (glareRef.current) glareRef.current.style.opacity = "0";
            }
        };
        const schedule = () => {
            if (!raf.current) raf.current = requestAnimationFrame(apply);
        };

        const onMove = (e: PointerEvent) => {
            const r = wrap.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width; // 0..1
            const py = (e.clientY - r.top) / r.height;
            next.current = {
                ry: (px - 0.5) * 2 * max,
                rx: -(py - 0.5) * 2 * max,
                gx: px * 100,
                gy: py * 100,
                on: true,
            };
            schedule();
        };
        const onLeave = () => {
            next.current = { rx: 0, ry: 0, gx: 50, gy: 50, on: false };
            schedule();
        };

        wrap.addEventListener("pointermove", onMove);
        wrap.addEventListener("pointerleave", onLeave);
        return () => {
            wrap.removeEventListener("pointermove", onMove);
            wrap.removeEventListener("pointerleave", onLeave);
            if (raf.current) cancelAnimationFrame(raf.current);
        };
    }, [reduced, max, scale]);

    if (reduced) return <div className={className}>{children}</div>;

    return (
        <div ref={wrapRef} className={cn("[transform-style:preserve-3d]", className)}>
            <div
                ref={innerRef}
                className="relative h-full transition-transform duration-300 ease-out will-change-transform [transform:perspective(1100px)]"
            >
                {children}
                {glare && (
                    <div
                        ref={glareRef}
                        aria-hidden
                        className={cn(
                            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
                            radiusClassName,
                        )}
                        style={{ mixBlendMode: "soft-light" }}
                    />
                )}
            </div>
        </div>
    );
}

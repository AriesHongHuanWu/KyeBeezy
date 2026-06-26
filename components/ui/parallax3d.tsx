"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

/**
 * Pointer-driven 3D parallax stage. The content lives on a `preserve-3d` plane
 * that tilts toward the cursor; children wrapped in <ParallaxLayer depth>
 * sit at different Z depths, so they separate in space as the stage tilts —
 * turning a flat hero into a 3D diorama in front of the background video.
 *
 * No-ops under reduced motion and on coarse (touch) pointers.
 */
export function Parallax3D({
    children,
    className,
    stageClassName,
    max = 7,
}: {
    children: ReactNode;
    className?: string;
    /** Classes for the tilting stage (e.g. flex layout for the content). */
    stageClassName?: string;
    /** Maximum tilt in degrees on each axis. */
    max?: number;
}) {
    const reduced = usePrefersReducedMotion();
    const rootRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const raf = useRef(0);
    const target = useRef({ x: 0, y: 0 });
    const cur = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (reduced) return;
        const root = rootRef.current;
        const stage = stageRef.current;
        if (!root || !stage) return;
        if (window.matchMedia?.("(pointer: coarse)")?.matches) return;

        const tick = () => {
            cur.current.x += (target.current.x - cur.current.x) * 0.08;
            cur.current.y += (target.current.y - cur.current.y) * 0.08;
            const rx = (-cur.current.y * max).toFixed(2);
            const ry = (cur.current.x * max).toFixed(2);
            stage.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
            stage.style.setProperty("--mx", cur.current.x.toFixed(3));
            stage.style.setProperty("--my", cur.current.y.toFixed(3));
            if (
                Math.abs(target.current.x - cur.current.x) > 0.001 ||
                Math.abs(target.current.y - cur.current.y) > 0.001
            ) {
                raf.current = requestAnimationFrame(tick);
            } else {
                raf.current = 0;
            }
        };
        const wake = () => {
            if (!raf.current) raf.current = requestAnimationFrame(tick);
        };
        const onMove = (e: PointerEvent) => {
            target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
            target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
            wake();
        };
        const onLeave = () => {
            target.current.x = 0;
            target.current.y = 0;
            wake();
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerleave", onLeave);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerleave", onLeave);
            if (raf.current) cancelAnimationFrame(raf.current);
        };
    }, [reduced, max]);

    if (reduced)
        return (
            <div className={className}>
                <div className={stageClassName}>{children}</div>
            </div>
        );

    return (
        <div ref={rootRef} className={cn("[perspective:1100px]", className)}>
            <div
                ref={stageRef}
                className={cn(
                    "relative [transform-style:preserve-3d] will-change-transform",
                    stageClassName,
                )}
                style={{ transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)" }}
            >
                {children}
            </div>
        </div>
    );
}

/**
 * A depth plane inside <Parallax3D>. `depth` pushes it toward the viewer (px of
 * translateZ); a higher depth parallaxes more as the stage tilts. `shift` adds
 * an extra pointer-linked translate for stronger separation.
 */
export function ParallaxLayer({
    children,
    className,
    depth = 0,
    shift = 0,
    style,
}: {
    children: ReactNode;
    className?: string;
    /** translateZ in px (toward viewer). */
    depth?: number;
    /** extra pointer-linked translate in px. */
    shift?: number;
    style?: CSSProperties;
}) {
    const transform = shift
        ? `translate3d(calc(var(--mx,0) * ${shift}px), calc(var(--my,0) * ${shift}px), ${depth}px)`
        : `translateZ(${depth}px)`;
    return (
        <div className={className} style={{ transform, ...style }}>
            {children}
        </div>
    );
}

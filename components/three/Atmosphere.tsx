"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Lightweight WebGL "atmosphere" — a field of soft, brand-tinted bokeh motes
 * floating in 3D depth in front of the background video. Adds parallax depth as
 * the visitor moves the pointer and scrolls (the camera dollies through the
 * field), so the page reads as a 3D space rather than a flat clip.
 *
 * Additive blending means it glows over the dark theme and all but disappears
 * over the light clip (which keeps light mode clean — by design).
 *
 * Performance: one draw call (THREE.Points), capped DPR, paused when the tab is
 * hidden. The caller should only mount it on capable devices (desktop, motion
 * allowed, not low-power) — see HeroBackground.
 */
export default function Atmosphere({ lowPower = false }: { lowPower?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let disposed = false;
        let raf = 0;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(0, 0, 10);

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({
                antialias: false,
                alpha: true,
                powerPreference: "high-performance",
            });
        } catch {
            return; // WebGL unavailable — the page is fine without it.
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1 : 1.5));
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        // ---- Soft round sprite (radial gradient → texture) for bokeh motes ----
        const sprite = (() => {
            const c = document.createElement("canvas");
            c.width = c.height = 64;
            const ctx = c.getContext("2d")!;
            const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            g.addColorStop(0, "rgba(255,255,255,1)");
            g.addColorStop(0.35, "rgba(255,255,255,0.55)");
            g.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 64, 64);
            const tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            return tex;
        })();

        // ---- Particle field ----
        const COUNT = lowPower ? 220 : 460;
        const positions = new Float32Array(COUNT * 3);
        const colors = new Float32Array(COUNT * 3);
        const drift = new Float32Array(COUNT); // per-mote phase for gentle bob
        const palette = [
            new THREE.Color(0xa855f7),
            new THREE.Color(0xec4899),
            new THREE.Color(0x8b5cf6),
            new THREE.Color(0xc4b5fd),
        ];
        const SPAN_X = 26;
        const SPAN_Y = 18;
        const Z_NEAR = 4;
        const Z_FAR = -22;
        for (let i = 0; i < COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * SPAN_X;
            positions[i * 3 + 1] = (Math.random() - 0.5) * SPAN_Y;
            positions[i * 3 + 2] = Z_NEAR + Math.random() * (Z_FAR - Z_NEAR);
            drift[i] = Math.random() * Math.PI * 2;
            const col = palette[i % palette.length];
            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.6,
            map: sprite,
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            depthTest: false,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
        });
        const points = new THREE.Points(geo, mat);
        scene.add(points);

        // ---- Pointer + scroll state (eased) ----
        const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
        const scrollT = { v: 0, t: 0 };
        const onPointer = (e: PointerEvent) => {
            ptr.tx = (e.clientX / window.innerWidth - 0.5) * 2;
            ptr.ty = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        const onScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            scrollT.t = max > 0 ? window.scrollY / max : 0;
        };
        const onResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener("pointermove", onPointer, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);
        onScroll();

        let visible = !document.hidden;
        const onVisibility = () => {
            visible = !document.hidden;
            if (visible && !raf) raf = requestAnimationFrame(animate);
        };
        document.addEventListener("visibilitychange", onVisibility);

        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        const clock = new THREE.Clock();
        const basePos = positions.slice();

        function animate() {
            raf = visible ? requestAnimationFrame(animate) : 0;
            const t = clock.elapsedTime;
            const dt = Math.min(clock.getDelta(), 0.05);

            ptr.x = lerp(ptr.x, ptr.tx, 0.04);
            ptr.y = lerp(ptr.y, ptr.ty, 0.04);
            scrollT.v = lerp(scrollT.v, scrollT.t, 0.05);

            // Camera parallax (pointer) + a slow dolly through the field (scroll).
            camera.position.x = ptr.x * 1.4;
            camera.position.y = -ptr.y * 0.9;
            camera.position.z = 10 - scrollT.v * 9;
            camera.lookAt(0, 0, -4);

            // Gentle per-mote bob so the field feels alive (cheap: y only).
            const arr = geo.attributes.position.array as Float32Array;
            for (let i = 0; i < COUNT; i++) {
                arr[i * 3 + 1] = basePos[i * 3 + 1] + Math.sin(t * 0.4 + drift[i]) * 0.35;
            }
            geo.attributes.position.needsUpdate = true;

            points.rotation.z += dt * 0.008;

            renderer.render(scene, camera);
        }
        raf = requestAnimationFrame(animate);

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            window.removeEventListener("pointermove", onPointer);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            document.removeEventListener("visibilitychange", onVisibility);
            geo.dispose();
            mat.dispose();
            sprite.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === container) {
                container.removeChild(renderer.domElement);
            }
            void disposed;
        };
    }, [lowPower]);

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
        />
    );
}

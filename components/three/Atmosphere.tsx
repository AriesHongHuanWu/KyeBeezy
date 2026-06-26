"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";

/**
 * Lightweight WebGL "atmosphere" — soft monochrome motes + wireframe crystals
 * floating in 3D depth. It renders BEHIND the background video; the video is
 * given a lighten/darken blend (see ScrollVideo) so its near-uniform backdrop
 * lets these motes show through while the lit subject occludes them — the motes
 * read as depth *behind the person*.
 *
 * Colour is monochrome and tuned to the theme: a dim grey that the dark clip
 * reveals via `lighten`, and a light grey that the light clip reveals via
 * `darken`. Pointer + scroll dolly the camera through the field for parallax.
 *
 * Performance: a couple of draw calls, capped DPR, paused when the tab is
 * hidden. Mounted only on capable devices (see HeroBackground).
 */
export default function Atmosphere({ lowPower = false }: { lowPower?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { resolvedTheme } = useTheme();
    const dark = resolvedTheme !== "light"; // defaultTheme is "dark"

    const moteMatRef = useRef<THREE.PointsMaterial | null>(null);
    const crystalMatRef = useRef<THREE.LineBasicMaterial | null>(null);

    // Keep the monochrome tint in sync with the theme without rebuilding the
    // scene. Dim grey for dark mode (revealed by `lighten`), light grey for
    // light mode (revealed by `darken`).
    useEffect(() => {
        const mote = dark ? 0x8a8a8a : 0xb6b6b6;
        const crystal = dark ? 0x6e6e6e : 0xc6c6c6;
        moteMatRef.current?.color.setHex(mote);
        crystalMatRef.current?.color.setHex(crystal);
    }, [dark]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

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
            g.addColorStop(0.35, "rgba(255,255,255,0.5)");
            g.addColorStop(1, "rgba(255,255,255,0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, 64, 64);
            const tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            return tex;
        })();

        // ---- Particle field (monochrome — material colour set by theme) ----
        const COUNT = lowPower ? 220 : 460;
        const positions = new Float32Array(COUNT * 3);
        const drift = new Float32Array(COUNT);
        const SPAN_X = 26;
        const SPAN_Y = 18;
        const Z_NEAR = 4;
        const Z_FAR = -22;
        for (let i = 0; i < COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * SPAN_X;
            positions[i * 3 + 1] = (Math.random() - 0.5) * SPAN_Y;
            positions[i * 3 + 2] = Z_NEAR + Math.random() * (Z_FAR - Z_NEAR);
            drift[i] = Math.random() * Math.PI * 2;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            size: 0.62,
            map: sprite,
            color: dark ? 0x8a8a8a : 0xb6b6b6,
            transparent: true,
            opacity: 0.55,
            depthWrite: false,
            depthTest: false,
            sizeAttenuation: true,
            blending: THREE.NormalBlending,
        });
        moteMatRef.current = mat;
        const points = new THREE.Points(geo, mat);
        scene.add(points);

        // ---- Floating wireframe "crystals" — monochrome lattice with depth ----
        const crystalMat = new THREE.LineBasicMaterial({
            color: dark ? 0x6e6e6e : 0xc6c6c6,
            transparent: true,
            opacity: 0.3,
            depthWrite: false,
            depthTest: false,
        });
        crystalMatRef.current = crystalMat;
        const crystalDefs = [
            { r: 1.7, x: -8.5, y: 3.4, z: -10, sx: 0.18, sy: 0.26, ph: 0.0 },
            { r: 2.6, x: 9.5, y: -2.6, z: -15, sx: -0.12, sy: 0.15, ph: 1.4 },
            { r: 1.1, x: 6.0, y: 4.6, z: -7, sx: 0.24, sy: -0.2, ph: 2.6 },
            { r: 3.2, x: -10.5, y: -4.2, z: -19, sx: 0.08, sy: 0.11, ph: 3.7 },
            { r: 0.9, x: -3.5, y: -5.2, z: -6, sx: -0.22, sy: 0.3, ph: 5.1 },
        ];
        const crystalGeos: THREE.BufferGeometry[] = [];
        const crystals = crystalDefs.map((d) => {
            const ico = new THREE.IcosahedronGeometry(d.r, 0);
            const edges = new THREE.EdgesGeometry(ico);
            ico.dispose();
            crystalGeos.push(edges);
            const ls = new THREE.LineSegments(edges, crystalMat);
            ls.position.set(d.x, d.y, d.z);
            ls.userData = { sx: d.sx, sy: d.sy, baseY: d.y, ph: d.ph };
            scene.add(ls);
            return ls;
        });

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

            camera.position.x = ptr.x * 1.4;
            camera.position.y = -ptr.y * 0.9;
            camera.position.z = 10 - scrollT.v * 9;
            camera.lookAt(0, 0, -4);

            const arr = geo.attributes.position.array as Float32Array;
            for (let i = 0; i < COUNT; i++) {
                arr[i * 3 + 1] = basePos[i * 3 + 1] + Math.sin(t * 0.4 + drift[i]) * 0.35;
            }
            geo.attributes.position.needsUpdate = true;

            points.rotation.z += dt * 0.008;

            for (const c of crystals) {
                const u = c.userData as { sx: number; sy: number; baseY: number; ph: number };
                c.rotation.x += dt * u.sx;
                c.rotation.y += dt * u.sy;
                c.position.y = u.baseY + Math.sin(t * 0.3 + u.ph) * 0.5;
            }

            renderer.render(scene, camera);
        }
        raf = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("pointermove", onPointer);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            document.removeEventListener("visibilitychange", onVisibility);
            moteMatRef.current = null;
            crystalMatRef.current = null;
            geo.dispose();
            mat.dispose();
            sprite.dispose();
            crystalGeos.forEach((g) => g.dispose());
            crystalMat.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode === container) {
                container.removeChild(renderer.domElement);
            }
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

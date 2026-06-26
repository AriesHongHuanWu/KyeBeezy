"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Mode = "glb" | "video" | "image";

/**
 * Scroll-driven 3D hero. As the visitor scrolls the page, the camera moves
 * through a sequence of "shots" (angles) around the subject.
 *
 * Asset priority (drop files in /public to upgrade — no code change needed):
 *   1. /models/kye.glb        → true 3D model, real orbit camera
 *   2. /hero/turntable.mp4    → 360° turntable video, scrubbed by scroll
 *   3. /kye-cutout-new.png    → 2.5D cutout fallback (parallax + dolly)
 *
 * See docs/3D_ASSET_GUIDE.md for how to generate kye.glb / turntable.mp4.
 */

// Camera shots in spherical coords around the subject. Scroll lerps between them.
type Shot = { az: number; polar: number; dist: number; targetY: number; fov: number };
const SHOTS: Shot[] = [
    { az: 0, polar: 82, dist: 4.4, targetY: 0.05, fov: 34 }, // hero — front, slightly high
    { az: -30, polar: 74, dist: 3.7, targetY: 0.1, fov: 32 }, // about — orbit left, closer
    { az: 28, polar: 92, dist: 4.1, targetY: 0.0, fov: 36 }, // music — orbit right, eye level
    { az: 52, polar: 68, dist: 5.0, targetY: 0.15, fov: 30 }, // stream — pull back, high
    { az: -14, polar: 86, dist: 3.3, targetY: 0.05, fov: 38 }, // close front
    { az: 0, polar: 80, dist: 4.6, targetY: 0.1, fov: 33 }, // wide outro
];

const deg = (d: number) => (d * Math.PI) / 180;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function sampleShots(p: number): Shot {
    const seg = p * (SHOTS.length - 1);
    const i = Math.min(SHOTS.length - 2, Math.floor(seg));
    const t = smooth(clamp01(seg - i));
    const a = SHOTS[i];
    const b = SHOTS[i + 1];
    return {
        az: lerp(a.az, b.az, t),
        polar: lerp(a.polar, b.polar, t),
        dist: lerp(a.dist, b.dist, t),
        targetY: lerp(a.targetY, b.targetY, t),
        fov: lerp(a.fov, b.fov, t),
    };
}

async function detectAsset(): Promise<{ mode: Mode; url: string }> {
    const candidates: { mode: Mode; url: string }[] = [
        { mode: "glb", url: "/models/kye.glb" },
        { mode: "video", url: "/hero/turntable.mp4" },
        { mode: "video", url: "/hero/turntable.webm" },
        { mode: "image", url: "/kye-cutout-new.png" },
    ];
    for (const c of candidates) {
        try {
            const r = await fetch(c.url, { method: "HEAD" });
            const ct = r.headers.get("content-type") || "";
            if (r.ok && !ct.includes("text/html")) return c;
        } catch {
            /* keep trying */
        }
    }
    return { mode: "image", url: "/kye-cutout-new.png" };
}

export default function HeroScene({ lowPower = false }: { lowPower?: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let disposed = false;
        let raf = 0;
        const disposables: Array<{ dispose: () => void }> = [];

        let width = container.clientWidth || window.innerWidth;
        let height = container.clientHeight || window.innerHeight;

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x05010a, 0.085);

        const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
        camera.position.set(0, 0.3, 4.4);

        let renderer: THREE.WebGLRenderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: true, powerPreference: "high-performance" });
        } catch {
            return; // WebGL unavailable — CSS fallback handles visuals
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.5 : 2));
        renderer.setSize(width, height);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);

        // ---- Lighting (brand-tinted three-point) ----
        scene.add(new THREE.AmbientLight(0x6b4bff, 0.55));
        const key = new THREE.DirectionalLight(0xb98bff, 2.4);
        key.position.set(3, 4, 5);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xff5fa8, 1.3);
        fill.position.set(-4, 1, 2);
        scene.add(fill);
        const rim = new THREE.DirectionalLight(0xffffff, 2.0);
        rim.position.set(-2, 3, -5);
        scene.add(rim);
        const hemi = new THREE.HemisphereLight(0x9b6bff, 0x100018, 0.6);
        scene.add(hemi);

        // ---- Particle field for depth ----
        const particleCount = lowPower ? 280 : 900;
        const positions = new Float32Array(particleCount * 3);
        const palette = [new THREE.Color(0xa855f7), new THREE.Color(0xec4899), new THREE.Color(0x6366f1)];
        const colors = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const r = 6 + Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
            positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 4;
            const c = palette[i % palette.length];
            colors[i * 3] = c.r;
            colors[i * 3 + 1] = c.g;
            colors[i * 3 + 2] = c.b;
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        const pMat = new THREE.PointsMaterial({
            size: 0.045,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
        const points = new THREE.Points(pGeo, pMat);
        scene.add(points);
        disposables.push(pGeo, pMat);

        // The subject root — everything we orbit around.
        const subject = new THREE.Group();
        scene.add(subject);
        let subjectIsModel = false;
        let isVideo = false;
        let videoEl: HTMLVideoElement | null = null;
        let videoTex: THREE.VideoTexture | null = null;
        let videoDuration = 0;

        // ---- Scroll + pointer state ----
        const target = { progress: 0 };
        const current = { progress: 0, video: 0 };
        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

        const onScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            target.progress = max > 0 ? clamp01(window.scrollY / max) : 0;
        };
        const onPointer = (e: PointerEvent) => {
            pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
            pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        const onResize = () => {
            width = container.clientWidth || window.innerWidth;
            height = container.clientHeight || window.innerHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("pointermove", onPointer, { passive: true });
        window.addEventListener("resize", onResize);
        onScroll();

        // Pause rendering when tab is hidden (battery / perf).
        let visible = !document.hidden;
        const onVisibility = () => {
            visible = !document.hidden;
            if (visible && !raf) raf = requestAnimationFrame(animate);
        };
        document.addEventListener("visibilitychange", onVisibility);

        // ---- Load the subject asset ----
        const buildImagePlane = (url: string) => {
            const loader = new THREE.TextureLoader();
            loader.load(url, (tex) => {
                if (disposed) return;
                tex.colorSpace = THREE.SRGBColorSpace;
                const img = tex.image as { width: number; height: number };
                const aspect = img && img.width ? img.width / img.height : 0.66;
                const h = 3.4;
                const w = h * aspect;
                const geo = new THREE.PlaneGeometry(w, h);
                const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
                const plane = new THREE.Mesh(geo, mat);
                plane.position.y = -0.1;
                subject.add(plane);
                disposables.push(geo, mat, tex);
            });
        };

        const buildVideo = (url: string) => {
            const v = document.createElement("video");
            v.src = url;
            v.crossOrigin = "anonymous";
            v.muted = true;
            v.loop = false;
            v.playsInline = true;
            v.preload = "auto";
            videoEl = v;
            const tex = new THREE.VideoTexture(v);
            tex.colorSpace = THREE.SRGBColorSpace;
            videoTex = tex;
            v.addEventListener("loadedmetadata", () => {
                videoDuration = v.duration || 0;
                isVideo = true;
                const aspect = v.videoWidth ? v.videoWidth / v.videoHeight : 0.5625;
                const h = 4.8;
                const w = h * aspect;
                const geo = new THREE.PlaneGeometry(w, h);
                // The generated clip sits on a dark charcoal stage with a vignette
                // (not pure black), so instead of keying we feather the plane edges
                // and fade the darkest pixels — the backdrop melts into the page.
                const mat = new THREE.ShaderMaterial({
                    uniforms: { map: { value: tex } },
                    transparent: true,
                    depthWrite: false,
                    vertexShader: `
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }`,
                    fragmentShader: `
                        uniform sampler2D map;
                        varying vec2 vUv;
                        void main() {
                            vec4 c = texture2D(map, vUv);
                            float ex = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x);
                            float ey = smoothstep(0.0, 0.10, vUv.y) * smoothstep(1.0, 0.93, vUv.y);
                            float edge = ex * ey;
                            float luma = max(c.r, max(c.g, c.b));
                            float dark = smoothstep(0.02, 0.11, luma);
                            float a = edge * dark;
                            if (a <= 0.004) discard;
                            gl_FragColor = vec4(c.rgb, a);
                        }`,
                });
                const plane = new THREE.Mesh(geo, mat);
                subject.add(plane);
                disposables.push(geo, mat, tex);
            });
            v.play().catch(() => void 0); // some browsers need a play() to decode frames; we pause immediately
            v.pause();
        };

        const loadGlb = async (url: string) => {
            try {
                const mod = await import("three/examples/jsm/loaders/GLTFLoader.js");
                if (disposed) return;
                const loader = new mod.GLTFLoader();
                loader.load(
                    url,
                    (gltf) => {
                        if (disposed) return;
                        const model = gltf.scene;
                        // center + scale to a consistent height (~3 units)
                        const box = new THREE.Box3().setFromObject(model);
                        const size = new THREE.Vector3();
                        const center = new THREE.Vector3();
                        box.getSize(size);
                        box.getCenter(center);
                        const scale = 3 / (size.y || 1);
                        model.scale.setScalar(scale);
                        model.position.sub(center.multiplyScalar(scale));
                        model.position.y += 0.2;
                        subject.add(model);
                        subjectIsModel = true;
                    },
                    undefined,
                    () => buildImagePlane("/kye-cutout-new.png"),
                );
            } catch {
                buildImagePlane("/kye-cutout-new.png");
            }
        };

        detectAsset().then(({ mode, url }) => {
            if (disposed) return;
            if (mode === "glb") loadGlb(url);
            else if (mode === "video") buildVideo(url);
            else buildImagePlane(url);
        });

        // ---- Animation loop ----
        const clock = new THREE.Clock();
        const animate = () => {
            raf = visible ? requestAnimationFrame(animate) : 0;
            const dt = Math.min(clock.getDelta(), 0.05);
            const t = clock.elapsedTime;

            // ease scroll + pointer
            current.progress = lerp(current.progress, target.progress, 0.06);
            // Video scrub tracks scroll more tightly for a crisp, silky scrub.
            current.video = lerp(current.video, target.progress, 0.18);
            pointer.x = lerp(pointer.x, pointer.tx, 0.05);
            pointer.y = lerp(pointer.y, pointer.ty, 0.05);

            if (isVideo) {
                // The video already contains the performance/rotation — keep a
                // steady frontal camera with subtle parallax + a gentle push-in.
                const dist = 4.4 - current.progress * 0.5;
                camera.position.set(pointer.x * 0.22, 0.05 - pointer.y * 0.12 + Math.sin(t * 0.5) * 0.025, dist);
                camera.lookAt(0, 0, 0);
                if (Math.abs(camera.fov - 42) > 0.05) {
                    camera.fov = lerp(camera.fov, 42, 0.1);
                    camera.updateProjectionMatrix();
                }
            } else {
                const shot = sampleShots(current.progress);
                const az = deg(shot.az) + pointer.x * 0.18;
                const polar = deg(shot.polar) - pointer.y * 0.1;
                const dist = shot.dist;
                const ty = shot.targetY;

                // spherical → cartesian around (0, ty, 0)
                const sinP = Math.sin(polar);
                camera.position.set(dist * sinP * Math.sin(az), ty + dist * Math.cos(polar) + Math.sin(t * 0.6) * 0.04, dist * sinP * Math.cos(az));
                camera.lookAt(0, ty, 0);
                if (Math.abs(camera.fov - shot.fov) > 0.01) {
                    camera.fov = lerp(camera.fov, shot.fov, 0.1);
                    camera.updateProjectionMatrix();
                }
            }

            // subject behavior per mode
            if (subjectIsModel) {
                subject.rotation.y = Math.sin(t * 0.25) * 0.08; // gentle idle sway
            } else if (videoTex && videoEl && videoDuration) {
                // scrub the turntable by scroll → looks like the camera orbits
                videoEl.currentTime = clamp01(current.progress) * (videoDuration - 0.05);
                videoTex.needsUpdate = true;
            } else {
                // 2.5D cutout: face the camera but tilt subtly so it never reads as flat
                subject.rotation.y = lerp(-0.18, 0.18, current.progress) + pointer.x * 0.06;
                subject.rotation.x = pointer.y * 0.04;
                subject.position.y = Math.sin(t * 0.8) * 0.04;
            }

            points.rotation.y += dt * 0.02;
            points.rotation.x = Math.sin(t * 0.1) * 0.05;

            renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(animate);

        // ---- Cleanup ----
        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("pointermove", onPointer);
            window.removeEventListener("resize", onResize);
            document.removeEventListener("visibilitychange", onVisibility);
            if (videoEl) {
                videoEl.pause();
                videoEl.src = "";
                videoEl.load();
            }
            scene.traverse((obj) => {
                const mesh = obj as THREE.Mesh;
                if (mesh.geometry) mesh.geometry.dispose?.();
                const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
                if (Array.isArray(m)) m.forEach((mm) => mm.dispose?.());
                else m?.dispose?.();
            });
            disposables.forEach((d) => d.dispose?.());
            renderer.dispose();
            if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
        };
    }, [lowPower]);

    return <div ref={containerRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
}

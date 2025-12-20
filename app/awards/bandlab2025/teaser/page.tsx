"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Volume2, VolumeX, SkipForward, Globe, Trophy, Sparkles } from "lucide-react";
import Link from "next/link";
import { getAwardsData, CategoryData } from "../../data-fetcher";
import { Confetti } from "@/components/ui/confetti";

// --- CONFIG ---
// A more dramatic, driving electronic track placeholder
const AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

// --- 3D MATH UTILS ---
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// --- SUB-COMPONENTS ---

// 1. DATA GLOBE (Scene 1)
const DataGlobe = () => {
    // Generate points on a sphere
    const points = useMemo(() => {
        const p = [];
        const count = 100;
        const offset = 2 / count;
        const increment = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < count; i++) {
            const y = ((i * offset) - 1) + (offset / 2);
            const r = Math.sqrt(1 - Math.pow(y, 2));
            const phi = ((i + 1) % count) * increment;
            const x = Math.cos(phi) * r;
            const z = Math.sin(phi) * r;
            p.push({ x: x * 300, y: y * 300, z: z * 300 });
        }
        return p;
    }, []);

    return (
        <div className="absolute inset-0 flex items-center justify-center perspective-1000">
            <motion.div
                className="relative w-0 h-0 transform-3d"
                animate={{ rotateY: 360, rotateZ: 10 }}
                transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {points.map((pt, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-500 rounded-full"
                        style={{
                            transform: `translate3d(${pt.x}px, ${pt.y}px, ${pt.z}px)`
                        }}
                    />
                ))}

                {/* Core Core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-500/10 rounded-full blur-xl" />
            </motion.div>

            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter text-center leading-none mix-blend-difference">
                    UNLIMITED<br />CREATIVITY
                </h1>
            </div>
        </div>
    );
};

// 2. CATEGORY TUNNEL (Scene 2)
const CategoryTunnel = ({ categories }: { categories: CategoryData[] }) => {
    return (
        <div className="absolute inset-0 bg-black perspective-500 overflow-hidden">
            {categories.slice(0, 10).map((cat, i) => (
                <motion.div
                    key={cat.id}
                    className="absolute top-1/2 left-1/2 flex items-center justify-center w-[80vw]"
                    initial={{ z: -1000, opacity: 0, scale: 0 }}
                    animate={{ z: 500, opacity: [0, 1, 0], scale: 1 }}
                    transition={{
                        duration: 3,
                        delay: i * 0.8, // Stagger flyby
                        ease: "linear"
                    }}
                    style={{
                        x: "-50%", y: "-50%",
                        marginLeft: i % 2 === 0 ? "-200px" : "200px" // Zig Zag
                    }}
                >
                    <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-600 uppercase italic tracking-tighter whitespace-nowrap">
                        {cat.title}
                    </h2>
                </motion.div>
            ))}

            {/* Speed Lines */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay animate-pulse" />
        </div>
    );
};

// 3. THE RITUAL (Scene 3)
const RitualScene = () => {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black perspective-1000">
            <motion.div
                className="w-64 h-96 bg-black border-2 border-yellow-500 relative"
                initial={{ rotateY: 0, scale: 0.8 }}
                animate={{
                    rotateY: [0, 3600], // Spin fast
                    scale: [0.8, 0.5], // Shrink
                    filter: ["brightness(1)", "brightness(5)"] // Glow up
                }}
                transition={{ duration: 3, ease: "circIn" }}
                style={{ transformStyle: "preserve-3d" }}
            >
                <div className="absolute inset-0 bg-yellow-500/20 blur-lg" />
            </motion.div>

            {/* Implode Particles */}
            <motion.div
                className="absolute inset-0 border-[100px] border-yellow-500 rounded-full"
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 0, opacity: 1 }}
                transition={{ duration: 2.5, ease: "expoIn", delay: 0.5 }}
            />
        </div>
    );
};

// 4. THE REVEAL (Scene 4)
const RevealScene = () => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white animate-in fade-in duration-300">
            {/* Flash Fade Out */}
            <motion.div
                className="absolute inset-0 bg-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1, delay: 0.2 }}
            />

            <div className="relative z-10 flex flex-col items-center mix-blend-difference">
                <Confetti isActive={true} />

                <motion.div
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.3, delay: 0.3 }}
                >
                    <img
                        src="/bandlab-logo.png"
                        alt="Bandlab"
                        className="w-32 h-32 md:w-48 md:h-48 object-contain mb-6 invert"
                    />
                </motion.div>

                <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter mb-2">
                    KYEBEEZY
                </h1>
                <p className="text-2xl font-bold text-white/50 tracking-[1em]">
                    X BANDLAB
                </p>

                <div className="mt-12 flex flex-col md:flex-row gap-6 items-center">
                    <Link href="/awards/bandlab2025/live">
                        <motion.button
                            className="px-10 py-4 bg-yellow-500 text-black font-black uppercase tracking-widest text-xl hover:scale-105 transition-transform"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            Enter Live Event
                        </motion.button>
                    </Link>
                </div>
            </div>
        </div>
    );
};


// --- CONTROLLER ---

export default function TeaserPageV4() {
    const [started, setStarted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [muted, setMuted] = useState(false);

    // Timeline
    const [scene, setScene] = useState(-1); // 0:Globe, 1:Tunnel, 2:Ritual, 3:Reveal

    // Data
    const [categories, setCategories] = useState<CategoryData[]>([]);

    useEffect(() => {
        // Fetch Real Data
        getAwardsData().then(data => setCategories(data));
    }, []);

    useEffect(() => {
        if (!started) return;

        // Play Audio
        if (audioRef.current) {
            audioRef.current.muted = muted;
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }

        // Timeline Sequence
        const timeline = [
            { time: 0, scene: 0 },       // 0s: Globe (Scale)
            { time: 4000, scene: 1 },    // 4s: Tunnel (Categories)
            { time: 10000, scene: 2 },   // 10s: Ritual (Build Up)
            { time: 13000, scene: 3 },   // 13s: Reveal (Drop)
        ];

        let timers: NodeJS.Timeout[] = [];
        timeline.forEach(item => {
            timers.push(setTimeout(() => setScene(item.scene), item.time));
        });

        return () => timers.forEach(clearTimeout);
    }, [started]);

    // Mute Sync
    useEffect(() => {
        if (audioRef.current) audioRef.current.muted = muted;
    }, [muted]);

    // --- RENDER ---

    if (!started) {
        return (
            <div onClick={() => setStarted(true)} className="h-screen w-screen bg-black flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-900 transition-colors">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center animate-pulse mb-6 border border-white/20">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
                <h1 className="text-white font-bold tracking-[0.5em] text-sm uppercase">Initialize Experience</h1>
                <p className="text-neutral-500 text-xs mt-2 uppercase">Audio Recommended</p>
                <audio ref={audioRef} src={AUDIO_URL} preload="auto" />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative font-sans">
            {/* Controls */}
            <div className="absolute top-6 right-6 z-[100] flex gap-4 mix-blend-difference">
                <button onClick={() => setMuted(!muted)} className="text-white/50 hover:text-white transition-colors">
                    {muted ? <VolumeX /> : <Volume2 />}
                </button>
                <button onClick={() => { setStarted(false); setScene(-1); }} className="text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest">
                    Replay
                </button>
            </div>

            {/* SCENES */}
            <AnimatePresence mode="wait">
                {scene === 0 && (
                    <motion.div key="scene-1" className="absolute inset-0" exit={{ opacity: 0 }} transition={{ duration: 1 }}>
                        <DataGlobe />
                    </motion.div>
                )}
                {scene === 1 && (
                    <motion.div key="scene-2" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <CategoryTunnel categories={categories} />
                        {/* Overlay Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <motion.h1
                                initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className="text-xl md:text-3xl text-white font-bold tracking-[1em] bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10"
                            >
                                THE CONTENDERS
                            </motion.h1>
                        </div>
                    </motion.div>
                )}
                {scene === 2 && (
                    <motion.div key="scene-3" className="absolute inset-0" exit={{ opacity: 0 }}>
                        <RitualScene />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <motion.h1
                                className="absolute bottom-20 text-xl text-yellow-500 font-bold tracking-[0.5em] animate-pulse"
                            >
                                SYSTEM OVERLOAD
                            </motion.h1>
                        </div>
                    </motion.div>
                )}
                {scene === 3 && (
                    <motion.div key="scene-4" className="absolute inset-0">
                        <RevealScene />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CINEMATIC BARS */}
            <div className="absolute top-0 left-0 right-0 h-[10vh] bg-black z-50 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-[10vh] bg-black z-50 pointer-events-none" />

            {/* GLOBAL GRAIN */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none z-[60] mix-blend-overlay" />
        </div>
    );
}

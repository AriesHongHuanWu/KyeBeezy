"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Volume2, VolumeX, SkipForward, Zap, User } from "lucide-react";
import Link from "next/link";
import { getAwardsData, CategoryData } from "../../data-fetcher";
import { NOMINEE_IMAGES } from "../../nominee-images";
import { Confetti } from "@/components/ui/confetti";
import { TeaserHeroCard } from "@/components/awards/TeaserHeroCard";

// --- CONFIG ---
const AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

// --- 3D MATH UTILS ---
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// --- SUB-COMPONENTS ---

// 1. DATA GLOBE (Scene 1 - The World)
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
            {/* Rotating Container */}
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
                        style={{ transform: `translate3d(${pt.x}px, ${pt.y}px, ${pt.z}px)` }}
                    />
                ))}
                {/* Floating Data Text */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={`txt-${i}`}
                        className="absolute text-[8px] text-yellow-500/50 font-mono whitespace-nowrap"
                        style={{ transform: `translate3d(${Math.random() * 600 - 300}px, ${Math.random() * 600 - 300}px, ${Math.random() * 600 - 300}px)` }}
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                    >
                        {Math.floor(Math.random() * 9999)}
                    </motion.div>
                ))}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-500/10 rounded-full blur-xl" />
            </motion.div>

            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}
                    className="text-6xl md:text-8xl font-black text-white tracking-tighter text-center leading-none mix-blend-difference"
                >
                    GLOBAL<br />SCALE
                </motion.h1>
            </div>
        </div>
    );
};

// 2. CATEGORY TUNNEL (Scene 2 - The Candidates)
const CategoryTunnel = ({ categories }: { categories: CategoryData[] }) => {
    const images = useMemo(() => {
        const raw = Object.values(NOMINEE_IMAGES);
        return [...raw, ...raw, ...raw, ...raw].sort(() => 0.5 - Math.random()).slice(0, 80);
    }, []);

    return (
        <div className="absolute inset-0 bg-black perspective-500 overflow-hidden">
            {/* Warp Images */}
            <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
                {images.map((img, i) => (
                    <motion.div
                        key={`img-${i}`}
                        className="absolute top-1/2 left-1/2 w-32 h-32 md:w-48 md:h-48 rounded-lg bg-neutral-900 border border-white/20 opacity-60"
                        style={{
                            backgroundImage: `url(${img})`, backgroundSize: "cover",
                            x: Math.cos(i) * (300 + Math.random() * 500),
                            y: Math.sin(i) * (300 + Math.random() * 500),
                        }}
                        initial={{ z: -2000, scale: 0, opacity: 0 }}
                        animate={{ z: 500, scale: 1, opacity: [0, 1, 0] }}
                        transition={{ duration: 3, delay: Math.random() * 4, ease: "linear", repeat: Infinity }}
                    />
                ))}
            </div>

            {/* Category Names */}
            {categories.slice(0, 10).map((cat, i) => (
                <motion.div
                    key={cat.id}
                    className="absolute top-1/2 left-1/2 flex items-center justify-center w-[80vw]"
                    initial={{ z: -2000, opacity: 0 }}
                    animate={{ z: 800, opacity: [0, 1, 0] }}
                    transition={{ duration: 3, delay: i * 0.8, ease: "linear" }}
                    style={{ x: "-50%", y: "-50%", rotateZ: i % 2 === 0 ? -5 : 5 }}
                >
                    <h2 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400 uppercase italic tracking-tighter whitespace-nowrap drop-shadow-lg">
                        {cat.title}
                    </h2>
                </motion.div>
            ))}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay animate-pulse" />
        </div>
    );
};

// 3. VOTING BATTLE (Scene 3 - The Fight)
const VotingBattleScene = () => {
    // Simulate count up
    const [countA, setCountA] = useState(1240);
    const [countB, setCountB] = useState(1190);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountA(prev => prev + Math.floor(Math.random() * 50));
            setCountB(prev => prev + Math.floor(Math.random() * 60)); // B catches up
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 flex bg-black">
            {/* Split Screen */}
            <div className="flex-1 border-r border-white/20 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-900/20" />
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
                    className="text-8xl md:text-[10rem] font-black text-white mix-blend-overlay"
                >
                    {countA}
                </motion.div>
                <div className="absolute bottom-10 left-10 text-xl font-bold text-blue-500 tracking-[0.5em]">NOMINEE 01</div>
            </div>

            <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-red-900/20" />
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                    className="text-8xl md:text-[10rem] font-black text-white mix-blend-overlay"
                >
                    {countB}
                </motion.div>
                <div className="absolute top-10 right-10 text-xl font-bold text-red-500 tracking-[0.5em]">NOMINEE 02</div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-black/80 px-8 py-4 border border-white/20 backdrop-blur-md">
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">VS</h1>
                </div>
            </div>

            <div className="absolute bottom-20 w-full text-center">
                <h2 className="text-3xl font-black text-yellow-500 uppercase tracking-widest animate-pulse">Every Vote Counts</h2>
            </div>
        </div>
    );
};

// 4. THE RITUAL (Scene 4 - The Mechanic)
const RitualScene = () => {
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        // Auto reveal after 3s
        setTimeout(() => setIsRevealed(true), 3000);
    }, []);

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
            <TeaserHeroCard
                isRevealed={isRevealed}
                onRevealComplete={() => { }}
            />
            {/* Lightning */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                {[...Array(3)].map((_, i) => (
                    <motion.path
                        key={i} d={`M50,50 L${Math.random() * 100},${Math.random() * 100}`}
                        stroke="yellow" strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 0.1, repeat: Infinity, repeatDelay: Math.random() }}
                    />
                ))}
            </svg>
        </div>
    );
};

// 5. THE REVEAL (Scene 5 - Final)
const RevealScene = () => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white animate-in fade-in duration-300">
            <Confetti isActive={true} />
            <div className="relative z-10 flex flex-col items-center mix-blend-difference scale-150">
                <img src="/bandlab-logo.png" className="w-48 h-48 object-contain mb-6 invert" />
                <h1 className="text-9xl font-black text-white tracking-tighter">KYEBEEZY</h1>
                <p className="text-3xl font-bold text-white/50 tracking-[1em]">X BANDLAB</p>

                <Link href="/awards/bandlab2025/live" className="mt-12">
                    <button className="px-12 py-6 bg-yellow-500 text-black font-black uppercase text-2xl hover:scale-110 transition-transform">
                        ENTER LIVE
                    </button>
                </Link>
            </div>
        </div>
    );
};


// --- CONTROLLER ---

export default function TeaserPageV7() {
    const [started, setStarted] = useState(false);
    const [scene, setScene] = useState(-1);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        getAwardsData().then(data => setCategories(data));
    }, []);

    useEffect(() => {
        if (!started) return;

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }

        // 45s TIMELINE
        const timeline = [
            { time: 0, scene: 0 },       // 0s: Globe (5s)
            { time: 5000, scene: 1 },    // 5s: Tunnel (10s)
            { time: 15000, scene: 2 },   // 15s: Voting Battle (10s)
            { time: 25000, scene: 3 },   // 25s: Ritual (10s)
            { time: 35000, scene: 4 },   // 35s: Reveal (Loop)
        ];

        let timers: NodeJS.Timeout[] = [];
        timeline.forEach(item => {
            timers.push(setTimeout(() => setScene(item.scene), item.time));
        });

        return () => timers.forEach(clearTimeout);
    }, [started]);

    if (!started) {
        return (
            <div onClick={() => setStarted(true)} className="h-screen w-screen bg-black flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-900 transition-colors">
                <div className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center animate-pulse mb-6">
                    <Play className="w-10 h-10 text-white fill-white ml-2" />
                </div>
                <h1 className="text-white font-black tracking-[0.5em] text-xl uppercase">Initiate Sequence</h1>
                <p className="text-neutral-500 text-sm mt-2 uppercase tracking-widest">Duration: 45s • Audio: ON</p>
                <audio ref={audioRef} src={AUDIO_URL} preload="auto" loop />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative font-sans">
            <div className="absolute top-6 right-6 z-[100] flex gap-4">
                <button onClick={() => { setStarted(false); setScene(-1); }} className="text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest">
                    Restart
                </button>
            </div>

            <AnimatePresence mode="wait">
                {scene === 0 && <motion.div key="s0" className="absolute inset-0" exit={{ opacity: 0 }}><DataGlobe /></motion.div>}
                {scene === 1 && <motion.div key="s1" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><CategoryTunnel categories={categories} /></motion.div>}
                {scene === 2 && <motion.div key="s2" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><VotingBattleScene /></motion.div>}
                {scene === 3 && <motion.div key="s3" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><RitualScene /></motion.div>}
                {scene === 4 && <motion.div key="s4" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><RevealScene /></motion.div>}
            </AnimatePresence>

            {/* Cinematic Overlay */}
            <div className="absolute top-0 w-full h-[12vh] bg-black z-50 pointer-events-none" />
            <div className="absolute bottom-0 w-full h-[12vh] bg-black z-50 pointer-events-none" />
        </div>
    );
}

"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Volume2, VolumeX, SkipForward, Zap, Trophy } from "lucide-react";
import Link from "next/link";
import { getAwardsData, CategoryData } from "../../data-fetcher";
import { NOMINEE_IMAGES } from "../../nominee-images";
import { Confetti } from "@/components/ui/confetti";
import { TeaserHeroCard } from "@/components/awards/TeaserHeroCard";

// --- CONFIG ---
const BPM = 140; // Hyper Speed
const BEAT_MS = (60 / BPM) * 1000; // ~428ms
const AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

// --- SUB-COMPONENTS ---

// ACT 1: TERMINAL BOOT (0-5s) - CONDENSED & AGGRESSIVE
const TerminalBoot = () => {
    return (
        <div className="absolute inset-0 bg-black flex flex-col justify-center items-center overflow-hidden">
            <div className="w-full h-1 bg-green-500 absolute top-0 animate-[scan_0.5s_linear_infinite]" />
            <motion.div
                animate={{ opacity: [0, 1, 0, 1] }} transition={{ duration: 0.2, repeat: Infinity }}
                className="text-center"
            >
                <h1 className="text-9xl font-black text-green-500 tracking-tighter skew-x-12">SYSTEM</h1>
                <h1 className="text-9xl font-black text-white tracking-tighter -skew-x-12">OVERRIDE</h1>
            </motion.div>
            <p className="font-mono text-xs text-green-500 mt-8">LOADING ASSETS... 99%</p>
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-40 mix-blend-overlay" />
        </div>
    );
};

// ACT 2: ROSTER WALL (5-20s) - MOVING WALL + STROBE
const RosterWall = ({ beat }: { beat: number }) => {
    // 1. Moving Wall Background
    const wallImages = useMemo(() => {
        const raw = Object.values(NOMINEE_IMAGES);
        return [...raw, ...raw, ...raw, ...raw].sort(() => 0.5 - Math.random()).slice(0, 100);
    }, []);

    // 2. Foreground Strobe Image
    const currentImg = wallImages[beat % wallImages.length];

    return (
        <div className="absolute inset-0 bg-black overflow-hidden flex items-center justify-center">
            {/* MOVING WALL BACKGROUND */}
            <motion.div
                className="absolute inset-0 grid grid-cols-10 gap-0 w-[200vw] h-[200vh] opacity-30 grayscale"
                animate={{ x: -1000, y: -1000 }}
                transition={{ duration: 20, ease: "linear", repeat: Infinity }}
                style={{ x: 0, y: 0 }}
            >
                {wallImages.map((src, i) => (
                    <div key={i} className="w-full h-32 bg-cover bg-center border border-white/5" style={{ backgroundImage: `url(${src})` }} />
                ))}
            </motion.div>

            {/* FOREGROUND FLASH CUT */}
            <div className="relative z-10">
                <motion.div
                    key={beat} // Re-render on beat
                    initial={{ scale: 1.2, filter: "brightness(2)" }}
                    animate={{ scale: 1, filter: "brightness(1)" }}
                    transition={{ duration: 0.2 }}
                    className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] border-8 border-white shadow-[0_0_100px_rgba(255,255,255,0.5)] bg-cover bg-center"
                    style={{ backgroundImage: `url(${currentImg})` }}
                >
                    {/* HUB OVERLAY */}
                    <div className="absolute bottom-4 left-4 bg-black text-white px-2 font-mono text-xs">
                        ID: {Math.random().toString(36).substring(7).toUpperCase()}
                    </div>
                    <div className="absolute top-4 right-4 text-red-500 font-black animate-pulse">REC</div>
                </motion.div>
            </div>

            {/* TEXT OVERLAY */}
            <h1 className="absolute bottom-10 left-10 text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-transparent tracking-tighter italic z-20">
                THE ROSTER
            </h1>
        </div>
    );
};

// ACT 3: SLOT MACHINE CATEGORIES (20-40s)
const SlotMachineCategories = ({ categories, beat }: { categories: CategoryData[], beat: number }) => {
    // Pick current category based on beat division (e.g. every 4 beats change category)
    const currentCatIndex = Math.floor(beat / 4) % (categories.length || 1);
    const cat = categories[currentCatIndex] || { title: "LOADING" };

    return (
        <div className="absolute inset-0 bg-yellow-400 flex items-center justify-center overflow-hidden">
            {/* Spinning Text Effect */}
            <div className="relative h-[200px] overflow-hidden flex flex-col items-center">
                <motion.div
                    key={cat.title}
                    initial={{ y: 200, filter: "blur(20px)" }}
                    animate={{ y: 0, filter: "blur(0px)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <h1 className="text-6xl md:text-9xl font-black text-black uppercase tracking-tighter leading-none whitespace-nowrap">
                        {cat.title}
                    </h1>
                </motion.div>
            </div>

            {/* Strobe Overlay */}
            <div className="absolute inset-0 border-[20px] border-black pointer-events-none" />
            <motion.div
                animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 0.5 }}
                className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none"
            />
        </div>
    );
};

// ACT 4: VOTING WAR 2.0 (40-60s) - BAR CHART RACE
const VotingWarV2 = () => {
    const [stats, setStats] = useState({ a: 50, b: 50 });
    const [leader, setLeader] = useState<'A' | 'B' | null>(null);

    // Violent Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            const delta = Math.random() > 0.5 ? 2 : -2;
            setStats(prev => {
                const newA = Math.min(90, Math.max(10, prev.a + delta));
                const newB = 100 - newA;

                // Check leader change
                if (newA > newB && leader !== 'A') setLeader('A');
                else if (newB > newA && leader !== 'B') setLeader('B');

                return { a: newA, b: newB };
            });
        }, 50); // 20fps update
        return () => clearInterval(interval);
    }, [leader]);

    return (
        <div className="absolute inset-0 bg-neutral-900 flex items-end">
            {/* BAR A */}
            <motion.div
                className="relative bg-blue-600 border-r-4 border-black"
                animate={{ width: `${stats.a}%`, height: "100%" }}
                transition={{ duration: 0.1, ease: "linear" }}
            >
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute top-10 right-10 text-Right">
                    <h1 className="text-6xl md:text-9xl font-black text-white italic tracking-tighter">{Math.floor(stats.a * 142)}</h1>
                    <p className="text-xl font-bold text-blue-200">NOMINEE A</p>
                </div>
                {leader === 'A' && <div className="absolute inset-0 bg-white mix-blend-overlay animate-pulse" />}
            </motion.div>

            {/* BAR B */}
            <motion.div
                className="relative bg-red-600 border-l-4 border-black"
                animate={{ width: `${stats.b}%`, height: "100%" }}
                transition={{ duration: 0.1, ease: "linear" }}
            >
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute bottom-10 left-10 text-left">
                    <h1 className="text-6xl md:text-9xl font-black text-white italic tracking-tighter">{Math.floor(stats.b * 138)}</h1>
                    <p className="text-xl font-bold text-red-200">NOMINEE B</p>
                </div>
                {leader === 'B' && <div className="absolute inset-0 bg-white mix-blend-overlay animate-pulse" />}
            </motion.div>

            {/* LEADER CHANGE ALERT */}
            <AnimatePresence>
                {leader && (
                    <motion.div
                        key={leader}
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-black/80 backdrop-blur-md border-2 border-white px-8 py-4"
                    >
                        <h1 className={`text-4xl font-black italic tracking-tighter ${leader === 'A' ? 'text-blue-500' : 'text-red-500'}`}>
                            LEADER TAKEOVER
                        </h1>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute top-10 w-full text-center z-10">
                <div className="inline-block bg-yellow-500 text-black px-4 font-black">LIVE TRACKING</div>
            </div>
        </div>
    );
};

// ACT 5: AUTHENTIC RITUAL (60s-80s)
const FinalRitual = ({ isRevealed }: { isRevealed: boolean }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="scale-125 md:scale-150">
                <TeaserHeroCard isRevealed={isRevealed} onRevealComplete={() => { }} />
            </div>
            {/* Particles */}
            <div className="absolute inset-0 opacity-50"><Confetti isActive={isRevealed} /></div>
        </div>
    );
};

// ACT 6: FINAL SHOWCASE (80s+)
const FinalShowcase = () => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
            <Confetti isActive={true} />
            <motion.div
                initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 flex flex-col items-center mix-blend-difference"
            >
                <img src="/bandlab-logo.png" className="w-48 h-48 object-contain mb-6 invert scale-125" />
                <h1 className="text-[12vw] font-black text-white leading-none tracking-tighter mb-4">
                    DEC 20TH
                </h1>

                <div className="flex gap-4">
                    <Link href="/awards/bandlab2025/live">
                        <button className="px-12 py-6 bg-yellow-500 text-black font-black text-2xl uppercase hover:scale-105 hover:rotate-2 transition-transform shadow-[10px_10px_0px_black]">
                            ENTER EVENT
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

// --- CONTROLLER ---

export default function TeaserPageV9() {
    const [started, setStarted] = useState(false);
    const [beat, setBeat] = useState(0);
    const [act, setAct] = useState(0);

    // Data
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Fetch Data
    useEffect(() => {
        getAwardsData().then(data => setCategories(data));
    }, []);

    // ENGINE
    useEffect(() => {
        if (!started) return;

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }

        // Beat Loop (Every ~428ms for 140BPM)
        const beatInterval = setInterval(() => {
            setBeat(b => b + 1);
        }, BEAT_MS);

        // 90s Timeline
        const timeline = [
            { t: 0, act: 1 },  // Boot (5s)
            { t: 5, act: 2 },  // Roster (15s)
            { t: 20, act: 3 }, // Slots (20s)
            { t: 40, act: 4 }, // War (20s)
            { t: 60, act: 5 }, // Ritual (20s) - Give it time to breathe
            { t: 80, act: 6 }, // Show (10s)
        ];

        const timers = timeline.map(item =>
            setTimeout(() => setAct(item.act), item.t * 1000)
        );

        return () => {
            clearInterval(beatInterval);
            timers.forEach(clearTimeout);
        };
    }, [started]);

    if (!started) {
        return (
            <div onClick={() => setStarted(true)} className="h-screen w-screen bg-black flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-900 transition-colors group relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

                <div className="w-40 h-40 rounded-full border-[10px] border-yellow-500 flex items-center justify-center relative z-10 bg-black hover:scale-110 transition-transform shadow-[0_0_50px_rgba(234,179,8,0.5)]">
                    <Play className="w-16 h-16 text-white fill-white ml-2" />
                </div>
                <h1 className="text-white font-black tracking-tighter text-4xl uppercase mt-8 z-10">INITIALIZE V9</h1>
                <p className="text-neutral-500 font-mono text-sm mt-2 uppercase tracking-widest z-10">140 BPM // HYPER DENSITY</p>
                <audio ref={audioRef} src={AUDIO_URL} preload="auto" loop />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative font-sans cursor-none select-none">
            {/* Strobe Frame */}
            <motion.div
                animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 4 }}
                className="absolute inset-0 border-[20px] border-white z-[80] pointer-events-none mix-blend-overlay"
            />

            {/* STAGE MANAGER */}
            <div className="absolute inset-0">
                {act === 1 && <TerminalBoot />}
                {act === 2 && <RosterWall beat={beat} />}
                {act === 3 && <SlotMachineCategories categories={categories} beat={beat} />}
                {act === 4 && <VotingWarV2 />}
                {act === 5 && <FinalRitual isRevealed={true} />}
                {act === 6 && <FinalShowcase />}
            </div>

            {/* GLOBAL OVERLAYS */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-15 pointer-events-none z-[60] mix-blend-overlay animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_120%)] z-[50] pointer-events-none" />

            {/* HUD */}
            <div className="absolute top-6 left-6 font-mono text-xs text-yellow-500 z-[70] flex gap-4">
                <span>BPM: {BPM}</span>
                <span>ACT: 0{act}</span>
                <span>BEAT: {beat}</span>
            </div>
            <button onClick={() => { setStarted(false); setAct(0); }} className="absolute top-6 right-6 font-bold text-xs text-white/50 hover:text-white z-[100] border px-2 py-1">RESTART</button>

        </div>
    );
}

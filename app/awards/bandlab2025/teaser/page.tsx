"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import Link from "next/link";
import { getAwardsData, CategoryData } from "../../data-fetcher";
import { NOMINEE_IMAGES } from "../../nominee-images";
import { Confetti } from "@/components/ui/confetti";
import { TeaserHeroCard } from "@/components/awards/TeaserHeroCard";

// --- CONFIG ---
const VISUAL_BPM = 280; // HIGH SPEED (Fast cycling)
const TICK_MS = (60 / VISUAL_BPM) * 1000;
const AUDIO_URL = "/Memories_Take_Time.mp3";

// --- TYPES ---
type PhaseType = 'TEXT' | 'ACTION';
interface SequenceStep {
    id: number;
    type: PhaseType;
    sceneId: number;
    duration: number; // seconds
    text?: { main: string, sub?: string };
}

// --- PERSISTENT OVERLAYS ---
const PersistentCredits = () => (
    <div className="absolute bottom-6 right-6 z-[999] flex items-center bg-black/50 backdrop-blur-md px-6 py-3 border border-white/10 rounded-full hover:bg-black/80 transition-colors">
        <div className="flex items-center gap-3 border-r border-white/20 pr-4 mr-4">
            <img src="/awbest-logo.png" className="w-6 h-auto" />
            <span className="text-xs font-black text-white tracking-widest uppercase">AWBEST</span>
        </div>
        <span className="text-xs font-black text-yellow-500 tracking-widest uppercase">ARIES WU</span>
    </div>
);

// --- SUB-COMPONENTS ---

const NarrativeOverlay = ({ text, subtext }: { text: string, subtext?: string }) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[90] bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                className="text-center"
            >
                <h1 className="text-6xl md:text-[8rem] font-black text-white tracking-tighter uppercase drop-shadow-[0_0_20px_white] leading-none mb-4">
                    {text}
                </h1>
                {subtext && (
                    <div className="bg-yellow-500 text-black font-black text-xl md:text-3xl px-6 py-2 uppercase tracking-widest inline-block skew-x-[-10deg]">
                        {subtext}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// --- EFFCTS ---
const CRTScanline = () => (
    <div className="absolute inset-0 pointer-events-none z-[800] opacity-30 mix-blend-overlay">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        <div className="absolute inset-0 animate-[scan_5s_linear_infinite] bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] h-[20vh]" />
    </div>
);

// SCENE 1: CINEMATIC INTRO (Clean Typography)
const CinematicIntroVisuals = ({ tick }: { tick: number }) => (
    <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
        {/* Subtle Background Flow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#222_0%,black_100%)]" />

        {/* Large pulsing text behind */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 scale-[2]">
            <h1 className="text-[20vw] font-black text-white animate-pulse">2025</h1>
        </div>

        {/* Main Title Strobe */}
        <div className="relative z-10 flex flex-col items-center gap-4">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-yellow-500 text-black px-4 py-1 tracking-[0.5em] text-xs md:text-xl font-bold uppercase"
            >
                The Official
            </motion.div>
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">
                TEASER
            </h1>
        </div>
    </div>
);

// SCENE 2: ROSTER (Premium Card Showcase - No Ugly Bars)
const PremiumCardVisuals = ({ tick }: { tick: number }) => {
    const entries = Object.entries(NOMINEE_IMAGES);
    const total = entries.length;

    // Cycle linearly
    const idx = tick % total;
    const [rawName, imgSrc] = entries[idx];
    const name = rawName.replace('@', '').split('(')[0].trim().toUpperCase();

    // Flash Logic
    const isFlash = tick % 2 === 0;

    return (
        <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden perspective-1000">
            {/* Premium Background: Dark Grid + Spotlight (No Cheap Yellow) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1)_0%,transparent_60%)]" />

            {/* Moving Light Beam */}
            <div className="absolute inset-0 animate-[spin_10s_linear_infinite] opacity-30">
                <div className="absolute top-1/2 left-1/2 w-[200vw] h-[20vh] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-1/2 -translate-y-1/2 rotate-45 blur-xl" />
            </div>

            {/* 3D Card Container - LARGER & CLEANER */}
            <motion.div
                key={idx}
                initial={{ rotateY: 90, scale: 0.8, opacity: 0, z: -500 }}
                animate={{ rotateY: 0, scale: 1.2, opacity: 1, z: 0 }} // Scale 1.2 for impact
                exit={{ rotateY: -90, scale: 0.8, opacity: 0, z: -500 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 20 }}
                className="relative z-10 w-[60vw] h-[50vh] md:w-[400px] md:h-[600px] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/20 group"
            >
                {/* Image */}
                <img
                    src={imgSrc}
                    className={`w-full h-full object-cover transition-all duration-75 ${isFlash ? 'filter invert brightness-125' : 'brightness-100'}`}
                />

                {/* Glass Gloss */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 mixing-blend-overlay" />

                {/* Border Glow */}
                <div className="absolute inset-0 border-[1px] border-white/30 rounded-2xl" />
            </motion.div>

            {/* Negative Film Name Overlay (Synced) */}
            <div className="absolute inset-0 z-20 flex items-center justify-center mix-blend-exclusion pointer-events-none">
                {isFlash && (
                    <h1 className="text-[12vw] font-black text-white leading-none tracking-tighter text-center uppercase scale-150 blur-sm opacity-50">
                        {name}
                    </h1>
                )}
            </div>

            {/* Bottom Left Name Tag - Clean & Premium */}
            <div className="absolute bottom-[15vh] left-[5vw] z-30 flex flex-col items-start gap-2">
                <div className="bg-white text-black px-4 py-1 text-xs font-bold tracking-widest uppercase">
                    Nominee
                </div>
                <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-lg">
                    {name}
                </h2>
            </div>
        </div>
    );
};

// SCENE 3: KINETIC TYPE
const CategoryVisuals = ({ categories, tick }: { categories: CategoryData[], tick: number }) => {
    const idx = Math.floor(tick / 2) % (categories.length || 1);
    const cat = categories[idx] || { title: "MUSIC" };
    return (
        <div className="absolute inset-0 bg-yellow-400 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex flex-col justify-center gap-0 opacity-10 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                    <h1 key={i} className="text-[20vh] leading-[0.8] font-black text-black whitespace-nowrap overflow-hidden">
                        {cat.title} {cat.title}
                    </h1>
                ))}
            </div>
            <motion.div
                key={cat.title + tick}
                initial={{ scale: 0.8, rotate: 5, opacity: 0 }}
                animate={{ scale: 1, rotate: -2, opacity: 1 }}
                transition={{ duration: 0.4, ease: "backOut" }} // Removed Blur, clearer animation
                className="bg-black px-12 py-8 shadow-[20px_20px_0px_white]"
            >
                <h1 className="text-4xl md:text-8xl font-black text-white tracking-tighter uppercase whitespace-nowrap">
                    {cat.title}
                </h1>
            </motion.div>
        </div>
    );
};

// SCENE 4: VOTING WAR (EQ Meter)
const EQMeterVisuals = ({ tick }: { tick: number }) => {
    const [a, setA] = useState(50);
    useEffect(() => {
        const diff = (Math.random() - 0.5) * 20;
        setA(prev => Math.min(90, Math.max(10, prev + diff)));
    }, [tick]);

    return (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4">
            {/* Digital Meter Container */}
            <div className="w-[80vw] h-[20vh] bg-neutral-900 border-4 border-white flex items-center p-2 gap-1">
                {/* Left Channel */}
                <div className="h-full bg-blue-500 transition-all duration-75 shadow-[0_0_20px_blue]" style={{ width: `${a}%` }} />
            </div>
            <div className="w-[80vw] h-[20vh] bg-neutral-900 border-4 border-white flex items-center p-2 gap-1 justify-end">
                {/* Right Channel */}
                <div className="h-full bg-red-500 transition-all duration-75 shadow-[0_0_20px_red]" style={{ width: `${100 - a}%` }} />
            </div>

            <h1 className="text-[10vw] font-black text-white mix-blend-difference mt-8">LIVE STATS</h1>
        </div>
    );
};

// SCENE 5: RITUAL
const RitualVisuals = () => (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
        <div className="scale-150 animate-pulse">
            <TeaserHeroCard isRevealed={true} onRevealComplete={() => { }} />
        </div>
    </div>
);

// SCENE 6: BRANDING (Finale Redesign)
const FinaleVisuals = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-500 overflow-hidden">
        <Confetti isActive={true} />

        {/* Animated Background */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_20px,transparent_20px,transparent_40px)] animate-[pulse_2s_ease-in-out_infinite]" />

        <div className="z-10 flex flex-col items-center">
            {/* TOP LINE */}
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="bg-black text-white px-8 py-2 mb-4 skew-x-[-10deg]"
            >
                <span className="text-xl md:text-3xl font-bold tracking-[0.5em] uppercase">The Official</span>
            </motion.div>

            {/* KYEBEEZY */}
            <motion.h1
                initial={{ scale: 5, filter: "blur(20px)", opacity: 0 }}
                animate={{ scale: 1, filter: "blur(0px)", opacity: 1 }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="text-[18vw] md:text-[15vw] font-black text-black leading-[0.8] tracking-tighter drop-shadow-2xl mix-blend-hard-light"
            >
                KYEBEEZY
            </motion.h1>

            {/* X SEPARATOR */}
            <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-[5vw] font-black text-white my-2"
            >
                X
            </motion.div>

            {/* BANDLAB LOCKUP */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6, ease: "backOut" }}
                className="flex items-center gap-4 bg-black px-8 py-4 border-4 border-white shadow-[10px_10px_0px_white] hover:scale-105 transition-transform"
            >
                <img src="/bandlab-logo.png" className="h-[5vw] md:h-16 filter invert brightness-0 saturate-100 invert" />
                <span className="text-[5vw] md:text-6xl font-black text-white tracking-tighter uppercase">BANDLAB</span>
            </motion.div>

            {/* ENTER BUTTON */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-12"
            >
                <Link href="/awards/bandlab2025/live">
                    <button className="px-12 py-4 bg-white text-black font-black text-2xl md:text-3xl uppercase border-4 border-black hover:bg-black hover:text-white transition-colors">
                        ENTER EXPERIENCE
                    </button>
                </Link>
            </motion.div>
        </div>
    </div>
);


export default function TeaserPageV19() {
    const [started, setStarted] = useState(false);
    const [tick, setTick] = useState(0);
    const [stepIndex, setStepIndex] = useState(0);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [flash, setFlash] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // FETCH
    useEffect(() => { getAwardsData().then(setCategories); }, []);

    // CONFIG: 280 BPM (High Speed)
    const BPM = 280;
    const TICK_MS = (60 / BPM) * 1000;

    // SEQUENCE DEFINITION (Total ~40s)
    const sequence: SequenceStep[] = [
        // 0-2s
        { id: 1, type: 'TEXT', sceneId: 1, duration: 2, text: { main: "100M", sub: "CREATORS" } },
        { id: 2, type: 'ACTION', sceneId: 1, duration: 2 },

        // 4-19s (ROSTER - 15s to show many artists)
        { id: 3, type: 'TEXT', sceneId: 2, duration: 2, text: { main: "ROSTER", sub: "FULL LIST" } },
        { id: 4, type: 'ACTION', sceneId: 2, duration: 15 },

        // 19-27s
        { id: 5, type: 'TEXT', sceneId: 3, duration: 2, text: { main: "12", sub: "CATEGORIES" } },
        { id: 6, type: 'ACTION', sceneId: 3, duration: 6 },

        // 27-35s
        { id: 7, type: 'TEXT', sceneId: 4, duration: 2, text: { main: "VOTE", sub: "NOW" } },
        { id: 8, type: 'ACTION', sceneId: 4, duration: 6 },

        // 35-40s
        { id: 9, type: 'TEXT', sceneId: 5, duration: 2, text: { main: "WIN", sub: "HISTORY" } },
        { id: 10, type: 'ACTION', sceneId: 5, duration: 3 },

        // 40s+
        { id: 11, type: 'ACTION', sceneId: 6, duration: 99 }, // Finale
    ];

    const currentStep = sequence[stepIndex] || sequence[sequence.length - 1];

    // ENGINE
    useEffect(() => {
        if (!started) return;

        const tickInterval = setInterval(() => setTick(t => t + 1), TICK_MS);

        let elapsed = 0;
        const timeouts: NodeJS.Timeout[] = [];

        sequence.forEach((step, index) => {
            timeouts.push(setTimeout(() => {
                setStepIndex(index);
                // Trigger Cinematic Flash on Step Change
                setFlash(true);
                setTimeout(() => setFlash(false), 300); // 300ms flash
            }, elapsed * 1000));
            elapsed += step.duration;
        });

        return () => {
            clearInterval(tickInterval);
            timeouts.forEach(clearTimeout);
        };
    }, [started]);

    const handleStart = () => {
        if (audioRef.current) {
            audioRef.current.volume = 1.0;
            audioRef.current.currentTime = 0;
            audioRef.current.play().then(() => setStarted(true)).catch(() => setStarted(true));
        } else {
            setStarted(true);
        }
    };

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative font-sans cursor-none select-none">
            <audio ref={audioRef} src={AUDIO_URL} preload="auto" loop />

            {/* PERSISTENT ELEMENTS */}
            {started && <PersistentCredits />}

            {/* CINEMATIC FLASH OVERLAY (Global) */}
            <div className={`fixed inset-0 bg-white z-[9999] pointer-events-none transition-opacity duration-300 ease-out ${flash ? 'opacity-30' : 'opacity-0'}`} />

            {!started ? (
                // --- NEW PREMIUM START SCREEN ---
                <div onClick={handleStart} className="absolute inset-0 z-[200] bg-black flex flex-col items-center justify-center cursor-pointer group transition-colors overflow-hidden">
                    {/* Ambient Background */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,black_100%)] opacity-80" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />

                    {/* Center Play Button */}
                    <div className="relative z-10 w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out bg-white/5 backdrop-blur-sm">
                        <div className="absolute inset-0 rounded-full border border-white/40 animate-[ping_3s_infinite]" />
                        <div className="absolute inset-0 rounded-full border border-yellow-500/30 animate-[ping_3s_infinite_0.5s]" />
                        <Play className="w-12 h-12 md:w-20 md:h-20 text-white fill-white ml-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                    </div>

                    {/* Title Block */}
                    <div className="relative z-10 text-center mt-12 md:mt-16 space-y-4">
                        <h2 className="text-yellow-500 font-bold tracking-[0.5em] text-xs md:text-sm uppercase animate-pulse">The Official Teaser</h2>
                        <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-200 to-neutral-600 tracking-tighter uppercase drop-shadow-2xl">
                            BANDLAB<br />AWARDS<span className="text-yellow-500">2025</span>
                        </h1>
                        <p className="text-neutral-500 font-mono text-[10px] md:text-xs uppercase tracking-widest mt-4">
                            Click to Initialize Experience
                        </p>
                    </div>

                    {/* Footer Tech Text */}
                    <div className="absolute bottom-8 text-[10px] text-neutral-800 font-mono tracking-widest">
                        v19.0.2 // AUDIO_ REACTIVE // SYSTEM_READY
                    </div>
                </div>
            ) : (
                <div className="absolute inset-0">
                    {/* SCREEN SHAKE */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{ x: tick % 4 === 0 ? [3, -3, 0] : 0 }} // Subtle Shake
                        transition={{ duration: 0.05 }}
                    >
                        {/* CINEMATIC SCENE RENDERER */}
                        <AnimatePresence mode="wait">
                            {currentStep.type === 'TEXT' ? (
                                <motion.div
                                    key={`text-${currentStep.id}`}
                                    className="absolute inset-0 z-50"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                                    transition={{ duration: 0.3, ease: "circOut" }}
                                >
                                    <NarrativeOverlay text={currentStep.text?.main || ""} subtext={currentStep.text?.sub} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={`scene-${currentStep.sceneId}`}
                                    className="absolute inset-0 z-10"
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, filter: "brightness(2)" }}
                                    transition={{ duration: 0.4 }}
                                >
                                    {currentStep.sceneId === 1 && <CinematicIntroVisuals tick={tick} />}
                                    {currentStep.sceneId === 2 && <PremiumCardVisuals tick={tick} />}
                                    {currentStep.sceneId === 3 && <CategoryVisuals categories={categories} tick={tick} />}
                                    {currentStep.sceneId === 4 && <EQMeterVisuals tick={tick} />}
                                    {currentStep.sceneId === 5 && <RitualVisuals />}
                                    {currentStep.sceneId === 6 && <FinaleVisuals />}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* GLOBAL VISUALS */}
                    <CRTScanline />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,red_120%)] pointer-events-none mix-blend-overlay opacity-50" />

                    {/* Letterbox Bars (Cinematic Feel) */}
                    <div className="absolute top-0 left-0 right-0 h-[5vh] bg-black z-[100]" />
                    <div className="absolute bottom-0 left-0 right-0 h-[5vh] bg-black z-[100]" />

                    <button onClick={() => window.location.reload()} className="absolute top-6 right-6 font-bold text-xs text-white/50 hover:text-white z-[100] border px-2 py-1">RESTART</button>

                    {/* PROGRESS BAR */}
                    <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 z-[900]" style={{ animation: `width 40s linear` }} />
                </div>
            )}
        </div>
    );
}

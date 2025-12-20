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
const VISUAL_BPM = 400; // HYPER SPEED for 20s
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
    <>
        <div className="absolute top-4 right-4 z-[999] flex flex-col items-end">
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-1">Sponsored By</span>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20">
                <img src="https://player.awbest.tech/image/icon/icon.svg" className="w-6 h-6" />
                <span className="text-sm font-black text-white tracking-tighter">AWBEST</span>
            </div>
        </div>
        <div className="absolute bottom-4 right-4 z-[999] text-right">
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold block mb-1">Produced By</span>
            <h1 className="text-xl font-black text-white tracking-normal uppercase border-b-2 border-yellow-500 inline-block">ARIES WU</h1>
        </div>
    </>
);

// --- SUB-COMPONENTS ---

const NarrativeOverlay = ({ text, subtext }: { text: string, subtext?: string }) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[90] bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.2, type: "spring", bounce: 0.5 }}
                className="text-center"
            >
                <h1 className="text-6xl md:text-[8rem] font-black text-white tracking-tighter uppercase drop-shadow-[0_0_20px_white] leading-none mb-4">
                    {text}
                </h1>
                {subtext && (
                    <div className="bg-yellow-500 text-black font-black text-xl md:text-3xl px-4 py-1 uppercase tracking-widest inline-block skew-x-[-10deg]">
                        {subtext}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

// SCENE 1: MANIFESTO
const ManifestoVisuals = ({ tick }: { tick: number }) => (
    <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
        {[1, 2, 3].map(i => (
            <div key={i}
                className={`absolute rounded-full border-[10px] md:border-[30px] border-white/10`}
                style={{
                    width: `${25 * i}vw`, height: `${25 * i}vw`,
                    transform: `scale(${1 + (tick % 4) * 0.2}) rotate(${tick * 20 * (i % 2 === 0 ? 1 : -1)}deg)`
                }}
            />
        ))}
        {tick % 4 === 0 && <div className="absolute inset-0 bg-white mix-blend-exclusion" />}
    </div>
);

// SCENE 2: ROSTER
const RosterVisuals = ({ tick }: { tick: number }) => {
    const images = Object.values(NOMINEE_IMAGES);
    const mockNames = ["ALEX", "SARAH", "BEATZ", "K-OS", "PRO-X", "MEL", "RHYTHM", "BASS", "VIBE", "WAVE", "FLOW", "DRIP"];
    const idx = tick % images.length;

    return (
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 grid grid-cols-6 opacity-40 grayscale">
                {images.slice(0, 24).map((src, i) => (
                    <div key={i} className={`bg-cover bg-center ${Math.random() > 0.5 ? 'invert' : ''}`} style={{ backgroundImage: `url(${src})`, opacity: Math.random() }} />
                ))}
            </div>

            {/* Foreground Card */}
            <div className="relative z-10 w-[80vw] h-[60vh] md:w-[500px] md:h-[600px] bg-black border-8 border-white shadow-[0_0_50px_rgba(255,255,255,0.5)] rotate-[-2deg]">
                <img src={images[idx]} className="w-full h-full object-cover contrast-125" />
                <div className="absolute bottom-8 left-0 bg-yellow-500 text-black text-6xl font-black px-4 uppercase tracking-tighter shadow-lg">
                    {mockNames[idx % mockNames.length]}
                </div>
            </div>

            {/* Subliminal Flash */}
            {tick % 4 === 0 && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white mix-blend-hard-light">
                    <h1 className="text-[20vw] font-black text-black leading-none">VOTE</h1>
                </div>
            )}
        </div>
    );
};

// SCENE 3: KINETIC TYPE
const CategoryVisuals = ({ categories, tick }: { categories: CategoryData[], tick: number }) => {
    const idx = Math.floor(tick) % (categories.length || 1);
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
                initial={{ scale: 0.5, rotate: 10, filter: "blur(20px)" }}
                animate={{ scale: 1.2, rotate: -5, filter: "blur(0px)" }}
                transition={{ duration: 0.2 }}
                className="bg-black px-12 py-8 shadow-[20px_20px_0px_white]"
            >
                <h1 className="text-4xl md:text-9xl font-black text-white tracking-tighter uppercase whitespace-nowrap">
                    {cat.title}
                </h1>
            </motion.div>
        </div>
    );
};

// SCENE 4: VOTING WAR
const VotingVisuals = ({ tick }: { tick: number }) => {
    const [a, setA] = useState(50);
    useEffect(() => {
        const diff = (Math.random() - 0.5) * 30; // Faster Jumps
        setA(prev => Math.min(90, Math.max(10, prev + diff)));
    }, [tick]);

    return (
        <div className="absolute inset-0 bg-black flex items-end">
            {/* Left Bar */}
            <div className="relative h-full bg-blue-600 border-r-4 border-white transition-all duration-75" style={{ width: `${a}%` }}>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-multiply" />
                <h1 className="absolute top-10 right-10 text-8xl font-black text-white italic">{Math.floor(a * 1000)}</h1>
            </div>
            {/* Right Bar */}
            <div className="relative h-full bg-red-600 border-l-4 border-white transition-all duration-75" style={{ width: `${100 - a}%` }}>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-multiply" />
                <h1 className="absolute bottom-10 left-10 text-8xl font-black text-white italic">{Math.floor((100 - a) * 1000)}</h1>
            </div>

            {/* Glitch Overlay */}
            {tick % 4 === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-white mix-blend-exclusion">
                    <h1 className="text-[10vw] font-black text-black">LEADER CHANGE</h1>
                </div>
            )}
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

// SCENE 6: BRANDING (Finale w/ Bandlab)
const FinaleVisuals = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-yellow-500">
        <Confetti isActive={true} />
        <div className="z-10 flex flex-col items-center animate-[zoomIn_0.5s_ease-out]">
            <h1 className="text-[12vw] font-black text-black leading-none tracking-tighter drop-shadow-xl">KYEBEEZY</h1>
            <div className="flex items-center gap-4 mt-4 bg-black p-4 md:p-8 skew-x-[-10deg] shadow-[20px_20px_0px_white]">
                <h2 className="text-[4vw] font-bold text-white tracking-widest uppercase">X</h2>
                <img src="/bandlab-logo.png" className="h-[6vw] filter invert brightness-0 saturate-100 invert" />
                <span className="text-[4vw] font-bold text-white tracking-tighter uppercase">BANDLAB</span>
            </div>

            <Link href="/awards/bandlab2025/live" className="mt-16 z-20 hover:scale-110 transition-transform duration-100">
                <button className="px-16 py-6 bg-black text-white font-black text-4xl uppercase border-4 border-white shadow-[10px_10px_0px_white] hover:shadow-[0_0_20px_white] hover:bg-white hover:text-black hover:border-black">
                    ENTER EXPERIENCE
                </button>
            </Link>
        </div>
        {/* Flash Overlay */}
        <div className="absolute inset-0 bg-white animate-[pulse_0.2s_ease-in-out_infinite] opacity-20 pointer-events-none" />
    </div>
);


export default function TeaserPageV14() {
    const [started, setStarted] = useState(false);
    const [tick, setTick] = useState(0);
    const [stepIndex, setStepIndex] = useState(0);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // FETCH
    useEffect(() => { getAwardsData().then(setCategories); }, []);

    // SEQUENCE DEFINITION (20 SECONDS TOTAL)
    const sequence: SequenceStep[] = [
        // 0-2s
        { id: 1, type: 'TEXT', sceneId: 1, duration: 1, text: { main: "100M", sub: "CREATORS" } },
        { id: 2, type: 'ACTION', sceneId: 1, duration: 1 },

        // 2-6s
        { id: 3, type: 'TEXT', sceneId: 2, duration: 1, text: { main: "ROSTER", sub: "FULL LIST" } },
        { id: 4, type: 'ACTION', sceneId: 2, duration: 3 },

        // 6-10s
        { id: 5, type: 'TEXT', sceneId: 3, duration: 1, text: { main: "12", sub: "CATEGORIES" } },
        { id: 6, type: 'ACTION', sceneId: 3, duration: 3 },

        // 10-14s
        { id: 7, type: 'TEXT', sceneId: 4, duration: 1, text: { main: "VOTE", sub: "NOW" } },
        { id: 8, type: 'ACTION', sceneId: 4, duration: 3 },

        // 14-16s
        { id: 9, type: 'TEXT', sceneId: 5, duration: 1, text: { main: "WIN", sub: "HISTORY" } },
        { id: 10, type: 'ACTION', sceneId: 5, duration: 1 },

        // 16s+
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
            // Play from 0 or specific intense part if desired. Currently start.
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

            {!started ? (
                <div onClick={handleStart} className="absolute inset-0 z-[200] bg-black flex flex-col items-center justify-center cursor-pointer group hover:bg-neutral-900 transition-colors">
                    <div className="w-40 h-40 rounded-full border-[10px] border-white flex items-center justify-center relative hover:scale-110 transition-transform">
                        <Play className="w-16 h-16 text-white fill-white ml-2" />
                    </div>
                    <h1 className="text-white font-black tracking-tighter text-5xl uppercase mt-8">IGNITE 20S</h1>
                    <p className="text-neutral-500 font-mono text-xs mt-4 uppercase tracking-widest">20 SECONDS SPEEDRUN</p>
                </div>
            ) : (
                <div className="absolute inset-0">
                    {/* SCREEN SHAKE */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{ x: tick % 4 === 0 ? [5, -5, 0] : 0 }}
                        transition={{ duration: 0.05 }}
                    >
                        <AnimatePresence mode="wait">
                            {currentStep.type === 'TEXT' ? (
                                <motion.div key={`text-${currentStep.id}`} className="absolute inset-0 z-50">
                                    <NarrativeOverlay text={currentStep.text?.main || ""} subtext={currentStep.text?.sub} />
                                </motion.div>
                            ) : (
                                <motion.div key={`scene-${currentStep.sceneId}`} className="absolute inset-0 z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    {currentStep.sceneId === 1 && <ManifestoVisuals tick={tick} />}
                                    {currentStep.sceneId === 2 && <RosterVisuals tick={tick} />}
                                    {currentStep.sceneId === 3 && <CategoryVisuals categories={categories} tick={tick} />}
                                    {currentStep.sceneId === 4 && <VotingVisuals tick={tick} />}
                                    {currentStep.sceneId === 5 && <RitualVisuals />}
                                    {currentStep.sceneId === 6 && <FinaleVisuals />}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* GLOBAL OVERLAYS */}
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,red_120%)] pointer-events-none mix-blend-overlay opacity-50" />
                    <button onClick={() => window.location.reload()} className="absolute top-6 right-6 font-bold text-xs text-white/50 hover:text-white z-[100] border px-2 py-1">RESTART</button>

                    {/* PROGRESS BAR */}
                    <div className="absolute bottom-0 left-0 h-2 bg-yellow-500 z-[900]" style={{ animation: `width 20s linear` }} />
                </div>
            )}
        </div>
    );
}

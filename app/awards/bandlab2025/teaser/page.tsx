"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import Link from "next/link";
import { getAwardsData, CategoryData } from "../../data-fetcher";
import { NOMINEE_IMAGES } from "../../nominee-images";
import { Confetti } from "@/components/ui/confetti";
import { TeaserHeroCard } from "@/components/awards/TeaserHeroCard";

// --- CONFIG ---
const MUSIC_BPM = 140;
const VISUAL_BPM = 280; // DOUBLE TIME
const TICK_MS = (60 / VISUAL_BPM) * 1000; // ~214ms
const AUDIO_URL = "/Memories_Take_Time.mp3";

// --- NARRATIVE COMPONENT (FASTER) ---
const NarrativeOverlay = ({ text, subtext, tick }: { text: string, subtext?: string, tick: number }) => {
    // Jitter Effect on every tick
    const jitter = tick % 2 === 0 ? "translate-x-1" : "-translate-x-1";

    return (
        <div className={`absolute inset-0 flex flex-col items-center justify-center z-[90] pointer-events-none mix-blend-difference ${jitter}`}>
            <motion.div
                key={text}
                initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                exit={{ scale: 1.5, opacity: 0, filter: "blur(20px)" }}
                transition={{ duration: 0.2 }} // Fast entry
                className="text-center"
            >
                <h1 className="text-8xl md:text-[10rem] font-black text-white tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] leading-none">
                    {text}
                </h1>
                {subtext && (
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                        className="text-2xl md:text-4xl font-black text-black bg-yellow-500 inline-block px-4 skew-x-12 mt-2"
                    >
                        {subtext}
                    </motion.p>
                )}
            </motion.div>
        </div>
    );
};

// --- SCENE 1: THE MANIFESTO (0-10s) - HYPER GLITCH ---
const ManifestoScene = ({ tick }: { tick: number }) => {
    return (
        <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
            {/* Chaos Rings */}
            {[1, 2, 3].map(i => (
                <div
                    key={i}
                    className={`absolute rounded-full border-[20px] border-white/10 ${i % 2 === 0 ? 'border-dashed' : ''}`}
                    style={{
                        width: `${30 * i}vw`, height: `${30 * i}vw`,
                        transform: `rotate(${tick * 45 * (i % 2 === 0 ? 1 : -1)}deg) scale(${1 + (tick % 4) * 0.1})`
                    }}
                />
            ))}

            {/* Subliminal Flash */}
            {tick % 4 === 0 && (
                <div className="absolute inset-0 bg-white mix-blend-difference z-10" />
            )}
        </div>
    );
};

// --- SCENE 2: THE ROSTER (10-30s) - DOUBLE TIME FLASH ---
const RosterScene = ({ tick }: { tick: number }) => {
    const images = useMemo(() => Object.values(NOMINEE_IMAGES), []);
    // Mock Names
    const mockNames = ["ALEX", "SARAH", "BEATZ", "K-OS", "PRO-X", "MEL", "RHYTHM", "BASS", "VIBE", "WAVE", "FLOW", "DRIP"];

    // Changing on EVERY TICK (2x per beat)
    const idx = tick % images.length;
    const currentImg = images[idx];
    const currentName = mockNames[idx % mockNames.length];

    // Subliminal Text Injection
    const showSubliminal = tick % 8 === 0;

    return (
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center overflow-hidden">
            {/* Background Chaos */}
            <div className="absolute inset-0 grid grid-cols-4 md:grid-cols-8 opacity-30 grayscale blur-sm">
                {images.slice(0, 32).map((src, i) => (
                    <div key={i} className={`bg-cover bg-center ${Math.random() > 0.5 ? 'invert' : ''}`} style={{ backgroundImage: `url(${src})`, opacity: Math.random() }} />
                ))}
            </div>

            {/* Main Card */}
            {!showSubliminal ? (
                <div className="relative z-10 w-[400px] h-[500px] bg-black border-[10px] border-white shadow-[0_0_50px_white] flex flex-col rotate-2">
                    <img src={currentImg} className="flex-1 object-cover contrast-125 saturate-0" />
                    <div className="h-24 bg-yellow-500 flex items-center justify-center">
                        <h1 className="text-6xl font-black text-black uppercase tracking-tighter">{currentName}</h1>
                    </div>
                </div>
            ) : (
                <div className="relative z-20 w-screen h-screen bg-white flex items-center justify-center box-border border-[50px] border-black">
                    <h1 className="text-[20vw] font-black text-black leading-none">VOTE</h1>
                </div>
            )}

            {/* RGB Split Overlay */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-hard-light" />
        </div>
    );
};

// --- SCENE 3: THE SCOPE (30-50s) - KINETIC TYRO ---
const CategoryScene = ({ categories, tick }: { categories: CategoryData[], tick: number }) => {
    const idx = Math.floor(tick / 2) % (categories.length || 1); // Change every beat
    const cat = categories[idx] || { title: "MUSIC" };

    // Background Words
    const bgWords = ["POP", "RAP", "ROCK", "R&B", "INDIE", "METAL", "JAZZ", "SOUL"];

    return (
        <div className="absolute inset-0 bg-yellow-400 flex items-center justify-center overflow-hidden">
            {/* Floating Background Words */}
            {bgWords.map((word, i) => (
                <motion.h1
                    key={i}
                    className="absolute text-9xl font-black text-black opacity-10 whitespace-nowrap"
                    style={{
                        left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                        transform: `rotate(${Math.random() * 360}deg)`
                    }}
                >
                    {word}
                </motion.h1>
            ))}

            <div className={`z-10 bg-black px-12 py-8 rotate-[-5deg] ${tick % 2 === 0 ? 'invert' : ''}`}>
                <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter uppercase whitespace-nowrap scale-110">
                    {cat.title}
                </h1>
            </div>
        </div>
    );
};

// --- SCENE 4: VOTING WAR (50-70s) - GLITCH RACE ---
const VotingScene = ({ tick }: { tick: number }) => {
    const [a, setA] = useState(50);

    useEffect(() => {
        // More chaotic changes
        const diff = (Math.random() - 0.5) * 10;
        setA(prev => Math.min(95, Math.max(5, prev + diff)));
    }, [tick]);

    return (
        <div className="absolute inset-0 bg-black flex flex-col relative">
            {/* Bar A */}
            <div className="flex-1 bg-neutral-900 relative border-b-4 border-black group">
                <div className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-75 ease-linear" style={{ width: `${a}%` }} />
                <h1 className="absolute right-10 top-1/2 -translate-y-1/2 text-9xl font-black text-white mix-blend-difference italic">
                    {Math.floor(a * 1000)}
                </h1>
            </div>

            {/* Bar B */}
            <div className="flex-1 bg-neutral-900 relative group">
                <div className="absolute inset-y-0 left-0 bg-red-600 transition-all duration-75 ease-linear" style={{ width: `${100 - a}%` }} />
                <h1 className="absolute right-10 top-1/2 -translate-y-1/2 text-9xl font-black text-white mix-blend-difference italic">
                    {Math.floor((100 - a) * 1000)}
                </h1>
            </div>

            {/* Glitch Overlay every 4 ticks */}
            {tick % 4 === 0 && (
                <div className="absolute inset-0 bg-white mix-blend-exclusion z-50 text-black flex items-center justify-center">
                    <h1 className="text-[10vw] font-black">LEADER CHANGE</h1>
                </div>
            )}
        </div>
    );
};

// --- SCENE 5: RITUAL (70-85s) ---
const RitualScene = () => {
    return (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="scale-150 animate-pulse">
                <TeaserHeroCard isRevealed={true} onRevealComplete={() => { }} />
            </div>
        </div>
    );
};

// --- SCENE 6: FINALE (85s+) ---
const FinaleScene = () => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white mix-blend-difference">
            <Confetti isActive={true} />
            <h1 className="text-[15vw] font-black text-white leading-none tracking-tighter">KYEBEEZY</h1>
            <h2 className="text-[5vw] font-bold text-white/50 tracking-[0.5em] bg-black px-4">AWARDS 2025</h2>

            <Link href="/awards/bandlab2025/live" className="mt-12 z-20">
                <button className="px-20 py-8 bg-yellow-500 text-black font-black text-4xl uppercase hover:scale-105 transition-transform border-4 border-black shadow-[15px_15px_0px_black]">
                    ENTER
                </button>
            </Link>
        </div>
    );
};

// --- SCENE 7: CREDITS (Sponsor & Producer) ---
const CreditsScene = () => {
    return (
        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-[100]">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="flex flex-col items-center mb-16"
            >
                <p className="text-black font-bold tracking-[0.3em] text-sm mb-6 uppercase">Sponsored By</p>
                <img
                    src="https://player.awbest.tech/image/icon/icon.svg"
                    alt="AWBEST"
                    className="w-32 h-32 mb-4 drop-shadow-2xl"
                />
                <h1 className="text-4xl font-black text-black tracking-tighter">AWBEST</h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="flex flex-col items-center"
            >
                <p className="text-neutral-500 font-bold tracking-[0.3em] text-xs mb-4 uppercase">Event Produced By</p>
                <h1 className="text-6xl font-black text-black tracking-tighter uppercase">ARIES WU</h1>
            </motion.div>
        </div>
    );
};

// --- CONTROLLER ---

export default function TeaserPageV12() {
    const [started, setStarted] = useState(false);
    const [tick, setTick] = useState(0);
    const [act, setAct] = useState(0);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // FETCH DATA
    useEffect(() => { getAwardsData().then(setCategories); }, []);

    // ENGINE
    useEffect(() => {
        if (!started) return;

        // VISUAL LOOP (DOUBLE TIME)
        const interval = setInterval(() => setTick(t => t + 1), TICK_MS);

        // TIMELINE (SECONDS)
        const timeline = [
            { t: 0, act: 1 },  // Manifesto
            { t: 10, act: 2 }, // Roster
            { t: 30, act: 3 }, // Categories
            { t: 50, act: 4 }, // Voting
            { t: 70, act: 5 }, // Ritual
            { t: 85, act: 6 }, // Show
            { t: 95, act: 7 }, // Credits (NEW)
        ];

        const timers = timeline.map(item => setTimeout(() => setAct(item.act), item.t * 1000));
        return () => { clearInterval(interval); timers.forEach(clearTimeout); };
    }, [started]);

    // HANDLER: DIRECT AUDIO TRIGGER
    const handleStart = () => {
        if (audioRef.current) {
            audioRef.current.volume = 1.0;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => setStarted(true)).catch(() => setStarted(true));
            }
        } else {
            setStarted(true);
        }
    };

    // NARRATIVE TEXT
    const overlayText = useMemo(() => {
        if (act === 1) return { main: "100M CREATORS", sub: "GLOBAL SCALE" };
        if (act === 2) return { main: "THE ROSTER", sub: "100+ NOMINEES" };
        if (act === 3) return { main: "12 CATEGORIES", sub: "GENRE BENDING" };
        if (act === 4) return { main: "YOUR VOTE", sub: "DECIDES DESTINY" };
        if (act === 5) return { main: "WITNESS", sub: "THE CROWNING" };
        return null; // No overlay for credits
    }, [act]);

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative font-sans cursor-none select-none">
            {/* PERSISTENT AUDIO ELEMENT - MOVED OUTSIDE CONDITIONAL */}
            <audio ref={audioRef} src={AUDIO_URL} preload="auto" loop />

            {!started ? (
                <div onClick={handleStart} className="absolute inset-0 z-[200] bg-black flex flex-col items-center justify-center cursor-pointer group select-none">
                    <div className="w-40 h-40 rounded-full bg-white flex items-center justify-center relative hover:scale-110 transition-transform shadow-[0_0_100px_white]">
                        <Play className="w-16 h-16 text-black fill-black ml-2" />
                    </div>
                    <h1 className="text-white font-black tracking-tighter text-6xl uppercase mt-8 drop-shadow-2xl">IGNITE</h1>
                    <p className="text-neutral-500 font-mono text-sm mt-4 uppercase tracking-widest border border-white/20 px-4 py-1">CLICK TO INITIALIZE AUDIO ENGINE</p>
                </div>
            ) : (
                <>
                    {/* SCREEN SHAKE (Heavy) */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{ x: tick % 4 === 0 ? [10, -10, 0] : 0, scale: tick % 8 === 0 ? 1.05 : 1 }}
                        transition={{ duration: 0.05 }}
                    >
                        {act === 1 && <ManifestoScene tick={tick} />}
                        {act === 2 && <RosterScene tick={tick} />}
                        {act === 3 && <CategoryScene categories={categories} tick={tick} />}
                        {act === 4 && <VotingScene tick={tick} />}
                        {act === 5 && <RitualScene />}
                        {act === 6 && <FinaleScene />}
                        {act === 7 && <CreditsScene />}
                    </motion.div>

                    {/* NARRATIVE OVERLAY */}
                    <AnimatePresence mode="wait">
                        {overlayText && act < 7 && (
                            <NarrativeOverlay
                                key={act}
                                text={overlayText.main}
                                subtext={overlayText.sub}
                                tick={tick}
                            />
                        )}
                    </AnimatePresence>

                    {/* GLOBAL VFX (Heavy) */}
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay" />

                    {/* Vignette with Red Pulse */}
                    <motion.div
                        animate={{ opacity: [0, 0.5, 0] }}
                        transition={{ duration: 0.2, repeat: Infinity }}
                        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,red_150%)] pointer-events-none mix-blend-overlay"
                    />

                    <button onClick={() => window.location.reload()} className="absolute top-6 right-6 font-bold text-xs text-white/50 hover:text-white z-[100] border px-2 py-1">RESTART</button>
                </>
            )}
        </div>
    );
}

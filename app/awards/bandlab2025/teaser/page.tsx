"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Play, Volume2, VolumeX, SkipForward, Zap, User, Terminal, Activity, globe } from "lucide-react";
import Link from "next/link";
import { getAwardsData, CategoryData } from "../../data-fetcher";
import { NOMINEE_IMAGES } from "../../nominee-images";
import { Confetti } from "@/components/ui/confetti";
import { TeaserHeroCard } from "@/components/awards/TeaserHeroCard";

// --- CONFIG ---
const BPM = 120;
const BEAT_MS = (60 / BPM) * 1000; // 500ms
const AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

// --- SUB-COMPONENTS ---

// ACT 1: TERMINAL BOOT (0-10s)
const TerminalBoot = () => {
    const [lines, setLines] = useState<string[]>([]);

    useEffect(() => {
        const bootText = [
            "INITIALIZING KERNEL...",
            "LOADING ASSETS...",
            "CONNECTING TO BANDLAB SECURE SERVER...",
            "FETCHING NOMINEE DATA...",
            "VERIFYING INTEGRITY...",
            "SYSTEM READY.",
            "EXECUTING SEQUENCE..."
        ];
        let i = 0;
        const interval = setInterval(() => {
            if (i < bootText.length) {
                setLines(prev => [...prev, bootText[i]]);
                i++;
            }
        }, 300); // Fast text
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 bg-black p-10 font-mono text-green-500 text-xs md:text-sm overflow-hidden flex flex-col justify-end pb-20">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-[scan_2s_linear_infinite]" />
            {lines.map((line, i) => (
                <div key={i} className="mb-1 opacity-80">> {line}</div>
            ))}
            <div className="animate-pulse">_</div>

            {/* Glitch Overlay */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 pointer-events-none mix-blend-overlay" />
        </div>
    );
};

// ACT 2: RAPID FIRE ROSTER (10-30s)
const RapidFireRoster = ({ beat }: { beat: number }) => {
    const images = useMemo(() => Object.values(NOMINEE_IMAGES), []);
    // Change image every beat (500ms) or half beat? Let's do Fast: Every beat is 2 switch
    const currentImgIndex = Math.floor((Date.now() / 200) % images.length);
    const currentImg = images[currentImgIndex];

    return (
        <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
            {/* Background Echo */}
            <motion.div
                key={currentImgIndex + "_bg"}
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-110"
                style={{ backgroundImage: `url(${currentImg})` }}
            />

            {/* Main Cut */}
            <div className="relative z-10 w-[80vw] h-[60vh] md:w-[500px] md:h-[500px]">
                <img
                    src={currentImg}
                    className="w-full h-full object-cover border-4 border-white/50 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
                />
                <div className="absolute bottom-0 left-0 bg-yellow-500 text-black font-black px-4 py-1 text-xl tracking-tighter">
                    NOMINEE #{currentImgIndex + 1}
                </div>
            </div>

            {/* Flash Overlay on Beat */}
            <motion.div
                animate={{ opacity: [0.5, 0] }}
                transition={{ duration: 0.2 }}
                key={beat} // Trigger on beat
                className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none"
            />

            <h1 className="absolute top-10 w-full text-center text-8xl font-black text-white/10 tracking-[0.2em] scale-150">
                THE ROSTER
            </h1>
        </div>
    );
};

// ACT 3: KINETIC TYPOGRAPHY (30-50s)
const KineticType = ({ categories, beat }: { categories: CategoryData[], beat: number }) => {
    const catIndex = beat % categories.length;
    const cat = categories[catIndex] || { title: "LEGENDS" };

    return (
        <div className="absolute inset-0 bg-yellow-500 flex items-center justify-center overflow-hidden">
            <motion.div
                key={cat.title}
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.5 }}
                className="text-center"
            >
                <h1 className="text-black font-black text-6xl md:text-9xl tracking-tighter leading-none uppercase stroke-black stroke-2">
                    {cat.title}
                </h1>
            </motion.div>

            {/* Strobe Black */}
            <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.1 }}
                key={beat}
                className="absolute inset-0 bg-black pointer-events-none mix-blend-multiply"
            />
        </div>
    );
};

// ACT 4: VOTING WAR (50-70s)
const VotingWar = ({ beat }: { beat: number }) => {
    // Hyper fast numbers
    return (
        <div className="absolute inset-0 bg-neutral-900 grid grid-cols-2">
            <div className="flex items-center justify-center bg-blue-600 relative overflow-hidden">
                <h1 className="text-[10rem] font-black text-white mix-blend-overlay italic">
                    {Math.floor(Date.now() / 10 % 1000)}
                </h1>
                <div className="absolute inset-0 bg-black/20 animate-pulse" />
            </div>
            <div className="flex items-center justify-center bg-red-600 relative overflow-hidden">
                <h1 className="text-[10rem] font-black text-white mix-blend-overlay italic">
                    {Math.floor((Date.now() + 500) / 13 % 1000)}
                </h1>
                <div className="absolute inset-0 bg-black/20 animate-pulse" style={{ animationDelay: "0.1s" }} />
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                    className="bg-black text-white font-black text-4xl px-8 py-4 border-4 border-yellow-500 rotate-3"
                >
                    VS
                </motion.div>
            </div>

            <h2 className="absolute bottom-10 w-full text-center text-4xl font-black text-white uppercase tracking-widest drop-shadow-xl">
                EVERY VOTE COUNTS
            </h2>
        </div>
    );
};

// ACT 5: RITUAL (70-85s)
const FinalRitual = ({ isRevealed }: { isRevealed: boolean }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="scale-150">
                <TeaserHeroCard isRevealed={isRevealed} onRevealComplete={() => { }} />
            </div>
            {/* Particles */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 animate-pulse mix-blend-overlay" />
        </div>
    );
};

// ACT 6: FINAL SHOWCASE (85s+)
const FinalShowcase = () => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
            <Confetti isActive={true} />
            <motion.div
                initial={{ scale: 3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 flex flex-col items-center mix-blend-difference"
            >
                <h1 className="text-[12vw] font-black text-white leading-none tracking-tighter">
                    KYEBEEZY
                </h1>
                <h1 className="text-[8vw] font-black text-neutral-400 leading-none tracking-tighter">
                    AWARDS 2025
                </h1>

                <div className="mt-12 flex gap-4">
                    <Link href="/awards/bandlab2025/live">
                        <button className="px-12 py-6 bg-yellow-500 text-black font-black text-2xl uppercase hover:bg-yellow-400 transition-colors">
                            ENTER EVENT
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

// --- CONTROLLER ---

export default function TeaserPageV8() {
    const [started, setStarted] = useState(false);
    const [beat, setBeat] = useState(0); // The Heartbeat (0, 1, 2, 3...)
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

        // Start Audio
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }

        // Beat Loop (Every 500ms)
        const beatInterval = setInterval(() => {
            setBeat(b => b + 1);
        }, BEAT_MS);

        // Timeline (Seconds)
        const timeline = [
            { t: 0, act: 1 },  // Boot
            { t: 10, act: 2 }, // Roster
            { t: 30, act: 3 }, // Text
            { t: 50, act: 4 }, // War
            { t: 70, act: 5 }, // Ritual
            { t: 85, act: 6 }, // Show
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
            <div onClick={() => setStarted(true)} className="h-screen w-screen bg-black flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-900 transition-colors group">
                <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin" />
                    <Play className="w-12 h-12 text-white fill-white ml-2 transition-transform group-hover:scale-125" />
                </div>
                <h1 className="text-white font-black tracking-[0.5em] text-2xl uppercase mt-8">Initialize V8</h1>
                <p className="text-neutral-500 text-sm mt-2 uppercase tracking-widest">Duration: 90s • High Intensity</p>
                <audio ref={audioRef} src={AUDIO_URL} preload="auto" loop />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative font-sans cursor-none">
            {/* Progress Bar */}
            <motion.div
                className="absolute top-0 left-0 h-1 bg-yellow-500 z-[100]"
                initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 90, ease: "linear" }}
            />

            {/* Controls (Hidden UI) */}
            <div className="absolute top-6 right-6 z-[100] opacity-50 hover:opacity-100 transition-opacity">
                <button onClick={() => { setStarted(false); setAct(0); }} className="text-white font-bold text-xs uppercase tracking-widest border border-white/50 px-2 py-1">
                    RESTART
                </button>
            </div>

            {/* STAGE MANAGER */}
            <div className="absolute inset-0">
                {act === 1 && <TerminalBoot />}
                {act === 2 && <RapidFireRoster beat={beat} />}
                {act === 3 && <KineticType categories={categories} beat={beat} />}
                {act === 4 && <VotingWar beat={beat} />}
                {act === 5 && <FinalRitual isRevealed={true} />} {/* Auto-reveal immediately for Montage */}
                {act === 6 && <FinalShowcase />}
            </div>

            {/* GLOBAL OVERLAYS */}
            {/* Film Grain */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none z-[60] mix-blend-overlay animate-pulse" />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,black_100%)] z-[50] pointer-events-none" />

            {/* Timecode */}
            <div className="absolute bottom-6 right-6 font-mono text-xs text-white/30 z-[70]">
                T-{90 - (beat * 0.5)}s :: ACT {act}
            </div>

        </div>
    );
}

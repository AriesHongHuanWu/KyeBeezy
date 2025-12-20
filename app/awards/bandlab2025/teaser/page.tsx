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
const BPM = 140;
const BEAT_MS = (60 / BPM) * 1000;
const AUDIO_URL = "/Memories_Take_Time.wav"; // User provided track

// --- NARRATIVE COMPONENT ---
const NarrativeOverlay = ({ text, subtext }: { text: string, subtext?: string }) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[90] pointer-events-none mix-blend-difference">
            <motion.div
                key={text}
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.2, opacity: 0, y: -50 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="text-center"
            >
                <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase drop-shadow-[0_0_10px_black]">
                    {text}
                </h1>
                {subtext && (
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="text-xl md:text-3xl font-bold text-yellow-500 tracking-[0.5em] mt-4 bg-black/50 inline-block px-4 py-1"
                    >
                        {subtext}
                    </motion.p>
                )}
            </motion.div>
        </div>
    );
};

// --- SCENE 1: THE MANIFESTO (0-15s) ---
const ManifestoScene = () => {
    return (
        <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
            {/* Data Globe Visuals */}
            <motion.div
                className="w-[80vw] h-[80vw] border border-yellow-500/20 rounded-full animate-[spin_20s_linear_infinite]"
            />
            <motion.div
                className="absolute w-[60vw] h-[60vw] border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"
            />

            {/* Background Particles representing creators */}
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    animate={{
                        x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                        y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                        opacity: [0, 1, 0]
                    }}
                    transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear" }}
                />
            ))}

            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
    );
};

// --- SCENE 2: THE ROSTER (15-35s) - NAMES & FACES ---
const RosterScene = ({ beat }: { beat: number }) => {
    const images = useMemo(() => Object.values(NOMINEE_IMAGES), []);
    // Mock Names for Narrative Impact
    const mockNames = ["ALEX R.", "SARAH J.", "BEATMASTER", "LIL K.", "PRODUCER X", "MELODY Q", "RHYTHM K", "BASS GOD"];

    // Cycle every beat
    const idx = beat % images.length;
    const currentImg = images[idx];
    const currentName = mockNames[idx % mockNames.length];

    return (
        <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center overflow-hidden">
            {/* Moving Wall Background */}
            <div className="absolute inset-0 grid grid-cols-6 opacity-20 filter blur-sm">
                {images.slice(0, 24).map((src, i) => (
                    <div key={i} className="bg-cover bg-center border border-white/5" style={{ backgroundImage: `url(${src})` }} />
                ))}
            </div>

            {/* Hero Card Presentation */}
            <motion.div
                key={beat}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 w-[300px] h-[400px] bg-black border-4 border-white shadow-2xl flex flex-col"
            >
                <img src={currentImg} className="flex-1 object-cover" />
                <div className="h-16 bg-white flex items-center justify-center p-2">
                    <h1 className="text-3xl font-black text-black uppercase tracking-tighter">{currentName}</h1>
                </div>
            </motion.div>

            {/* Strobe */}
            <motion.div
                key={`strobe-${beat}`}
                animate={{ opacity: [0.5, 0] }}
                className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none"
            />
        </div>
    );
};

// --- SCENE 3: THE SCOPE (35-55s) - CATEGORIES ---
const CategoryScene = ({ categories, beat }: { categories: CategoryData[], beat: number }) => {
    const idx = Math.floor(beat / 2) % (categories.length || 1);
    const cat = categories[idx] || { title: "GENRES" };

    return (
        <div className="absolute inset-0 bg-yellow-500 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex flex-col gap-2 opacity-10">
                {[...Array(10)].map((_, i) => (
                    <h1 key={i} className="text-9xl font-black text-black whitespace-nowrap">{cat.title} {cat.title}</h1>
                ))}
            </div>

            <motion.div
                key={cat.title}
                initial={{ scale: 0.5, filter: "blur(10px)" }}
                animate={{ scale: 1.5, filter: "blur(0px)" }}
                className="z-10 bg-black px-8 py-4 rotate-[-5deg]"
            >
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase whitespace-nowrap">
                    {cat.title}
                </h1>
            </motion.div>
        </div>
    );
};

// --- SCENE 4: THE POWER (55-75s) - VOTING ---
const VotingScene = () => {
    // Bar Race
    const [a, setA] = useState(50);
    useEffect(() => {
        const i = setInterval(() => setA(prev => Math.min(90, Math.max(10, prev + (Math.random() > 0.5 ? 2 : -2)))), 50);
        return () => clearInterval(i);
    }, []);

    return (
        <div className="absolute inset-0 bg-black flex flex-col justify-center gap-10 p-10">
            {/* Bar 1 */}
            <div className="w-full h-32 bg-neutral-800 relative overflow-hidden">
                <motion.div
                    animate={{ width: `${a}%` }}
                    className="absolute inset-y-0 left-0 bg-blue-600 flex items-center justify-end px-4"
                >
                    <span className="text-6xl font-black text-white italic">{Math.floor(a * 1452)}</span>
                </motion.div>
            </div>
            {/* Bar 2 */}
            <div className="w-full h-32 bg-neutral-800 relative overflow-hidden">
                <motion.div
                    animate={{ width: `${100 - a}%` }}
                    className="absolute inset-y-0 left-0 bg-red-600 flex items-center justify-end px-4"
                >
                    <span className="text-6xl font-black text-white italic">{Math.floor((100 - a) * 1420)}</span>
                </motion.div>
            </div>

            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
        </div>
    );
};

// --- SCENE 5: THE RITUAL (75-90s) ---
const RitualScene = () => {
    return (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="scale-150">
                <TeaserHeroCard isRevealed={true} onRevealComplete={() => { }} />
            </div>
        </div>
    );
};

// --- SCENE 6: FINALE (90s+) ---
const FinaleScene = () => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white mix-blend-difference">
            <Confetti isActive={true} />
            <h1 className="text-[12vw] font-black text-white leading-none tracking-tighter">KYEBEEZY</h1>
            <h2 className="text-[4vw] font-bold text-white/50 tracking-[1em]">AWARDS 2025</h2>
            <Link href="/awards/bandlab2025/live" className="mt-12 z-20">
                <button className="px-12 py-6 bg-yellow-500 text-black font-black text-2xl uppercase hover:scale-110 transition-transform">
                    ENTER LIVE
                </button>
            </Link>
        </div>
    );
};

// --- CONTROLLER ---

export default function TeaserPageV10() {
    const [started, setStarted] = useState(false);
    const [beat, setBeat] = useState(0);
    const [act, setAct] = useState(0);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // FETCH DATA
    useEffect(() => { getAwardsData().then(setCategories); }, []);

    // ENGINE
    useEffect(() => {
        if (!started) return;
        if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); }

        const beatInterval = setInterval(() => setBeat(b => b + 1), BEAT_MS);

        // 90s NARRATIVE TIMELINE
        const timeline = [
            { t: 0, act: 1 },  // Manifesto
            { t: 15, act: 2 }, // Roster
            { t: 35, act: 3 }, // Categories
            { t: 55, act: 4 }, // Voting
            { t: 75, act: 5 }, // Ritual
            { t: 90, act: 6 }, // Show
        ];

        const timers = timeline.map(item => setTimeout(() => setAct(item.act), item.t * 1000));
        return () => { clearInterval(beatInterval); timers.forEach(clearTimeout); };
    }, [started]);

    // NARRATIVE TEXT STATE
    const overlayText = useMemo(() => {
        if (act === 1) return { main: "100M CREATORS", sub: "ONE COMMUNITY" };
        if (act === 2) return { main: "THE CONTENDERS", sub: "RISING STARS" };
        if (act === 3) return { main: "12 CATEGORIES", sub: "REDEFINING SOUND" };
        if (act === 4) return { main: "THE POWER", sub: "IS YOURS" };
        if (act === 5) return { main: "WITNESS", sub: "HISTORY" };
        return null;
    }, [act]);

    if (!started) {
        return (
            <div onClick={() => setStarted(true)} className="h-screen w-screen bg-black flex flex-col items-center justify-center cursor-pointer group">
                <div className="w-32 h-32 rounded-full border-[10px] border-white flex items-center justify-center relative hover:scale-110 transition-transform">
                    <Play className="w-12 h-12 text-white fill-white ml-2" />
                </div>
                <h1 className="text-white font-black tracking-tighter text-4xl uppercase mt-8">START TRAILER</h1>
                <p className="text-neutral-500 font-mono text-sm mt-2 uppercase tracking-widest">MEMORIES TAKE TIME.wav</p>
                <audio ref={audioRef} src={AUDIO_URL} preload="auto" />
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative font-sans cursor-none select-none">
            {/* SCREEN SHAKE ON BEAT */}
            <motion.div
                className="absolute inset-0"
                animate={{ x: beat % 4 === 0 ? [5, -5, 0] : 0 }}
                transition={{ duration: 0.1 }}
            >
                {act === 1 && <ManifestoScene />}
                {act === 2 && <RosterScene beat={beat} />}
                {act === 3 && <CategoryScene categories={categories} beat={beat} />}
                {act === 4 && <VotingScene />}
                {act === 5 && <RitualScene />}
                {act === 6 && <FinaleScene />}
            </motion.div>

            {/* NARRATIVE OVERLAY */}
            <AnimatePresence>
                {overlayText && (
                    <NarrativeOverlay
                        key={act} // Reset on act change
                        text={overlayText.main}
                        subtext={overlayText.sub}
                    />
                )}
            </AnimatePresence>

            {/* GLOBAL VFX */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none mix-blend-overlay animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] pointer-events-none" />

            {/* PROGRESS */}
            <div className="absolute bottom-10 left-10 flex gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-12 h-2 ${act >= i ? 'bg-yellow-500' : 'bg-neutral-800'}`} />
                ))}
            </div>

            <button onClick={() => { setStarted(false); setAct(0); }} className="absolute top-6 right-6 font-bold text-xs text-white/50 hover:text-white z-[100] border px-2 py-1">RESTART</button>
        </div>
    );
}

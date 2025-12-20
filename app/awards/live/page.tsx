"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Star, Crown, Sparkles, MonitorPlay, ArrowLeft, Lock, Trophy } from "lucide-react";
import { getAwardsData } from "../data-fetcher";
import { Confetti } from "@/components/ui/confetti";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// --- Types ---
interface Nominee {
    name: string;
    voteCount: number;
    image?: string;
}

interface CategoryData {
    id: string;
    title: string;
    nominees: Nominee[];
    winner: Nominee | null;
}

// --- Components ---

// 0. Waiting Room (Admin Locked)
const WaitingRoom = () => (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-black relative overflow-hidden font-sans z-50">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="z-10 relative flex flex-col items-center gap-6"
        >
            <div className="p-6 rounded-full bg-white/5 border border-white/10 relative">
                <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse" />
                <Lock className="w-12 h-12 text-white/50 relative z-10" />
            </div>

            <h1 className="text-3xl font-bold text-white tracking-widest uppercase">
                Stream Starting Soon
            </h1>
            <p className="text-white/30 font-mono text-sm animate-pulse">
                WAITING FOR HOST TO BEGIN CEREMONY...
            </p>
        </motion.div>
    </div>
);

// 1. Intro Slide (Dramatic Opening)
const IntroSlide = ({ onStart }: { onStart: () => void }) => (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-black relative overflow-hidden font-sans">
        {/* Animated Background Rays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.15)_0%,transparent_70%)] animate-pulse" />

        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="z-10 relative flex flex-col items-center"
        >
            <div className="mb-10 relative">
                <div className="absolute inset-0 bg-yellow-500/30 blur-3xl rounded-full animate-pulse" />
                {/* Bandlab Logo with Gold Tint Effect */}
                <img
                    src="/bandlab-logo.png"
                    alt="Bandlab Logo"
                    className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]"
                    style={{ filter: "brightness(0) saturate(100%) invert(83%) sepia(36%) saturate(1000%) hue-rotate(2deg) brightness(108%) contrast(105%)" }} // Approximate Gold Filter
                />
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-700 drop-shadow-[0_0_50px_rgba(234,179,8,0.4)] mb-4 tracking-tighter">
                Bandlab Award
            </h1>
            <p className="text-xl md:text-2xl text-white/50 font-light tracking-[0.6em] uppercase mb-16">
                2025 Ceremony
            </p>

            <button
                onClick={onStart}
                className="group px-10 py-5 bg-white text-black hover:bg-yellow-400 font-black tracking-widest uppercase transition-all rounded-full flex items-center gap-3 mx-auto shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)] hover:scale-105"
            >
                Start Show <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
    </div>
);

// 2. Outro Slide (Credits & Redirect)
const OutroSlide = () => {
    const router = useRouter();

    useEffect(() => {
        // Redirect after 5 seconds
        const timer = setTimeout(() => {
            router.push("/awards");
        }, 6000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center h-screen text-center bg-black relative overflow-hidden font-sans">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="z-10"
            >
                <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-8 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]" />
                <h2 className="text-6xl font-black text-white mb-4">THANK YOU!</h2>
                <p className="text-xl text-neutral-400 mb-8">Redirecting to full results...</p>
                <div className="w-64 h-1 bg-white/10 rounded-full mx-auto overflow-hidden">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 6, ease: "linear" }}
                        className="h-full bg-yellow-500"
                    />
                </div>
            </motion.div>
        </div>
    );
}

// --- Gold Dust Particles ---
const GoldDust = () => (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-0"
                initial={{
                    x: Math.random() * 100 + "vw",
                    y: Math.random() * 100 + "vh",
                    scale: 0
                }}
                animate={{
                    y: [null, Math.random() * 100 - 50 + "vh"], // Float up/down/random
                    opacity: [0, 0.8, 0],
                    scale: [0, 1.5, 0]
                }}
                transition={{
                    duration: 3 + Math.random() * 5,
                    repeat: Infinity,
                    delay: Math.random() * 5,
                    ease: "easeInOut"
                }}
            />
        ))}
    </div>
);

// 3. Thick 3D Gacha Card (Cinematic Ritual Version)
const GachaCard = ({ winner, onReveal, onFocus }: { winner: Nominee, onReveal: () => void, onFocus: (focused: boolean) => void }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isCharging, setIsCharging] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    // --- Audio Helper ---
    const playSound = (type: 'tada' | 'charge') => {
        // Mock Charging sound if available, otherwise just silent anticipation
        if (type === 'tada') {
            const audio = new Audio("https://www.myinstants.com/media/sounds/tada-fanfare-a.mp3");
            audio.volume = 0.8;
            audio.play().catch(e => console.warn("Audio play failed", e));
        }
    };

    const handleClick = () => {
        if (isRevealed || isCharging) return;

        // 1. Start Ritual (Charge Up)
        setIsCharging(true);
        onFocus(true); // Dim background

        // playSound('charge'); // Optional: Add charging sound here

        // 2. Wait for Build-up (Anticipation)
        setTimeout(() => {
            // 3. EXPLOSION & REVEAL
            setShowFlash(true);
            playSound('tada');
            setIsRevealed(true);
            setIsCharging(false);
            onReveal();

            // 4. Cleanup Flash
            setTimeout(() => setShowFlash(false), 800);
        }, 1500); // 1.5s Suspense
    };

    return (
        <div className="flex flex-col items-center justify-center py-10 relative z-20 perspective-1000">
            {/* Cinematic Spotlight (Appears during charging/reveal) */}
            <motion.div
                animate={{ opacity: isCharging || isRevealed ? 1 : 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle_choke,rgba(234,179,8,0.15)_0%,transparent_70%)] pointer-events-none transition-opacity duration-1000"
            />

            {/* Energy Field (Charging Effect) */}
            {isCharging && (
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[600px] rounded-[50px] border-2 border-yellow-400 opacity-0"
                    animate={{ scale: [1, 1.1], opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />
            )}

            {/* Glow Effect behind the card */}
            <motion.div
                animate={{
                    scale: isCharging ? 1.5 : (isRevealed ? 1.2 : 1),
                    opacity: isCharging ? 0.8 : (isRevealed ? 0.8 : 0.4)
                }}
                transition={{ duration: 1 }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/20 blur-[100px] rounded-full transition-opacity duration-1000`}
            />

            <motion.div
                className="relative w-[340px] h-[520px] cursor-pointer group"
                onClick={handleClick}
                initial={{ y: 0 }}
                animate={{
                    rotateY: isRevealed ? 180 : 0,
                    y: isRevealed ? [0, -40, 0] : (isCharging ? [0, -20, 0] : [0, -15, 0]),
                    x: isCharging ? [-2, 2, -2, 2, 0] : 0, // Vibration
                    scale: isCharging ? 1.05 : 1,
                }}
                transition={{
                    rotateY: { duration: 0.8, ease: "easeInOut" },
                    y: { duration: isCharging ? 0.2 : 4, repeat: Infinity, ease: isCharging ? "linear" : "easeInOut" }, // Rapid float vibrate when charging
                    x: { duration: 0.05, repeat: Infinity }, // Vibration
                    scale: { duration: 1.5, ease: "easeOut" } // Grow during charge
                }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* --- 3D THICKNESS SIDES (Hiding on Reveal to prevent Glitch) --- */}
                {/* Visual Fix: Opacity 0 when revealed so they don't clip through the front face */}
                <motion.div animate={{ opacity: isRevealed ? 0 : 1 }} transition={{ duration: 0.3 }}>
                    {/* Right Side */}
                    <div className="absolute top-[60px] right-0 w-[12px] h-[calc(100%-120px)] bg-yellow-800 origin-right transform rotateY(-90deg) translateZ(1px)" />
                    {/* Left Side */}
                    <div className="absolute top-[60px] left-0 w-[12px] h-[calc(100%-120px)] bg-yellow-600 origin-left transform rotateY(90deg) translateZ(1px)" />
                    {/* Top Side */}
                    <div className="absolute top-0 left-[60px] w-[calc(100%-120px)] h-[12px] bg-yellow-700 origin-top transform rotateX(-90deg) translateZ(1px)" />
                    {/* Bottom Side */}
                    <div className="absolute bottom-0 left-[60px] w-[calc(100%-120px)] h-[12px] bg-yellow-900 origin-bottom transform rotateX(90deg) translateZ(1px)" />
                </motion.div>

                {/* White Flash Overlay */}
                <AnimatePresence>
                    {showFlash && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-white rounded-[30px] pointer-events-none mix-blend-overlay"
                            style={{ transform: "translateZ(60px)" }}
                        />
                    )}
                </AnimatePresence>

                {/* CARD BACK (Mystery) */}
                <div
                    className="absolute inset-0 rounded-[30px] border-4 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)] bg-black z-20 overflow-hidden"
                    style={{ backfaceVisibility: "hidden", transform: "translateZ(2px)" }}
                >
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-yellow-900/40" />

                    {/* Charging Overlay */}
                    {isCharging && <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay animate-pulse" />}

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="relative mb-6">
                            <div className={`absolute inset-0 bg-yellow-500/20 blur-xl rounded-full ${isCharging ? 'animate-ping' : 'animate-pulse'}`} />
                            <Sparkles className={`w-24 h-24 text-yellow-400 relative z-10 ${isCharging ? 'animate-spin' : ''} transition-all duration-[2s]`} />
                        </div>
                        <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 uppercase tracking-widest text-center drop-shadow-sm">
                            {isCharging ? "SUMMONING..." : <>SECRET<br />REVEAL</>}
                        </h3>
                        <div className="mt-8 px-6 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-200 text-sm font-bold opacity-80">
                            {isCharging ? "CHARGING POWER..." : "TAP TO OPEN"}
                        </div>
                    </div>
                </div>

                {/* CARD FRONT (Winner) */}
                <div
                    className="absolute inset-0 rounded-[30px] border-[6px] border-yellow-400 shadow-[0_0_100px_rgba(234,179,8,0.6)] bg-black z-20 overflow-hidden"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(2px)" }}
                >
                    {/* SSR/Legendary Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-500 via-yellow-900/50 to-black animate-pulse" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay" />

                    {/* Particles / Rays */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,223,0,0.4)_0%,transparent_70%)]" />

                    {/* WINNER CONTENT - FLY OUT ANIMATION */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center" style={{ transformStyle: "preserve-3d" }}>
                        <motion.div
                            initial={{ scale: 0.5, z: 0, opacity: 0 }}
                            animate={{ scale: isRevealed ? 1.1 : 0.5, z: isRevealed ? 120 : 0, opacity: isRevealed ? 1 : 0 }}
                            transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.2 }}
                            className="relative"
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            <div className="absolute inset-0 bg-yellow-400 blur-xl rounded-full opacity-50" />
                            {winner.image ? (
                                <img src={winner.image} alt={winner.name} className="w-52 h-52 rounded-full border-[6px] border-white shadow-2xl object-cover relative z-10" />
                            ) : (
                                <div className="w-52 h-52 rounded-full border-[6px] border-white bg-yellow-600 flex items-center justify-center text-6xl font-bold text-white relative z-10 shadow-2xl">
                                    {winner.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, z: 0 }}
                            animate={{ opacity: isRevealed ? 1 : 0, scale: isRevealed ? 1 : 0.8, z: isRevealed ? 80 : 0 }}
                            transition={{ delay: 0.4, type: "spring" }}
                            className="mt-10"
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            <Crown className="w-12 h-12 text-yellow-200 mx-auto mb-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" />
                            <h2 className="text-5xl font-black text-white leading-none mb-3 drop-shadow-[0_5px_5px_rgba(0,0,0,1)] tracking-tight">
                                {winner.name}
                            </h2>
                            <div className="px-5 py-2 bg-white text-black text-sm font-black uppercase rounded-full inline-block shadow-xl">
                                WINNER • {winner.voteCount} Votes
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// 4. Category Slide (The Main Stage)
const CategorySlide = ({ category, onNext }: { category: CategoryData, onNext: () => void }) => {
    const [winner, setWinner] = useState<Nominee | null>(null);
    const [isFocused, setIsFocused] = useState(false); // Focus mode for Card Ritual

    // Select Winner Logic
    useEffect(() => {
        const sorted = [...category.nominees].sort((a, b) => b.voteCount - a.voteCount);
        setWinner(sorted[0]);
    }, [category]);

    return (
        <div className="flex flex-col h-screen bg-black relative overflow-hidden font-sans">
            {/* Ambient Gold Dust (Persistent) */}
            <GoldDust />

            <div className="z-10 flex-1 flex flex-col p-10">
                {/* Header */}
                <div className={`mb-12 transition-all duration-1000 ${isFocused ? 'opacity-30 blur-sm scale-95' : 'opacity-100'}`}>
                    <h2 className="text-yellow-500 font-bold tracking-[0.5em] uppercase mb-4 text-center">Current Category</h2>
                    <h1 className="text-5xl md:text-7xl font-black text-white text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        {category.title}
                    </h1>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center relative">

                    {/* Nominees Grid (Dims during Ritual) */}
                    <motion.div
                        className="flex flex-wrap justify-center items-center gap-8 w-full max-w-7xl absolute inset-0 z-0 pointer-events-none"
                        animate={{
                            opacity: isFocused ? 0.1 : 1,
                            scale: isFocused ? 0.9 : 1,
                            filter: isFocused ? "blur(8px) grayscale(100%)" : "blur(0px) grayscale(0%)"
                        }}
                        transition={{ duration: 1 }}
                    >
                        {category.nominees.map((nominee, idx) => (
                            <motion.div
                                key={nominee.name}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{
                                    opacity: 1,
                                    y: [0, -10, 0],
                                }}
                                transition={{
                                    opacity: { delay: idx * 0.1 },
                                    y: { duration: 3 + idx, repeat: Infinity, ease: "easeInOut", delay: idx * 0.5 }
                                }}
                                className="group relative w-[200px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-900"
                            >
                                {nominee.image ? (
                                    <img src={nominee.image} alt={nominee.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-4xl font-bold text-neutral-600">
                                        {nominee.name.substring(0, 1)}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                <div className="absolute bottom-4 left-4">
                                    <p className="font-bold text-white text-lg leading-tight">{nominee.name}</p>
                                    <p className="text-yellow-500 text-xs font-mono mt-1">{nominee.voteCount} Votes</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* The Gacha Card (Center Stage) */}
                    {winner && (
                        <div className="z-20 scale-125 md:scale-150 transition-transform duration-1000">
                            <GachaCard
                                winner={winner}
                                onFocus={setIsFocused}
                                onReveal={() => {
                                    // Optional: Add post-reveal logic
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className={`flex justify-between items-end mt-10 transition-opacity duration-500 ${isFocused ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="text-neutral-500 text-sm font-mono">
                        PRESS SPACE TO CONTINUE
                    </div>
                    <button
                        onClick={onNext}
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-bold backdrop-blur-md transition-all flex items-center gap-2"
                    >
                        NEXT CATEGORY <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Page Controller ---
export default function LiveAwardsPage() {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(-1); // -1 = Intro, categories.length = Outro
    const [isLiveActive, setIsLiveActive] = useState(false);
    const router = useRouter();

    useEffect(() => {
        getAwardsData().then(data => {
            setCategories(data);
            setLoading(false);
        });

        // Listen for Admin 'Live' status
        const unsub = onSnapshot(doc(db, "settings", "config"), (doc) => {
            const data = doc.data();
            setIsLiveActive(data?.isLiveActive || false);
        });
        return () => unsub();
    }, []);

    // Keyboard Navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!isLiveActive && currentIndex === -1) return; // Prevent nav if waiting
            if (e.key === "ArrowRight" || e.key === " ") nextSlide();
            if (e.key === "ArrowLeft") prevSlide();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [categories, currentIndex, isLiveActive]);

    const nextSlide = () => {
        if (currentIndex < categories.length) { // Allow going to Outro (length)
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentIndex > -1) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    if (loading) return <div className="h-screen bg-black flex items-center justify-center text-yellow-500"><MonitorPlay className="animate-bounce" /></div>;

    // Show waiting room if Admin hasn't started stream AND we are at the beginning
    if (!isLiveActive && currentIndex === -1) {
        return <WaitingRoom />;
    }

    return (
        <div className="bg-black min-h-screen text-white overflow-hidden relative font-sans">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none z-50 mix-blend-overlay" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,50,1)_0%,rgba(0,0,0,1)_100%)] -z-10" />

            {/* Content Carousel */}
            <AnimatePresence mode="wait">
                {currentIndex === -1 ? (
                    <motion.div key="intro" exit={{ opacity: 0, y: -100 }} className="absolute inset-0">
                        <IntroSlide onStart={() => setCurrentIndex(0)} />
                    </motion.div>
                ) : currentIndex < categories.length ? (
                    <motion.div
                        key={categories[currentIndex].title}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-0"
                    >
                        <CategorySlide
                            category={categories[currentIndex]}
                            onNext={nextSlide}
                        />
                    </motion.div>
                ) : (
                    <motion.div key="outro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                        <OutroSlide />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Controls (Only if Live) */}
            {isLiveActive && (
                <>
                    <div className="fixed bottom-8 left-8 z-50">
                        <button
                            onClick={prevSlide}
                            className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all border border-white/5 hover:border-white/20 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none"
                            disabled={currentIndex === -1}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="fixed bottom-8 right-8 z-50">
                        <button
                            onClick={nextSlide}
                            className="p-4 bg-yellow-500/20 hover:bg-yellow-500/40 backdrop-blur-md rounded-full text-yellow-500 hover:text-yellow-200 transition-all border border-yellow-500/20 hover:border-yellow-500/50 hover:scale-110 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-0 disabled:pointer-events-none"
                            disabled={currentIndex === categories.length}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </>
            )}

            <div className="fixed top-6 left-6 z-50">
                <Link href="/awards" className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white/30 hover:text-white transition-colors border border-white/5 hover:border-white/20">
                    <ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest font-bold">Exit</span>
                </Link>
            </div>
        </div>
    );
}

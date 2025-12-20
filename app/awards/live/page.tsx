"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
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

// --- Types ---
type RitualPhase = 'IDLE' | 'GATHERING' | 'ABSORBING' | 'REVEALED';

// 3. Thick 3D Gacha Card (Vortex Compatible)
const GachaCard = ({ winner, phase, onReveal }: { winner: Nominee, phase: RitualPhase, onReveal?: () => void }) => {
    const isRevealed = phase === 'REVEALED';
    const isCharging = phase === 'GATHERING' || phase === 'ABSORBING';

    // Internal Flash State
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        if (isRevealed) {
            setShowFlash(true);
            const audio = new Audio("https://www.myinstants.com/media/sounds/tada-fanfare-a.mp3");
            audio.volume = 0.8;
            audio.play().catch(e => console.warn("Audio play failed"));
            setTimeout(() => setShowFlash(false), 800);
            onReveal?.();
        }
    }, [isRevealed, onReveal]);

    return (
        <div className="flex flex-col items-center justify-center py-10 relative z-20 perspective-1000">
            {/* Cinematic Spotlight */}
            <motion.div
                animate={{ opacity: isCharging || isRevealed ? 1 : 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(circle_choke,rgba(234,179,8,0.15)_0%,transparent_70%)] pointer-events-none transition-opacity duration-1000"
            />

            {/* Energy Vortex Rings (Charging) */}
            {isCharging && (
                <>
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-yellow-500/30 rounded-full"
                        style={{ width: 400, height: 400 }}
                        animate={{ scale: [1, 0.1], opacity: [0, 1, 0], rotate: 180 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeIn" }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-yellow-200/50 rounded-full"
                        style={{ width: 600, height: 600 }}
                        animate={{ scale: [1, 0.1], opacity: [0, 0.5, 0], rotate: -180 }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5, ease: "easeIn" }}
                    />
                </>
            )}

            {/* Glow Effect */}
            <motion.div
                animate={{
                    scale: isCharging ? [1, 1.5, 1] : (isRevealed ? 1.2 : 1),
                    opacity: isCharging ? 0.8 : (isRevealed ? 0.8 : 0)
                }}
                transition={{ duration: isCharging ? 0.5 : 1, repeat: isCharging ? Infinity : 0 }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/20 blur-[100px] rounded-full transition-opacity duration-1000`}
            />

            <motion.div
                className="relative w-[340px] h-[520px] cursor-pointer group"
                initial={{ y: 0, scale: 0 }}
                animate={{
                    scale: phase === 'IDLE' ? 0 : 1,
                    rotateY: isRevealed ? 180 : 0,
                    y: isRevealed ? [0, -40, 0] : (isCharging ? [0, -5, 0] : 0),
                    x: isCharging ? [-2, 2, -2, 2, 0] : 0, // Vibration
                }}
                transition={{
                    scale: { type: "spring", stiffness: 100, damping: 20 },
                    rotateY: { duration: 0.8, ease: "easeInOut" },
                    y: { duration: isCharging ? 0.1 : 4, repeat: Infinity, ease: isCharging ? "linear" : "easeInOut" },
                    x: { duration: 0.05, repeat: Infinity },
                }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* --- 3D THICKNESS SIDES (Hiding on Reveal) --- */}
                <motion.div animate={{ opacity: isRevealed ? 0 : 1 }} transition={{ duration: 0.1 }}>
                    <div className="absolute top-[60px] right-0 w-[12px] h-[calc(100%-120px)] bg-yellow-800 origin-right transform rotateY(-90deg) translateZ(1px)" />
                    <div className="absolute top-[60px] left-0 w-[12px] h-[calc(100%-120px)] bg-yellow-600 origin-left transform rotateY(90deg) translateZ(1px)" />
                    <div className="absolute top-0 left-[60px] w-[calc(100%-120px)] h-[12px] bg-yellow-700 origin-top transform rotateX(-90deg) translateZ(1px)" />
                    <div className="absolute bottom-0 left-[60px] w-[calc(100%-120px)] h-[12px] bg-yellow-900 origin-bottom transform rotateX(90deg) translateZ(1px)" />
                </motion.div>

                {/* White Flash */}
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

                {/* CARD BACK */}
                <div className="absolute inset-0 rounded-[30px] border-4 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)] bg-black z-20 overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "translateZ(2px)" }}>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-yellow-900/40" />

                    {isCharging && <div className="absolute inset-0 bg-yellow-500/20 mix-blend-overlay animate-pulse" />}

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="relative mb-6">
                            <div className={`absolute inset-0 bg-yellow-500/20 blur-xl rounded-full ${isCharging ? 'animate-ping' : 'animate-pulse'}`} />
                            <Sparkles className={`w-24 h-24 text-yellow-400 relative z-10 ${isCharging ? 'animate-spin' : ''} transition-all duration-[2s]`} />
                        </div>
                        <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 uppercase tracking-widest text-center drop-shadow-sm">
                            {isCharging ? "SUMMONING" : "SECRET"}
                        </h3>
                    </div>
                </div>

                {/* CARD FRONT */}
                <div className="absolute inset-0 rounded-[30px] border-[6px] border-yellow-400 shadow-[0_0_100px_rgba(234,179,8,0.6)] bg-black z-20 overflow-hidden" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(2px)" }}>
                    {/* ... (Existing Inner Content Refined) ... */}
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-500 via-yellow-900/50 to-black animate-pulse" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,223,0,0.4)_0%,transparent_70%)]" />

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

// 4. Category Slide (Vortex Ritual)
const CategorySlide = ({ category, onNext }: { category: CategoryData, onNext: () => void }) => {
    const [winner, setWinner] = useState<Nominee | null>(null);
    const [phase, setPhase] = useState<RitualPhase>('IDLE');

    useEffect(() => {
        const sorted = [...category.nominees].sort((a, b) => b.voteCount - a.voteCount);
        setWinner(sorted[0]);
    }, [category]);

    const startRitual = () => {
        if (phase !== 'IDLE') return;
        setPhase('GATHERING'); // Nominees fly to orbit

        // Sequence
        setTimeout(() => setPhase('ABSORBING'), 2500); // 2.5s of orbiting/charging
        setTimeout(() => setPhase('REVEALED'), 3000);  // 0.5s Suck in -> Reveal
    };

    return (
        <div className="flex flex-col h-screen bg-black relative overflow-hidden font-sans">
            <GoldDust />

            <div className="z-10 flex-1 flex flex-col p-10">
                {/* Header (Fades out during ritual to focus attention) */}
                <div className={`mb-12 transition-all duration-1000 ${phase !== 'IDLE' ? 'opacity-0 scale-90' : 'opacity-100'}`}>
                    <h2 className="text-yellow-500 font-bold tracking-[0.5em] uppercase mb-4 text-center">Current Category</h2>
                    <h1 className="text-5xl md:text-7xl font-black text-white text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        {category.title}
                    </h1>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center relative perspective-distant">

                    {/* --- NOMINEES: Grid vs Vortex --- */}
                    {/* We use LayoutGroup to magically morph them */}
                    <LayoutGroup>
                        {phase === 'IDLE' ? (
                            // GRID LAYOUT
                            <motion.div className="flex flex-wrap justify-center items-center gap-8 w-full max-w-7xl relative z-10">
                                {category.nominees.map((nominee) => (
                                    <motion.div
                                        layoutId={`nominee-${nominee.name}`}
                                        key={nominee.name}
                                        className="group relative w-[200px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-neutral-900"
                                        whileHover={{ scale: 1.05, y: -10 }}
                                    >
                                        {nominee.image ? (
                                            <img src={nominee.image} alt={nominee.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
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
                        ) : (
                            // VORTEX / ORBIT LAYOUT
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.div
                                    className="relative w-[800px] h-[800px]"
                                    animate={phase === 'GATHERING' || phase === 'ABSORBING' ? { rotate: 360 } : { rotate: 0 }}
                                    transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                                >
                                    {category.nominees.map((nominee, idx) => {
                                        const angle = (idx / category.nominees.length) * 2 * Math.PI;
                                        const radius = 350; // Orbit Radius
                                        const x = Math.cos(angle) * radius;
                                        const y = Math.sin(angle) * radius;

                                        return (
                                            <motion.div
                                                layoutId={`nominee-${nominee.name}`}
                                                key={nominee.name}
                                                className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full border-2 border-yellow-500 overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.5)] bg-black"
                                                initial={{ x: 0, y: 0 }} // Start center? No, layoutId handles start pos
                                                animate={
                                                    phase === 'ABSORBING' || phase === 'REVEALED'
                                                        ? { x: 0, y: 0, scale: 0, opacity: 0 } // Suck into center
                                                        : { x, y, scale: 1, opacity: 1, rotate: -360 } // Orbit (Counter-rotate to stay upright?)
                                                    // Actually, rotating the container rotates the items. 
                                                    // To keep heads upright, we might need to counter-rotate.
                                                    // For Vortex, spinning heads is fine/chaotic good.
                                                }
                                                transition={{
                                                    duration: phase === 'ABSORBING' ? 0.5 : 0.8,
                                                    ease: phase === 'ABSORBING' ? "backIn" : "easeInOut"
                                                }}
                                            >
                                                {nominee.image ? (
                                                    <img src={nominee.image} alt={nominee.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xl font-bold text-neutral-600">
                                                        {nominee.name.substring(0, 1)}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            </div>
                        )}
                    </LayoutGroup>

                    {/* --- CENTER STAGE: The Card --- */}
                    {winner && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 scale-125">
                            <GachaCard winner={winner} phase={phase} />
                        </div>
                    )}
                </div>

                {/* Footer / Controls */}
                <div className="flex justify-between items-end mt-10 z-30">
                    {phase === 'IDLE' && (
                        <button
                            onClick={startRitual}
                            className="mx-auto px-12 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl tracking-widest rounded-full shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_60px_rgba(234,179,8,0.6)] hover:scale-105 transition-all animate-pulse"
                        >
                            START RITUAL
                        </button>
                    )}

                    {phase === 'REVEALED' && (
                        <button
                            onClick={onNext}
                            className="ml-auto px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-bold backdrop-blur-md transition-all flex items-center gap-2"
                        >
                            NEXT CATEGORY <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
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

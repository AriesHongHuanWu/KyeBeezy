"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ChevronRight, ChevronLeft, Star, Crown, Sparkles, MonitorPlay, ArrowLeft, Lock, Trophy, RotateCcw } from "lucide-react";
import { getAwardsData } from "../../data-fetcher";
import { Confetti } from "@/components/ui/confetti";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

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

            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-700 drop-shadow-[0_0_50px_rgba(234,179,8,0.4)] mb-4 tracking-tighter mx-4">
                Bandlab Award
            </h1>
            <p className="text-sm md:text-xl lg:text-2xl text-white/50 font-light tracking-[0.4em] md:tracking-[0.6em] uppercase mb-16">
                2025 Ceremony
            </p>

            <button
                onClick={onStart}
                className="group px-8 py-4 md:px-10 md:py-5 bg-white text-black hover:bg-yellow-400 font-black tracking-widest uppercase transition-all rounded-full flex items-center gap-3 mx-auto shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)] hover:scale-105 active:scale-95"
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
            router.push("/events/bandlab2025");
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
    const isAbsorbing = phase === 'ABSORBING'; // Hyper-tension phase

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

            {/* Shockwave Ring (On Reveal) */}
            {isRevealed && (
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-200 z-0"
                    initial={{ width: 300, height: 300, opacity: 0.8, borderWidth: 10 }}
                    animate={{ width: 2000, height: 2000, opacity: 0, borderWidth: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            )}

            {/* Energy Vortex Rings (Charging - Speed Up on Absorb) */}
            {isCharging && (
                <>
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-yellow-500/30 rounded-full"
                        style={{ width: 400, height: 400 }}
                        animate={{
                            scale: isAbsorbing ? [1, 0.05] : [1, 0.8], // Suck in or Breathe
                            opacity: isAbsorbing ? [1, 0] : [0, 1, 0],
                            rotate: isAbsorbing ? 720 : 180
                        }}
                        transition={{ duration: isAbsorbing ? 0.5 : 1, repeat: isAbsorbing ? 0 : Infinity, ease: isAbsorbing ? "backIn" : "easeIn" }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-yellow-200/50 rounded-full"
                        style={{ width: 600, height: 600 }}
                        animate={{
                            scale: isAbsorbing ? [1, 0.05] : [1, 0.8],
                            opacity: isAbsorbing ? [0.5, 0] : [0, 0.5, 0],
                            rotate: isAbsorbing ? -720 : -180
                        }}
                        transition={{ duration: isAbsorbing ? 0.5 : 1.5, repeat: isAbsorbing ? 0 : Infinity, delay: isAbsorbing ? 0 : 0.5, ease: isAbsorbing ? "backIn" : "easeIn" }}
                    />
                </>
            )}

            {/* Glow Effect (Breathing -> Hyper-Ventilating) */}
            <motion.div
                animate={{
                    scale: isAbsorbing ? [1.5, 0.5] : (isCharging ? [1, 1.5, 1] : (isRevealed ? 1.2 : [1, 1.2, 1])),
                    opacity: isAbsorbing ? [1, 0] : (isCharging ? 0.8 : (isRevealed ? 0.8 : [0.3, 0.5, 0.3]))
                }}
                transition={{
                    duration: isAbsorbing ? 0.1 : (isCharging ? 0.5 : 4), // Fast drop if absorbing
                    repeat: isAbsorbing ? 0 : Infinity,
                    ease: "easeInOut"
                }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/20 blur-[100px] rounded-full transition-opacity duration-1000`}
            />

            <motion.div
                className="relative w-[300px] h-[460px] md:w-[340px] md:h-[520px] cursor-pointer group"
                initial={{ y: 0, scale: 0 }}
                animate={{
                    scale: phase === 'IDLE' ? 0 : 1,
                    rotateY: isRevealed ? 180 : 0,
                    // Y: Float logic. Gathering = Smooth Float. Absorbing = Static/Tense. Revealed = Bounce.
                    y: isRevealed ? [0, -40, 0] : (phase === 'GATHERING' ? [0, -20, 0] : 0),
                    // X: Shake logic. Absorbing = Violent. Gathering = Shake once (1s) then settle.
                    x: phase === 'ABSORBING' ? [-5, 5, -5, 5] : (phase === 'GATHERING' ? [-2, 2, -2, 2, -1, 1, 0] : 0),
                }}
                transition={{
                    scale: { type: "spring", stiffness: 100, damping: 20 },
                    rotateY: { duration: 0.8, ease: "easeInOut" },
                    y: {
                        duration: phase === 'GATHERING' ? 3 : 4, // Smooth float during gathering
                        repeat: Infinity,
                        ease: "easeInOut"
                    },
                    x: {
                        duration: phase === 'ABSORBING' ? 0.1 : 1, // Fast shake or 1s settle shake
                        repeat: phase === 'ABSORBING' ? Infinity : 0, // Infinite violent shake vs One-time settle
                        ease: "linear"
                    }
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
                            <img
                                src="/bandlab-logo.png"
                                alt="Bandlab"
                                className="w-12 h-12 mx-auto mb-2 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                                style={{ filter: "brightness(0) saturate(100%) invert(83%) sepia(36%) saturate(1000%) hue-rotate(2deg) brightness(108%) contrast(105%)" }}
                            />
                            <h2 className="text-5xl font-black text-white leading-none mb-3 drop-shadow-[0_5px_5px_rgba(0,0,0,1)] tracking-tight">
                                {winner.name}
                            </h2>
                            <div className="px-5 py-2 bg-white text-black text-sm font-black uppercase rounded-full inline-block shadow-xl">
                                WINNER
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// 4. Category Slide (Vortex Ritual) - Controlled by Props
const CategorySlide = ({
    category,
    phase,
    isAdmin,
    onStartRitual,
    onNext
}: {
    category: CategoryData,
    phase: RitualPhase,
    isAdmin: boolean,
    onStartRitual: () => void,
    onNext: () => void
}) => {
    const [winner, setWinner] = useState<Nominee | null>(null);

    useEffect(() => {
        const sorted = [...category.nominees].sort((a, b) => b.voteCount - a.voteCount);
        setWinner(sorted[0]);
    }, [category]);

    return (
        <div className="flex flex-col h-screen bg-black relative overflow-hidden font-sans">
            <GoldDust />

            <div className="z-10 flex-1 flex flex-col p-10 mt-10">
                {/* Header (Staggered Entrance) */}
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: (phase !== 'IDLE' ? 0 : 1), y: (phase !== 'IDLE' ? -50 : 0) }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`mb-12 md:mb-24 transition-all duration-1000 ${phase !== 'IDLE' ? 'scale-90' : ''}`}
                >
                    <h2 className="text-yellow-500 font-bold tracking-[0.3em] md:tracking-[0.5em] uppercase mb-4 md:mb-6 text-center text-sm md:text-base">Current Category</h2>
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] tracking-tighter px-2">
                        {category.title}
                    </h1>
                </motion.div>

                <div className="flex-1 flex flex-col items-center justify-center relative perspective-distant">

                    {/* --- NOMINEES: Grid vs Vortex --- */}
                    <LayoutGroup>
                        {phase === 'IDLE' ? (
                            // GRID LAYOUT
                            <motion.div
                                className="flex flex-wrap justify-center items-start gap-10 w-full max-w-[90vw] relative z-10 px-4"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                            >
                                {category.nominees.map((nominee, idx) => (
                                    <div key={nominee.name} className="flex flex-col items-center gap-4 md:gap-6 group cursor-pointer relative z-20">
                                        <motion.div
                                            layoutId={`nominee-${nominee.name}`}
                                            className="relative w-24 h-24 md:w-36 md:h-36 lg:w-48 lg:h-48 rounded-full border-2 border-white/20 group-hover:border-yellow-500 overflow-hidden shadow-2xl bg-black transition-colors duration-300"
                                            whileHover={{ scale: 1.2, boxShadow: "0 0 40px rgba(234,179,8,0.6)" }}
                                            animate={{ y: [0, -15, 0] }}
                                            transition={{
                                                y: { duration: 3 + ((idx % 3) * 0.5), repeat: Infinity, ease: "easeInOut", delay: idx * 0.2 },
                                                layout: { duration: 0.8 }
                                            }}
                                        >
                                            {nominee.image ? (
                                                <img src={nominee.image} alt={nominee.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-4xl font-bold text-neutral-600">
                                                    {nominee.name.substring(0, 1)}
                                                </div>
                                            )}
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 + (idx * 0.1) }}
                                            className="text-center"
                                        >
                                            <p className="font-bold text-white text-xl md:text-2xl group-hover:text-yellow-400 transition-colors drop-shadow-md">{nominee.name}</p>
                                        </motion.div>
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            // VORTEX / ORBIT LAYOUT
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-[0.4] md:scale-100 transition-transform duration-700">
                                <motion.div
                                    className="relative w-[800px] h-[800px]"
                                    animate={phase === 'GATHERING' || phase === 'ABSORBING' ? { rotate: 360 } : { rotate: 0 }}
                                    transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                                >
                                    {category.nominees.map((nominee, idx) => {
                                        const angle = (idx / category.nominees.length) * 2 * Math.PI;
                                        const radius = 350;
                                        const x = Math.cos(angle) * radius;
                                        const y = Math.sin(angle) * radius;

                                        return (
                                            <motion.div
                                                layoutId={`nominee-${nominee.name}`}
                                                key={nominee.name}
                                                className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full border-2 border-yellow-500 overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.5)] bg-black"
                                                initial={{ x: 0, y: 0 }}
                                                animate={
                                                    phase === 'ABSORBING' || phase === 'REVEALED'
                                                        ? { x: 0, y: 0, scale: 0, opacity: 0 }
                                                        : { x, y, scale: 1, opacity: 1, rotate: -360 }
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
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 scale-125 ${phase === 'IDLE' ? 'pointer-events-none' : ''}`}>
                            <GachaCard winner={winner} phase={phase} />
                        </div>
                    )}
                </div>

                {/* Footer / Controls (ADMIN ONLY) */}
                {isAdmin && (
                    <motion.div
                        className="flex justify-between items-end mt-10 z-30"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                    >
                        {phase === 'IDLE' && (
                            <button
                                onClick={onStartRitual}
                                className="mx-auto px-8 py-3 md:px-12 md:py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg md:text-xl tracking-widest rounded-full shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_60px_rgba(234,179,8,0.6)] hover:scale-105 transition-all active:scale-95"
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
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// --- Page Controller ---
// --- Page Controller ---

export default function LiveAwardsPage() {
    const { user, loading: authLoading } = useAuth();
    const isAdmin = !!user; // Assume any logged-in user is Admin for this context

    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);

    // Synced State
    const [cloudIndex, setCloudIndex] = useState(-1);
    const [ritualPhase, setRitualPhase] = useState<RitualPhase>('IDLE');

    // Local State (what the user actually sees)
    const [localIndex, setLocalIndex] = useState(-1);
    const [isFreeRoam, setIsFreeRoam] = useState(false);
    const [isLiveActive, setIsLiveActive] = useState(false);

    useEffect(() => {
        const load = async () => {
            const data = await getAwardsData();
            setCategories(data);
            setLoading(false);
        };
        load();

        // 1. Listen for Config (Live Active & Free Roam)
        const unsubConfig = onSnapshot(doc(db, "settings", "config"), (doc) => {
            const data = doc.data();
            if (data) {
                setIsLiveActive(data.isLiveActive || false);
                setIsFreeRoam(data.isFreeRoam || false);
            }
        });

        // 2. Listen for Shared Live State
        const unsubState = onSnapshot(doc(db, "settings", "liveState"), (doc) => {
            const data = doc.data();
            if (data) {
                if (data.currentIndex !== undefined) setCloudIndex(data.currentIndex);
                if (data.ritualPhase) setRitualPhase(data.ritualPhase as RitualPhase);
            }
        });

        return () => { unsubConfig(); unsubState(); };
    }, []);

    // Sync Local to Cloud UNLESS Free Roam is on for non-admins
    useEffect(() => {
        if (!isFreeRoam || isAdmin) {
            setLocalIndex(cloudIndex);
        }
        // If Free Roam is ON and NOT Admin, we don't force update localIndex, allowing them to browse.
        // However, if Free Roam just turned ON, we might want to let them start from current? existing logic is fine.
    }, [cloudIndex, isFreeRoam, isAdmin]);


    // --- Actions ---
    const handleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast.success("Admin Access Granted");
        } catch (error) {
            toast.error("Login Failed");
        }
    };

    const updateCloudState = async (updates: any) => {
        if (!isAdmin) return;
        await setDoc(doc(db, "settings", "liveState"), updates, { merge: true });
    };

    const toggleFreeRoam = async () => {
        if (!isAdmin) return;
        await setDoc(doc(db, "settings", "config"), { isFreeRoam: !isFreeRoam }, { merge: true });
        toast.info(isFreeRoam ? "Free Roam DISABLED" : "Free Roam ENABLED");
    };

    const handleReset = async () => {
        if (!isAdmin) return;
        if (confirm("Reset show to start?")) {
            await updateCloudState({ currentIndex: -1, ritualPhase: 'IDLE' });
        }
    };

    const handleStartRitual = async () => {
        if (!isAdmin) return; // Only Admin starts ritual
        if (isFreeRoam) return; // Disable ritual triggering in free roam mode to prevent confusion? Or allow it? Let's allow it but warn.

        // 1. GATHERING
        await updateCloudState({ ritualPhase: 'GATHERING' });

        // 2. ABSORBING (Auto-sequence)
        setTimeout(() => updateCloudState({ ritualPhase: 'ABSORBING' }), 2500);

        // 3. REVEAL (Auto-sequence)
        setTimeout(() => updateCloudState({ ritualPhase: 'REVEALED' }), 5500); // 3s absorb
    };

    const nextSlide = () => {
        if (isAdmin && !isFreeRoam) {
            // Admin syncing everyone
            if (localIndex < categories.length) {
                updateCloudState({ currentIndex: localIndex + 1, ritualPhase: 'IDLE' });
            }
        } else if (isFreeRoam || isAdmin) {
            // Local navigation (Free Roam OR Admin previewing)
            if (localIndex < categories.length) {
                setLocalIndex(prev => prev + 1);
            }
        }
    };

    const prevSlide = () => {
        if (isAdmin && !isFreeRoam) {
            if (localIndex > -1) {
                updateCloudState({ currentIndex: localIndex - 1, ritualPhase: 'IDLE' });
            }
        } else if (isFreeRoam || isAdmin) {
            if (localIndex > -1) {
                setLocalIndex(prev => prev - 1);
            }
        }
    };

    // Keyboard controls
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (isAdmin || isFreeRoam) {
                if (e.key === "ArrowRight") nextSlide();
                if (e.key === "ArrowLeft") prevSlide();
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isAdmin, isFreeRoam, localIndex, categories.length]);


    if (loading) return <div className="h-screen bg-black flex items-center justify-center text-yellow-500"><MonitorPlay className="animate-bounce" /></div>;

    // Waiting Room logic:
    // If Admin: Never wait.
    // If Viewer: Wait if NOT Admin AND (NOT Live Active AND NOT Free Roam).
    // If Free Roam is on, viewers can enter even if "Live Active" is false, hypothetically?
    // Let's say Free Roam overrides Waiting Room.
    const showWaitingRoom = !isAdmin && !isLiveActive && !isFreeRoam;

    // Shake Effect for Absorb Phase
    const isShaking = ritualPhase === 'ABSORBING' && (!isFreeRoam || isAdmin); // Only shake if following the ritual

    return (
        <div className="bg-black min-h-screen text-white overflow-hidden relative font-sans">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none z-50 mix-blend-overlay" />

            {/* Dynamic Background */}
            <motion.div
                className="absolute inset-0 z-[-10]"
                animate={{
                    background: ritualPhase === 'ABSORBING'
                        ? "radial-gradient(circle at center, rgba(100,50,0,1) 0%, rgba(0,0,0,1) 100%)"
                        : "radial-gradient(circle at center, rgba(50,50,50,1) 0%, rgba(0,0,0,1) 100%)"
                }}
                transition={{ duration: 1 }}
            />

            {/* --- TOP RIGHT LOGIN / ADMIN UI --- */}
            <div className="fixed top-6 right-6 z-[60] flex items-center gap-3">
                {/* Free Roam Toggle for Admin */}
                {isAdmin && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleReset}
                            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white border border-white/10 transition-colors"
                            title="Reset Show"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={toggleFreeRoam}
                            className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border transition-all ${isFreeRoam ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-white/10 border-white/20 text-white/50 hover:bg-white/20'}`}
                        >
                            {isFreeRoam ? "Free Roam" : "Sync Mode"}
                        </button>
                    </div>
                )}

                {authLoading ? (
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : user ? (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/50 pr-4 pl-2 py-1.5 rounded-full backdrop-blur-md animate-in fade-in slide-in-from-top-4">
                        <img src={user.photoURL || ""} alt="Admin" className="w-6 h-6 rounded-full border border-red-500" />
                        <span className="text-xs font-bold text-red-500 uppercase tracking-widest hidden md:inline">Admin</span>
                        <button onClick={() => signOut(auth)} className="ml-2 hover:bg-red-500/20 p-1 rounded-full text-red-500/50 hover:text-red-500 transition-colors">
                            <Lock className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleLogin}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-full hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
                    >
                        <Lock className="w-3 h-3" /> Admin Login
                    </button>
                )}
            </div>

            <div className="fixed top-6 left-6 z-50">
                <Link href="/events/bandlab2025" className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white/30 hover:text-white transition-colors border border-white/5 hover:border-white/20">
                    <ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest font-bold">Exit</span>
                </Link>
            </div>

            {showWaitingRoom ? (
                <WaitingRoom />
            ) : (
                <>
                    {/* Screen Shake Wrapper */}
                    <motion.div
                        className="absolute inset-0"
                        animate={isShaking ? { x: [-5, 5, -5, 5, 0], y: [-5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.2, repeat: isShaking ? Infinity : 0 }}
                    >
                        <AnimatePresence mode="wait">
                            {localIndex === -1 ? (
                                <motion.div key="intro" exit={{ opacity: 0, y: -100 }} className="absolute inset-0">
                                    {/* Intro Slide Start Button -> Admin Only */}
                                    <IntroSlide onStart={() => isAdmin && updateCloudState({ currentIndex: 0 })} />
                                    {/* Mask button if not admin? IntroSlide has button. Viewers shouldn't click it. */}
                                    {!isAdmin && !isFreeRoam && <div className="absolute inset-0 z-40 cursor-default" />}
                                </motion.div>
                            ) : localIndex < categories.length ? (
                                <motion.div
                                    key={categories[localIndex].title}
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    className="absolute inset-0"
                                >
                                    <CategorySlide
                                        category={categories[localIndex]}
                                        // If Free Roam, force IDLE phase so cards usually show immediately or simpler? 
                                        // Or keep existing state? If free roam, we probably want them to just see the result or default state.
                                        // Let's force 'REVEALED' or 'IDLE' in Free Roam? 
                                        // Ideally in Free Roam they can just browse. Let's pass 'REVEALED' if Free Roam so they see the winner immediately?
                                        // User asked to "flip freely". usually implies seeing the list. 
                                        // Let's pass 'IDLE' default, but maybe allow clicking?
                                        // For now, if Free Roam, we preserve 'IDLE' locally (since phase sync is off), 
                                        // BUT we might want to auto-reveal?
                                        // Let's keep it simple: Free Roam = IDLE phase usually, but they can click next.
                                        // If they want to see winner, they currently need "Reveal" ritual.
                                        // Let's auto-reveal in Free Roam? 
                                        // Actually, let's just pass 'IDLE' and allow them to click cards? Assuming cards are clickable?
                                        // Cards are NOT clickable in current code (only ritual reveals them).
                                        // MODIFICATION: If isFreeRoam, assume 'REVEALED' state? Or add a "Reveal" button for them?
                                        // Let's pass 'REVEALED' if isFreeRoam is true, so they can see everything.
                                        phase={isFreeRoam ? 'REVEALED' : ritualPhase}
                                        isAdmin={isAdmin}
                                        onStartRitual={handleStartRitual}
                                        onNext={nextSlide}
                                    />
                                    {/* Trigger Confetti on Reveal if NOT free roam (live moment) */}
                                    <Confetti isActive={ritualPhase === 'REVEALED' && !isFreeRoam} />
                                </motion.div>
                            ) : (
                                <motion.div key="outro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0">
                                    <OutroSlide />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Navigation Controls (Admin OR Free Roam) */}
                    {(isAdmin || isFreeRoam) && (
                        <>
                            <div className="fixed bottom-8 left-8 z-50">
                                <button
                                    onClick={prevSlide}
                                    className={`p-4 backdrop-blur-md rounded-full transition-all border hover:scale-110 ${isFreeRoam ? 'bg-green-500/20 text-green-500 border-green-500/50' : 'bg-white/10 text-white/50 border-white/5 hover:bg-white/20 hover:text-white'}`}
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="fixed bottom-8 right-8 z-50">
                                <button
                                    onClick={nextSlide}
                                    className={`p-4 backdrop-blur-md rounded-full transition-all border hover:scale-110 ${!isFreeRoam ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-green-500/20 text-green-500 border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]'}`}
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

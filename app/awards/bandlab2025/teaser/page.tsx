"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Zap, Trophy, Play } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- Visual Components ---

const TornadoCard = ({ delay, x, y, z, rotateX, rotateY }: any) => (
    <motion.div
        className="absolute top-1/2 left-1/2 w-32 h-48 md:w-48 md:h-72 bg-black rounded-xl border-2 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
        style={{
            transformStyle: "preserve-3d",
        }}
        initial={{
            x: 0, y: 0, z: -1000, opacity: 0, scale: 0
        }}
        animate={{
            x: [x, -x, x], // Orbit behavior simplified
            y: [y, -y, y],
            z: [z, z + 500, z],
            rotateX: [rotateX, rotateX + 360],
            rotateY: [rotateY, rotateY + 360],
            opacity: 1,
            scale: 1
        }}
        transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: delay,
            ease: "linear"
        }}
    >
        {/* Back Design */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-yellow-900/40 rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-yellow-500/50" />
            </div>
        </div>
    </motion.div>
);

const HeroCard = () => (
    <div className="relative w-[300px] h-[460px] md:w-[360px] md:h-[540px] perspective-1000">
        <motion.div
            className="w-full h-full relative"
            style={{ transformStyle: "preserve-3d" }}
            initial={{ rotateY: 180, scale: 0.5, opacity: 0 }}
            animate={{ rotateY: 0, scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            {/* Front */}
            <div className="absolute inset-0 bg-black rounded-[30px] border-[6px] border-yellow-400 shadow-[0_0_100px_rgba(234,179,8,1)] overflow-hidden flex flex-col items-center justify-center text-center p-6" style={{ backfaceVisibility: "hidden" }}>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 via-transparent to-black" />

                {/* Content */}
                <div className="relative z-10 animate-in fade-in zoom-in duration-1000 delay-300">
                    <div className="w-48 h-48 mx-auto mb-6 rounded-full border-4 border-yellow-300 shadow-2xl overflow-hidden bg-neutral-900 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-yellow-500/20 animate-pulse" />
                        <img
                            src="/bandlab-logo.png"
                            alt="Bandlab"
                            className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                            style={{ filter: "brightness(0) saturate(100%) invert(83%) sepia(36%) saturate(1000%) hue-rotate(2deg) brightness(108%) contrast(105%)" }}
                        />
                    </div>
                    <img
                        src="/bandlab-logo.png"
                        alt="Bandlab"
                        className="w-12 h-12 mx-auto mb-2 object-contain opacity-80"
                        style={{ filter: "brightness(0) saturate(100%) invert(83%) sepia(36%) saturate(1000%) hue-rotate(2deg) brightness(108%) contrast(105%)" }}
                    />
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2 drop-shadow-lg">
                        BANDLAB<br />AWARDS
                    </h2>
                    <div className="inline-block px-6 py-2 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-full shadow-lg animate-pulse">
                        2025
                    </div>
                </div>
            </div>
        </motion.div>
    </div>
);

// --- Main Page ---

export default function TeaserPage() {
    const router = useRouter();
    const [stage, setStage] = useState(0);

    // Sequence Timing
    useEffect(() => {
        const schedule = [
            { time: 3000, stage: 1 }, // Intro -> Text
            { time: 6500, stage: 2 }, // Text -> Tornado
            { time: 10500, stage: 3 }, // Tornado -> Suck
            { time: 11000, stage: 4 }, // Suck -> Explode/Reveal
            { time: 15000, stage: 5 }  // Reveal -> CTA
        ];

        let timeouts: NodeJS.Timeout[] = [];
        schedule.forEach(({ time, stage: s }) => {
            const t = setTimeout(() => setStage(s), time);
            timeouts.push(t);
        });

        return () => timeouts.forEach(clearTimeout);
    }, []);

    // Restart
    const handleReplay = () => {
        setStage(-1);
        setTimeout(() => setStage(0), 100);

        // Reset Logic reuse
        const schedule = [
            { time: 3000, stage: 1 },
            { time: 6500, stage: 2 },
            { time: 10500, stage: 3 },
            { time: 11000, stage: 4 },
            { time: 15000, stage: 5 }
        ];
        schedule.forEach(({ time, stage: s }) => {
            setTimeout(() => setStage(s), time);
        });
    };

    return (
        <div className="bg-black h-screen w-screen overflow-hidden relative font-sans perspective-distant">
            {/* BACKGROUND */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none z-50 mix-blend-overlay" />
            <motion.div
                className="absolute inset-0 z-0 bg-radial-gradient"
                animate={{
                    background: stage === 4
                        ? "radial-gradient(circle at center, #422006 0%, #000000 100%)" // Gold/Brown during reveal
                        : "radial-gradient(circle at center, #111111 0%, #000000 100%)"
                }}
            />

            {/* STAGE 0: BRAND INTRO (0-3s) */}
            <AnimatePresence>
                {stage === 0 && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center z-10"
                        exit={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                            className="text-4xl md:text-7xl font-black text-white tracking-tighter mr-4"
                        >
                            KYEBEEZY
                        </motion.div>
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.5, type: "spring" }}
                            className="text-yellow-500 text-6xl md:text-9xl font-black mx-4"
                        >
                            X
                        </motion.div>
                        <motion.div
                            initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                            className="text-4xl md:text-7xl font-black text-white tracking-tighter ml-4 flex items-center gap-4"
                        >
                            <img src="/bandlab-logo.png" className="h-16 w-16 md:h-24 md:w-24 object-contain invert" style={{ filter: "brightness(0) invert(1)" }} />
                            BANDLAB
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STAGE 1: HYPE TEXT (3-6.5s) */}
            <AnimatePresence>
                {stage === 1 && (
                    <motion.div
                        className="absolute inset-0 flex flex-col items-center justify-center z-20"
                        exit={{ opacity: 0, scale: 0.5, filter: "blur(50px)" }}
                    >
                        {["PREPARE", "FOR", "GLORY"].map((word, i) => (
                            <motion.h1
                                key={word}
                                initial={{ opacity: 0, scale: 5, z: 1000 }}
                                animate={{ opacity: 1, scale: 1, z: 0 }}
                                transition={{ delay: i * 0.8, duration: 0.4, type: "spring", stiffness: 200 }}
                                className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 tracking-tighter uppercase italic"
                                style={{
                                    textShadow: "0 0 50px rgba(255,255,255,0.5)"
                                }}
                            >
                                {word}
                            </motion.h1>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STAGE 2 & 3: TORNADO (6.5s - 11s) */}
            <AnimatePresence>
                {(stage === 2 || stage === 3) && (
                    <motion.div
                        className="absolute inset-0 z-10 flex items-center justify-center"
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: "backIn" }}
                    >
                        {/* Core Vortex */}
                        <div className="relative w-full h-full perspective- distant" style={{ perspective: "1000px" }}>
                            {[...Array(30)].map((_, i) => (
                                <TornadoCard
                                    key={i}
                                    delay={Math.random() * 2}
                                    x={(Math.random() - 0.5) * 1500}
                                    y={(Math.random() - 0.5) * 1000}
                                    z={(Math.random() - 0.5) * 1000}
                                    rotateX={Math.random() * 360}
                                    rotateY={Math.random() * 360}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STAGE 4: REVEAL (11s+) */}
            {stage >= 4 && (
                <>
                    <Confetti isActive={stage === 4} />

                    <motion.div
                        className="absolute inset-0 bg-white z-[100] pointer-events-none"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    />

                    <div className="absolute inset-0 flex items-center justify-center z-30">
                        {/* Shockwave */}
                        <motion.div
                            className="absolute rounded-full border-4 border-yellow-500"
                            initial={{ width: 0, height: 0, opacity: 1, borderWidth: 50 }}
                            animate={{ width: 3000, height: 3000, opacity: 0, borderWidth: 0 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />

                        <HeroCard />
                    </div>
                </>
            )}

            {/* STAGE 5: OUTRO UI (15s+) */}
            {stage === 5 && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-10 left-0 right-0 z-50 flex flex-col items-center gap-6"
                >
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-[0.5em] text-center">
                        DECEMBER 20
                    </h1>

                    <div className="flex gap-4">
                        <Link href="/awards/bandlab2025/live">
                            <button className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:scale-105 transition-all flex items-center gap-2">
                                <Zap className="w-5 h-5" /> Enter Live
                            </button>
                        </Link>
                        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold uppercase tracking-widest rounded-full transition-all flex items-center gap-2">
                            <Play className="w-5 h-5" /> Replay
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Skip Button (Always visible until end) */}
            {stage < 5 && (
                <button
                    onClick={() => setStage(5)}
                    className="absolute bottom-10 right-10 text-white/30 hover:text-white uppercase tracking-widest text-xs font-bold z-[60]"
                >
                    Skip Trailer
                </button>
            )}
        </div>
    );
}

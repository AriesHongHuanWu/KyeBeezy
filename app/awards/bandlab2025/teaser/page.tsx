"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Play, Volume2, VolumeX, SkipForward, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { Confetti } from "@/components/ui/confetti"; // Re-using confetti for the drop

// --- ASSETS ---
const MUSIC_URL = "/audio/teaser-track.mp3"; // Placeholder

// --- UTILS ---
const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// --- COMPONENTS ---

// 1. The Glitch Text (RGB Split)
const GlitchText = ({ text, size = "text-9xl", delay = 0 }: { text: string, size?: string, delay?: number }) => (
    <div className="relative inline-block mix-blend-screen isolate pointer-events-none">
        <motion.div
            className={`font-black ${size} text-white tracking-tighter absolute top-0 left-0 mix-blend-screen`}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: [0, 1, 0.5, 1], x: [-5, 5, 0] }}
            transition={{ delay, duration: 0.2 }}
            style={{ color: "#ff0000" }} // Red Channel
        >
            {text}
        </motion.div>
        <motion.div
            className={`font-black ${size} text-white tracking-tighter absolute top-0 left-0 mix-blend-screen`}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: [0, 1, 0.5, 1], x: [5, -5, 0] }}
            transition={{ delay, duration: 0.2 }}
            style={{ color: "#0000ff" }} // Blue Channel
        >
            {text}
        </motion.div>
        <motion.div
            className={`font-black ${size} text-white tracking-tighter relative z-10`}
            initial={{ opacity: 0, scale: 2, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // "Apple" Ease
        >
            {text}
        </motion.div>
    </div>
);

// 2. The Tunnel Card (Low Poly / Performance Optimized)
const TunnelCard = ({ index, zPos }: { index: number, zPos: number }) => {
    // Spiral Math
    const angle = index * 0.8; // Radian step
    const radius = 600; // Tunnel width
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    // Random rotations for chaotic storm look
    const rotX = useMemo(() => randomRange(-30, 30), []);
    const rotY = useMemo(() => randomRange(-30, 30), []);
    const rotZ = useMemo(() => randomRange(0, 360), []);

    return (
        <motion.div
            className="absolute top-1/2 left-1/2 w-48 h-72 bg-neutral-900 border border-yellow-500/30 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.1)] overflow-hidden"
            style={{
                x, y, z: zPos,
                rotateX: rotX,
                rotateY: rotY,
                rotateZ: rotZ,
            }}
        >
            {/* Simple Detail */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-16 h-16 rounded-full border-2 border-white/50" />
            </div>
        </motion.div>
    );
};

// --- MAIN PAGE ---

export default function TeaserPageV3() {
    const [started, setStarted] = useState(false);
    const [audioMuted, setAudioMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Timeline State
    const [cameraZ, setCameraZ] = useState(0); // The "World" movement
    const [stage, setStage] = useState(-1); // 0:Intro, 1:Tunnel, 2:Impact, 3:Showcase

    // Generate Tunnel Items once
    const tunnelItems = useMemo(() => {
        return Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            z: i * 150 + 500 // Start 500px away, spaced 150px apart
        }));
    }, []);

    // --- SEQUENCE ENGINE ---
    useEffect(() => {
        if (!started) return;

        // Start Audio
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.muted = audioMuted;
            audioRef.current.play().catch(e => console.error("Audio block:", e));
        }

        const runSequence = async () => {
            // STAGE 0: INTRO (0s - 2s)
            setStage(0);

            // STAGE 1: TUNNEL LAUNCH (2s - 7s)
            // We fly from Z=0 to Z=8000
            setTimeout(() => {
                setStage(1);
            }, 2000);

            // STAGE 2: IMPACT / SILENCE (7s - 9s)
            setTimeout(() => {
                setStage(2);
            }, 7000);

            // STAGE 3: THE REVEAL (9s+)
            setTimeout(() => {
                setStage(3);
            }, 9000);
        };

        runSequence();

    }, [started]);

    // Cleanup & Mute Handle
    useEffect(() => {
        if (audioRef.current) audioRef.current.muted = audioMuted;
    }, [audioMuted]);

    // --- INTERACTION: INIT ---
    if (!started) {
        return (
            <div
                className="h-screen w-screen bg-black flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-900 transition-colors duration-500"
                onClick={() => setStarted(true)}
            >
                <div className="relative group">
                    <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse" />
                    <Play className="w-16 h-16 text-white relative z-10 fill-white" />
                </div>
                <div className="mt-8 text-center space-y-2">
                    <h1 className="text-white font-black tracking-[0.5em] text-sm uppercase">Initialize System</h1>
                    <p className="text-neutral-500 text-xs font-mono uppercase">Audio Required for Sync</p>
                </div>
                {/* Audio Preload (Hidden) */}
                <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" preload="auto" />
            </div>
        );
    }

    return (
        <div className="bg-black h-screen w-screen overflow-hidden relative font-sans perspective-1000">
            {/* UI LAYER (Fixed) */}
            <div className="absolute top-6 right-6 z-[100] flex gap-4 mix-blend-difference">
                <button onClick={() => setAudioMuted(!audioMuted)} className="text-white/50 hover:text-white transition-colors">
                    {audioMuted ? <VolumeX /> : <Volume2 />}
                </button>
                <Link href="/awards/bandlab2025/live">
                    <button className="text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        Skip Info <SkipForward className="w-4 h-4" />
                    </button>
                </Link>
            </div>

            {/* --- 3D WORLD --- */}
            {/* We move this container to simulate camera movement */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center transform-3d"
                style={{ transformStyle: "preserve-3d" }}
                animate={{
                    z: stage === 1 ? [0, 8000] : (stage === 2 ? 8500 : (stage === 3 ? 9000 : 0)),
                    rotateZ: stage === 1 ? [0, 90] : (stage >= 2 ? 0 : 0) // Spin during tunnel
                }}
                transition={{
                    duration: stage === 1 ? 5 : (stage === 2 ? 0 : 5), // 5s tunnel flythrough
                    ease: stage === 1 ? "linear" : "easeInOut"
                }}
            >

                {/* --- SECTOR 0: INTRO TEXT (Z=0) --- */}
                <AnimatePresence>
                    {stage === 0 && (
                        <motion.div
                            className="absolute flex flex-col items-center justify-center"
                            style={{ transformStyle: "preserve-3d" }}
                            exit={{ opacity: 0, scale: 5, filter: "blur(50px)" }}
                            transition={{ duration: 0.5, ease: "anticipate" }}
                        >
                            <GlitchText text="2025" size="text-[15vw]" />
                            <motion.div
                                initial={{ width: 0 }} animate={{ width: "20vw" }}
                                className="h-2 bg-white mt-10"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- SECTOR 1: THE TUNNEL (Z=500 to Z=8000) --- */}
                {/* Only render if stage >= 1 to save GPU? Or keep mounted for smooth fly in? Keep mounted. */}
                <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
                    {tunnelItems.map((item) => (
                        <TunnelCard key={item.id} index={item.id} zPos={item.z} />
                    ))}
                </div>

                {/* --- SECTOR 2: IMPACT ZONE (Z=8500) --- */}
                {/* We arrive here at 7s */}
                <div className="absolute flex flex-col items-center justify-center" style={{ transform: `translateZ(8500px)` }}>
                    {stage === 2 && (
                        <>
                            <div className="absolute inset-0 bg-white animate-[ping_0.1s_ease-out_1]" /> {/* Flash */}
                            <GlitchText text="PREPARE" size="text-[10vw]" />
                        </>
                    )}
                </div>

                {/* --- SECTOR 3: THE SHOWCASE (Z=9000) --- */}
                <div className="absolute flex flex-col items-center justify-center" style={{ transform: `translateZ(9000px)` }}>
                    {stage >= 3 && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="relative"
                        >
                            {/* Confetti Explosion */}
                            <Confetti isActive={true} />

                            {/* Hero Content */}
                            <div className="relative z-10 flex flex-col items-center">
                                <motion.img
                                    src="/bandlab-logo.png"
                                    className="w-32 h-32 md:w-48 md:h-48 object-contain mb-8 invert drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]"
                                    initial={{ y: 50, rotateX: 90 }}
                                    animate={{ y: 0, rotateX: 0 }}
                                    transition={{ type: "spring", bounce: 0.4 }}
                                />
                                <GlitchText text="KYEBEEZY" size="text-[8vw]" />
                                <motion.p
                                    className="text-2xl md:text-3xl font-bold text-neutral-400 tracking-[1em] mt-4 uppercase"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                                >
                                    X BANDLAB
                                </motion.p>

                                {/* CTA */}
                                <motion.div
                                    className="mt-16 flex gap-6"
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                                >
                                    <Link href="/awards/bandlab2025/live">
                                        <button className="px-12 py-5 bg-yellow-500 text-black font-black text-xl uppercase tracking-widest hover:scale-105 hover:bg-yellow-400 transition-all shadow-[0_0_50px_rgba(234,179,8,0.4)]">
                                            Enter Live
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => { setStarted(false); setStage(-1); }}
                                        className="px-8 py-5 border border-white/20 text-white font-bold text-xl uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Replay
                                    </button>
                                </motion.div>
                            </div>

                        </motion.div>
                    )}
                </div>

            </motion.div>

            {/* FOG / VIGNETTE OVERLAY */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#000_100%)] z-50" />

            {/* SPEED LINES OVERLAY (Tunnel Phase Only) */}
            <AnimatePresence>
                {stage === 1 && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-40 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"
                    />
                )}
            </AnimatePresence>

        </div>
    );
}

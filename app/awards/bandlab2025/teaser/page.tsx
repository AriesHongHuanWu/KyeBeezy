"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { Play, Volume2, VolumeX, SkipForward } from "lucide-react";
import Link from "next/link";

// --- Configuration ---
// USER: Replace this URL with your epic background music file
const MUSIC_URL = "/audio/teaser-track.mp3";

// --- Components ---

// 1. The Warp Tunnel Effect
const WarpTunnel = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-10" />
        {/* Speed Lines */}
        {[...Array(20)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-[2px] h-[50vh] bg-neutral-500 origin-top"
                style={{ opacity: 0.5 }}
                initial={{ rotate: i * 18, y: 0, scaleY: 0 }}
                animate={{
                    y: [0, 1000],
                    scaleY: [0, 2, 0],
                    opacity: [0, 0.8, 0]
                }}
                transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: Math.random() * 0.5,
                    ease: "linear"
                }}
            />
        ))}
    </div>
);

// 2. Rapid Strobe of Nominees
const StrobeFaces = () => {
    // Placeholder faces/colors for the strobe effect
    const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899"];
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(prev => (prev + 1) % colors.length);
        }, 80); // 12.5fps strobe
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
            <motion.div
                key={index}
                className="w-full h-full opacity-30 mix-blend-screen"
                style={{ backgroundColor: colors[index] }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[20vw] font-black text-white/10 uppercase tracking-tighter leading-none select-none">
                    {["WHO", "WILL", "WIN", "THE", "GOLD"][index % 5]}
                </div>
            </div>
        </div>
    );
};

// 3. Glitch Text (Non-Italic)
const GlitchText = ({ text, subtext }: { text: string, subtext?: string }) => (
    <div className="relative flex flex-col items-center z-50 mix-blend-difference">
        <motion.h1
            className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase relative"
            initial={{ scale: 0.8, filter: "blur(10px)" }}
            animate={{ scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.1, type: "spring", stiffness: 500 }}
        >
            <span className="absolute top-0 left-[-2px] text-red-500 opacity-70 animate-pulse">{text}</span>
            <span className="absolute top-0 left-[2px] text-blue-500 opacity-70 animate-pulse">{text}</span>
            {text}
        </motion.h1>
        {subtext && (
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl md:text-3xl font-bold text-white/80 tracking-[1em] mt-4 uppercase"
            >
                {subtext}
            </motion.p>
        )}
    </div>
);

// --- Main Page ---

export default function TeaserPageV2() {
    const [started, setStarted] = useState(false);
    const [stage, setStage] = useState(-1);
    const [muted, setMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Sequence Engine
    useEffect(() => {
        if (!started) return;

        // Play Audio
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.muted = muted;
            audioRef.current.play().catch(e => console.log("Audio play failed", e));
        }

        const schedule = [
            { time: 0, stage: 0 },      // Intro
            { time: 2500, stage: 1 },   // Warp Speed
            { time: 5000, stage: 2 },   // Strobe Data
            { time: 8000, stage: 3 },   // Silence / Float
            { time: 9500, stage: 4 },   // THE DROP (Reveal)
            { time: 14000, stage: 5 }   // Outro Loop
        ];

        let timeouts: NodeJS.Timeout[] = [];
        schedule.forEach(({ time, stage: s }) => {
            const t = setTimeout(() => setStage(s), time);
            timeouts.push(t);
        });

        return () => {
            timeouts.forEach(clearTimeout);
            if (audioRef.current) audioRef.current.pause();
        };
    }, [started]);

    // Handle Mute Toggle during playback
    useEffect(() => {
        if (audioRef.current) audioRef.current.muted = muted;
    }, [muted]);


    // --- RENDER ---

    // 1. CLICK TO START (Browser requires interaction for audio)
    if (!started) {
        return (
            <div
                onClick={() => setStarted(true)}
                className="h-screen w-screen bg-black flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-900 transition-colors"
            >
                <div className="p-6 rounded-full border border-white/20 bg-white/5 animate-pulse mb-8">
                    <Play className="w-8 h-8 text-white fill-white" />
                </div>
                <h1 className="text-white font-bold tracking-[0.5em] text-sm uppercase">Click to Initialize</h1>
                <p className="text-white/30 text-xs mt-4">Sound Recommended</p>
                {/* Preload Audio */}
                <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" preload="auto" loop={false} />
                {/* Note: Using a reliable generic creative commons placeholder. User should replace. */}
            </div>
        );
    }

    return (
        <div className="bg-black h-screen w-screen overflow-hidden relative font-sans">
            {/* Audio Controller */}
            <div className="absolute top-6 right-6 z-[100] flex gap-4">
                <button onClick={() => setMuted(!muted)} className="text-white/50 hover:text-white transition-colors">
                    {muted ? <VolumeX /> : <Volume2 />}
                </button>
                <Link href="/awards/bandlab2025/live">
                    <button className="text-white/50 hover:text-white transition-colors font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                        Skip <SkipForward className="w-4 h-4" />
                    </button>
                </Link>
            </div>

            {/* STAGE 0: INTRO (0-2.5s) */}
            {stage === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-[12vw] font-black text-white leading-none tracking-tighter">
                            2025
                        </h1>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className="h-2 bg-yellow-500 mx-auto mt-4"
                        />
                    </motion.div>
                </div>
            )}

            {/* STAGE 1: WARP SPEED (2.5s - 5s) */}
            {stage === 1 && (
                <div className="absolute inset-0 bg-black">
                    <WarpTunnel />
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <GlitchText text="Bandlab" />
                    </div>
                </div>
            )}

            {/* STAGE 2: STROBE DATA (5s - 8s) */}
            {stage === 2 && (
                <StrobeFaces />
            )}

            {/* STAGE 3: SILENCE (8s - 9.5s) */}
            {stage === 3 && (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 0.8] }} // Heartbeat
                        transition={{ duration: 0.2 }}
                        className="w-4 h-4 bg-white rounded-full shadow-[0_0_50px_white]"
                    />
                </div>
            )}

            {/* STAGE 4: THE DROP (9.5s+) */}
            {stage >= 4 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white animate-in fade-in duration-1000">
                    {/* Flash Out to Video Ending Style */}
                    <motion.div
                        className="absolute inset-0 bg-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1, delay: 0.1 }} // Immediate cut to black after white flash
                    />

                    <div className="relative z-10 text-center mix-blend-difference">
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                        >
                            <img src="/bandlab-logo.png" className="w-32 h-32 mx-auto mb-8 invert object-contain" />
                            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4">
                                KYEBEEZY
                            </h1>
                            <p className="text-2xl font-bold text-white/50 tracking-[0.5em] uppercase">
                                X BANDLAB
                            </p>
                        </motion.div>

                        {stage === 5 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-16"
                            >
                                <Link href="/awards/bandlab2025/live">
                                    <button className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-yellow-400 hover:scale-105 transition-all">
                                        Enter Experience
                                    </button>
                                </Link>
                                <div className="mt-8">
                                    <button onClick={() => { setStarted(false); setStage(-1); }} className="text-white/30 hover:text-white uppercase font-bold text-xs tracking-widest">
                                        Replay Ad
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

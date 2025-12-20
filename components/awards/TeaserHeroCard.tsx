"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";

interface TeaserHeroCardProps {
    isRevealed: boolean;
    onRevealComplete: () => void;
}

export const TeaserHeroCard = ({ isRevealed, onRevealComplete }: TeaserHeroCardProps) => {
    // Teaser Simulation State
    const [phase, setPhase] = useState<'IDLE' | 'GATHERING' | 'ABSORBING' | 'REVEALED'>('GATHERING');

    useEffect(() => {
        if (isRevealed) {
            setPhase('ABSORBING'); // Brief tension
            setTimeout(() => {
                setPhase('REVEALED');
                // Play internal SFX
                const audio = new Audio("https://www.myinstants.com/media/sounds/tada-fanfare-a.mp3");
                audio.volume = 0.5;
                audio.play().catch(() => { });
                onRevealComplete();
            }, 1000); // 1s Absorbing tension before pop
        } else {
            setPhase('GATHERING');
        }
    }, [isRevealed]);

    // Derived vars for animation logic
    const isCharging = phase === 'GATHERING' || phase === 'ABSORBING';
    const isAbsorbing = phase === 'ABSORBING';
    const isDone = phase === 'REVEALED';

    return (
        <div className="flex flex-col items-center justify-center relative z-20 perspective-1000 scale-125 md:scale-150">
            {/* Schematic Glow */}
            <motion.div
                animate={{
                    scale: isAbsorbing ? [1.5, 0.5] : (isCharging ? [1, 1.2, 1] : 1.5),
                    opacity: isAbsorbing ? [1, 0] : (isCharging ? 0.8 : 0),
                }}
                className="absolute w-[500px] h-[500px] bg-yellow-500/10 blur-[80px] rounded-full"
            />

            {/* The Physical Card */}
            <motion.div
                className="relative w-[300px] h-[460px] cursor-pointer group"
                animate={{
                    // Shake logic copied from GachaCard
                    x: isAbsorbing ? [-5, 5, -5, 5] : [-2, 2, -2, 2, 0],
                    y: isAbsorbing ? 0 : [0, -20, 0],
                    rotateY: isDone ? 180 : 0
                }}
                transition={{
                    x: { duration: 0.1, repeat: isAbsorbing ? Infinity : 0 },
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    rotateY: { duration: 0.6, ease: "backOut" }
                }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* --- CARD BACK (The Mystery) --- */}
                <div className="absolute inset-0 rounded-[30px] border-4 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)] bg-black z-20 overflow-hidden"
                    style={{ backfaceVisibility: "hidden" }}>
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-black to-yellow-900/40" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Sparkles className={`w-24 h-24 text-yellow-500 ${isCharging ? 'animate-spin' : ''} duration-[3s]`} />
                        <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 uppercase tracking-widest mt-4">
                            {isAbsorbing ? "LOCKED" : "VOTING"}
                        </h3>
                    </div>
                </div>

                {/* --- CARD FRONT (The Reveal) --- */}
                <div className="absolute inset-0 rounded-[30px] border-[6px] border-yellow-400 shadow-[0_0_100px_rgba(234,179,8,0.6)] bg-black z-20 overflow-hidden"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-500 via-yellow-900/50 to-black" />

                    <div className="flex flex-col items-center justify-center h-full relative z-10 p-4 text-center" style={{ transformStyle: "preserve-3d" }}>
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: isDone ? 1 : 0 }}
                            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                            className="w-40 h-40 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white"
                        >
                            {/* Placeholder Avatar */}
                            <span className="text-4xl text-black font-black">?</span>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }} animate={{ y: isDone ? 0 : 20, opacity: isDone ? 1 : 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <img src="/bandlab-logo.png" className="w-8 h-8 mx-auto mb-2 invert brightness-0" />
                            <h2 className="text-4xl font-black text-white leading-none">WINNER</h2>
                            <p className="text-xs font-bold text-white/50 tracking-[0.5em] mt-2">REVEALED</p>
                        </motion.div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

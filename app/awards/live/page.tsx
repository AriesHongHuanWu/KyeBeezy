"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Star, Crown, Sparkles, MonitorPlay } from "lucide-react";
import { getAwardsData } from "../data-fetcher";
import { Confetti } from "@/components/ui/confetti";
import Link from "next/link";
import { toast } from "sonner";

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

// 1. Intro Slide
const IntroSlide = ({ onStart }: { onStart: () => void }) => (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-yellow-900/20" />

        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="z-10 relative"
        >
            <div className="mb-8 flex justify-center">
                <div className="p-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 animate-pulse">
                    <Crown className="w-16 h-16 text-yellow-500" />
                </div>
            </div>
            <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-800 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)] mb-6">
                AWARDS<br />NIGHT
            </h1>
            <p className="text-2xl text-white/50 font-light tracking-[0.5em] uppercase mb-12">
                Live Presentation
            </p>

            <button
                onClick={onStart}
                className="group px-8 py-4 bg-white text-black hover:bg-yellow-400 font-bold tracking-widest uppercase transition-all rounded-full flex items-center gap-2 mx-auto"
            >
                Start Ceremony <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </motion.div>
    </div>
);

// 2. Gacha Card Component
const GachaCard = ({ winner, onReveal }: { winner: Nominee, onReveal: () => void }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    const handleClick = () => {
        if (isRevealed) return;
        setIsShaking(true);
        setTimeout(() => {
            setIsShaking(false);
            setIsRevealed(true);
            onReveal();
        }, 1500); // 1.5s suspense
    };

    return (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="relative w-80 h-[480px] perspective-1000 cursor-pointer" onClick={handleClick}>
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-700"
                    animate={{
                        rotateY: isRevealed ? 180 : 0,
                        x: isShaking ? [0, -10, 10, -10, 10, 0] : 0,
                    }}
                    transition={{
                        rotateY: { type: "spring", damping: 15 },
                        x: { duration: 0.4, repeat: isShaking ? 3 : 0 }
                    }}
                >
                    {/* CARD BACK (Mystery) */}
                    <div className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden border-4 border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.2)] bg-black">
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.1),transparent)] animate-shine" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black p-8">
                            <Sparkles className="w-20 h-20 text-yellow-500/50 mb-4 animate-pulse" />
                            <h3 className="text-3xl font-bold text-yellow-500/50 uppercase tracking-widest text-center">
                                Winner<br />Inside
                            </h3>
                            <p className="mt-8 text-white/30 text-sm">Click to Reveal</p>
                        </div>
                    </div>

                    {/* CARD FRONT (Winner) */}
                    <div className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden border-4 border-yellow-500 shadow-[0_0_100px_rgba(234,179,8,0.8)] bg-black rotate-y-180">
                        {/* SSR/Legendary Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 to-black animate-pulse" />
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

                        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: isRevealed ? 1 : 0 }}
                                transition={{ type: "spring", delay: 0.2 }}
                            >
                                {winner.image ? (
                                    <img src={winner.image} alt={winner.name} className="w-40 h-40 rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.6)] object-cover mb-6" />
                                ) : (
                                    <div className="w-40 h-40 rounded-full border-4 border-yellow-400 bg-yellow-900/50 flex items-center justify-center text-4xl font-bold text-yellow-200 mb-6">
                                        {winner.name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: isRevealed ? 1 : 0, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                <h2 className="text-3xl font-black text-white leading-tight mb-2 drop-shadow-md">
                                    {winner.name}
                                </h2>
                                <div className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold uppercase rounded-full inline-block">
                                    {winner.voteCount} Votes
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// 3. Category Slide
const CategorySlide = ({ category }: { category: CategoryData }) => {
    // Phases: 'NOMINEES' -> 'REVEAL'
    const [phase, setPhase] = useState<'NOMINEES' | 'REVEAL'>('NOMINEES');
    const [showConfetti, setShowConfetti] = useState(false);

    // Reset when category changes
    useEffect(() => {
        setPhase('NOMINEES');
        setShowConfetti(false);
    }, [category]);

    return (
        <div className="h-screen flex flex-col pt-12 pb-8 px-8 relative overflow-hidden bg-black selection:bg-yellow-500/30">
            <Confetti isActive={showConfetti} />

            {/* Category Title */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12 relative z-10"
            >
                <div className="inline-flex items-center gap-2 text-yellow-500 text-sm font-bold uppercase tracking-[0.3em] mb-4">
                    <Star className="w-4 h-4 fill-current" /> Category {phase === 'REVEAL' && 'Winner'}
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">
                    {category.title}
                </h2>
            </motion.div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <AnimatePresence mode="wait">
                    {phase === 'NOMINEES' && (
                        <motion.div
                            key="nominees"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                            className="w-full max-w-6xl"
                        >
                            <div className="flex flex-wrap items-center justify-center gap-8">
                                {category.nominees.map((nominee, i) => (
                                    <motion.div
                                        key={nominee.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex flex-col items-center gap-4 group"
                                    >
                                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-white/10 p-1 group-hover:border-yellow-500 transition-colors">
                                            {nominee.image ? (
                                                <img src={nominee.image} alt={nominee.name} className="w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-white/30 text-xl font-bold">
                                                    {nominee.name.substring(0, 2)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-white/60 font-medium group-hover:text-white transition-colors">{nominee.name}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-16 text-center">
                                <button
                                    onClick={() => setPhase('REVEAL')}
                                    className="px-8 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold tracking-widest border border-white/10 backdrop-blur-md transition-all hover:scale-105"
                                >
                                    REVEAL WINNER
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {phase === 'REVEAL' && category.winner && (
                        <motion.div
                            key="reveal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full flex justify-center"
                        >
                            <GachaCard
                                winner={category.winner}
                                onReveal={() => setShowConfetti(true)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// --- Page & Data Loading ---
export default function LiveAwardsPage() {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(-1); // -1 = Intro

    useEffect(() => {
        getAwardsData().then(data => {
            setCategories(data);
            setLoading(false);
        });
    }, []);

    // Keyboard Navigation
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") nextSlide();
            if (e.key === "ArrowLeft") prevSlide();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [categories, currentIndex]);

    const nextSlide = () => {
        if (currentIndex < categories.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentIndex > -1) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    if (loading) return <div className="h-screen bg-black flex items-center justify-center text-yellow-500"><MonitorPlay className="animate-bounce" /></div>;

    return (
        <div className="bg-black min-h-screen text-white overflow-hidden relative">
            {/* Background Texture for Whole Page */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none z-50 mix-blend-overlay" />

            {/* Content Carousel */}
            <AnimatePresence mode="wait">
                {currentIndex === -1 ? (
                    <motion.div key="intro" exit={{ opacity: 0, y: -100 }} className="absolute inset-0">
                        <IntroSlide onStart={() => setCurrentIndex(0)} />
                    </motion.div>
                ) : (
                    <motion.div
                        key={categories[currentIndex].id}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute inset-0"
                    >
                        <CategorySlide category={categories[currentIndex]} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Overlay (Hidden in OBS if cropped, but useful for presenter) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 opacity-0 hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                <button onClick={prevSlide} className="p-2 hover:text-yellow-500 disabled:opacity-30" disabled={currentIndex === -1}>
                    <ChevronLeft />
                </button>
                <div className="text-xs font-mono text-white/50">
                    {currentIndex === -1 ? "INTRO" : `${currentIndex + 1} / ${categories.length}`}
                </div>
                <button onClick={nextSlide} className="p-2 hover:text-yellow-500 disabled:opacity-30" disabled={currentIndex === categories.length - 1}>
                    <ChevronRight />
                </button>
            </div>

            {/* Back to Site (Top Left) */}
            <Link href="/awards" className="absolute top-6 left-6 z-50 p-2 bg-black/50 backdrop-blur rounded-full text-white/20 hover:text-white transition-colors border border-white/5 hover:border-white/20">
                <ChevronLeft className="w-5 h-5" />
            </Link>
        </div>
    );
}

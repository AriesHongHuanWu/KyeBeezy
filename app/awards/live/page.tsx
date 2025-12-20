"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Star, Crown, Sparkles, MonitorPlay, ArrowLeft } from "lucide-react";
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
    <div className="flex flex-col items-center justify-center h-screen text-center bg-black relative overflow-hidden font-sans">
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

// 2. Enhanced Gacha Card Component
const GachaCard = ({ winner, onReveal }: { winner: Nominee, onReveal: () => void }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    const handleClick = () => {
        if (isRevealed) return;
        setIsShaking(true);
        // Play sound here ideally
        setTimeout(() => {
            setIsShaking(false);
            setIsRevealed(true);
            onReveal();
        }, 1200);
    };

    return (
        <div className="flex flex-col items-center justify-center py-10 relative z-20">
            {/* Glow Effect behind the card */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/20 blur-[100px] rounded-full transition-opacity duration-1000 ${isRevealed ? 'opacity-100' : 'opacity-0'}`} />

            <div className="relative w-[340px] h-[520px] perspective-1000 cursor-pointer group" onClick={handleClick}>
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-700"
                    animate={{
                        rotateY: isRevealed ? 180 : 0,
                        x: isShaking ? [0, -15, 15, -15, 15, 0] : 0,
                    }}
                    transition={{
                        rotateY: { type: "spring", damping: 12, stiffness: 60 },
                        x: { duration: 0.4, repeat: isShaking ? 2 : 0 }
                    }}
                >
                    {/* CARD BACK (Mystery) */}
                    <div className="absolute inset-0 backface-hidden rounded-[30px] overflow-hidden border-4 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)] bg-black z-20">
                        {/* Animated Mesh / Pattern */}
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30" />
                        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-yellow-900/40" />

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse" />
                                <Sparkles className="w-24 h-24 text-yellow-400 relative z-10" />
                            </div>
                            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 uppercase tracking-widest text-center drop-shadow-sm">
                                SECRET<br />REVEAL
                            </h3>
                            <div className="mt-8 px-6 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-200 text-sm font-bold animate-bounce">
                                TAP TO OPEN
                            </div>
                        </div>
                    </div>

                    {/* CARD FRONT (Winner) */}
                    <div className="absolute inset-0 backface-hidden rounded-[30px] overflow-hidden border-[6px] border-yellow-400 shadow-[0_0_100px_rgba(234,179,8,0.6)] bg-black rotate-y-180 z-10">
                        {/* SSR/Legendary Background Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500 via-yellow-900/50 to-black animate-pulse" />
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay" />

                        {/* Particles / Rays */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,223,0,0.4)_0%,transparent_70%)]" />

                        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: isRevealed ? 1 : 0.5, opacity: isRevealed ? 1 : 0 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-yellow-400 blur-md rounded-full" />
                                {winner.image ? (
                                    <img src={winner.image} alt={winner.name} className="w-48 h-48 rounded-full border-4 border-white shadow-2xl object-cover relative z-10" />
                                ) : (
                                    <div className="w-48 h-48 rounded-full border-4 border-white bg-yellow-600 flex items-center justify-center text-5xl font-bold text-white relative z-10 shadow-2xl">
                                        {winner.name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: isRevealed ? 1 : 0, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-8"
                            >
                                <Crown className="w-10 h-10 text-yellow-200 mx-auto mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                                <h2 className="text-4xl font-black text-white leading-tight mb-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                                    {winner.name}
                                </h2>
                                <div className="px-4 py-1.5 bg-white text-black text-sm font-black uppercase rounded-full inline-block shadow-lg">
                                    WINNER • {winner.voteCount} Votes
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
const CategorySlide = ({ category, onNext }: { category: CategoryData, onNext?: () => void }) => {
    // Phases: 'NOMINEES' -> 'REVEAL'
    const [phase, setPhase] = useState<'NOMINEES' | 'REVEAL'>('NOMINEES');
    const [showConfetti, setShowConfetti] = useState(false);

    // Reset when category changes
    useEffect(() => {
        setPhase('NOMINEES');
        setShowConfetti(false);
    }, [category]);

    return (
        <div className="h-screen flex flex-col pt-12 pb-8 px-8 relative overflow-hidden bg-black selection:bg-yellow-500/30 font-sans">
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
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">
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
                            className="w-full max-w-7xl"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
                                {category.nominees.map((nominee, i) => (
                                    <motion.div
                                        key={nominee.name}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex flex-col items-center gap-4 group cursor-default"
                                    >
                                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-b from-white/20 to-transparent group-hover:from-yellow-500 group-hover:to-yellow-800 transition-all duration-300">
                                            <div className="absolute inset-0 bg-black rounded-full m-[2px]" />
                                            {nominee.image ? (
                                                <img src={nominee.image} alt={nominee.name} className="relative z-10 w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 pointer-events-none" />
                                            ) : (
                                                <div className="relative z-10 w-full h-full rounded-full bg-white/5 flex items-center justify-center text-white/30 text-2xl font-bold">
                                                    {nominee.name.substring(0, 2)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-white/60 font-bold text-lg group-hover:text-yellow-400 transition-colors text-center">{nominee.name}</span>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-20 text-center">
                                <button
                                    onClick={() => setPhase('REVEAL')}
                                    className="px-10 py-4 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-black text-xl tracking-widest shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)] hover:scale-105 transition-all"
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
                            className="w-full flex flex-col items-center justify-center"
                        >
                            <GachaCard
                                winner={category.winner}
                                onReveal={() => setShowConfetti(true)}
                            />

                            {/* "Next Category" button appears after reveal */}
                            {showConfetti && onNext && (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1 }}
                                    onClick={onNext}
                                    className="mt-8 flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-bold backdrop-blur-md transition-all group"
                                >
                                    NEXT CATEGORY <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            )}
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
        <div className="bg-black min-h-screen text-white overflow-hidden relative font-sans">
            {/* Background Texture for Whole Page */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none z-50 mix-blend-overlay" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,50,1)_0%,rgba(0,0,0,1)_100%)] -z-10" />

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
                        <CategorySlide
                            category={categories[currentIndex]}
                            onNext={currentIndex < categories.length - 1 ? nextSlide : undefined}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Always Visible Navigation Controls (Bottom Corners) */}
            <div className="fixed bottom-8 left-8 z-50">
                <button
                    onClick={prevSlide}
                    className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white/50 hover:text-white transition-all border border-white/5 hover:border-white/20 hover:scale-110 disabled:opacity-0 disabled:pointer-events-none"
                    disabled={currentIndex === -1}
                    title="Previous Slide (Left Arrow)"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
            </div>

            <div className="fixed bottom-8 right-8 z-50">
                <button
                    onClick={nextSlide}
                    className="p-4 bg-yellow-500/20 hover:bg-yellow-500/40 backdrop-blur-md rounded-full text-yellow-500 hover:text-yellow-200 transition-all border border-yellow-500/20 hover:border-yellow-500/50 hover:scale-110 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] disabled:opacity-0 disabled:pointer-events-none"
                    disabled={currentIndex === categories.length - 1}
                    title="Next Slide (Right Arrow)"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Back to Site (Bottom Center) - moved to avoid obstruction */}
            <div className="fixed top-6 left-6 z-50">
                <Link href="/awards" className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full text-white/30 hover:text-white transition-colors border border-white/5 hover:border-white/20">
                    <ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest font-bold">Exit</span>
                </Link>
            </div>
        </div>
    );
}

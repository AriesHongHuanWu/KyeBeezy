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

// 3. Thick 3D Gacha Card (No Shake, Fly Out Version)
const GachaCard = ({ winner, onReveal }: { winner: Nominee, onReveal: () => void }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    // --- Audio Helper ---
    const playSound = (type: 'tada') => {
        const audio = new Audio("https://www.myinstants.com/media/sounds/tada-fanfare-a.mp3");
        audio.volume = 0.8;
        audio.play().catch(e => console.warn("Audio play failed", e));
    };

    const handleClick = () => {
        if (isRevealed) return;

        // Immediate Trigger
        setIsRevealed(true);
        setShowFlash(true);
        playSound('tada');
        onReveal();
        setTimeout(() => setShowFlash(false), 800);
    };

    return (
        <div className="flex flex-col items-center justify-center py-10 relative z-20 perspective-1000">
            {/* Glow Effect behind the card */}
            <motion.div
                animate={{ scale: isRevealed ? 1.2 : 1, opacity: isRevealed ? 0.8 : 0.4 }}
                transition={{ duration: 1 }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/20 blur-[100px] rounded-full transition-opacity duration-1000`}
            />

            <motion.div
                className="relative w-[340px] h-[520px] cursor-pointer group"
                onClick={handleClick}
                initial={{ y: 0 }}
                animate={{
                    rotateY: isRevealed ? 180 : 0,
                    y: isRevealed ? [0, -10, 0] : [0, -15, 0],
                }}
                transition={{
                    rotateY: { duration: 0.8, ease: "easeInOut" }, // Smooth flip, no spring bounce to prevent edge clipping
                    y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                }}
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* --- 3D THICKNESS SIDES (Heavily Inset to avoid Rounded Corner Clipping) --- */}
                {/* Right Side */}
                <div className="absolute top-[40px] right-0 w-[12px] h-[calc(100%-80px)] bg-yellow-800 origin-right transform rotateY(-90deg) translateZ(1px)" />
                {/* Left Side */}
                <div className="absolute top-[40px] left-0 w-[12px] h-[calc(100%-80px)] bg-yellow-600 origin-left transform rotateY(90deg) translateZ(1px)" />
                {/* Top Side */}
                <div className="absolute top-0 left-[40px] w-[calc(100%-80px)] h-[12px] bg-yellow-700 origin-top transform rotateX(-90deg) translateZ(1px)" />
                {/* Bottom Side */}
                <div className="absolute bottom-0 left-[40px] w-[calc(100%-80px)] h-[12px] bg-yellow-900 origin-bottom transform rotateX(90deg) translateZ(1px)" />

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

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse" />
                            <Sparkles className="w-24 h-24 text-yellow-400 relative z-10" />
                        </div>
                        <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 uppercase tracking-widest text-center drop-shadow-sm">
                            SECRET<br />REVEAL
                        </h3>
                        <div className="mt-8 px-6 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-200 text-sm font-bold animate-pulse">
                            CLICK TO REVEAL
                        </div>
                    </div>
                </div>

                {/* CARD FRONT (Winner) */}
                <div
                    className="absolute inset-0 rounded-[30px] border-[6px] border-yellow-400 shadow-[0_0_100px_rgba(234,179,8,0.6)] bg-black z-20 overflow-hidden"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(10px)" }}
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

// 4. Category Slide
const CategorySlide = ({ category, onNext }: { category: CategoryData, onNext?: () => void }) => {
    const [phase, setPhase] = useState<'NOMINEES' | 'REVEAL'>('NOMINEES');
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setPhase('NOMINEES');
        setShowConfetti(false);
    }, [category]);

    return (
        <div className="h-screen flex flex-col pt-12 pb-8 px-8 relative overflow-hidden bg-black selection:bg-yellow-500/30 font-sans">
            <Confetti isActive={showConfetti} />

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

            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                <AnimatePresence mode="wait">
                    {phase === 'NOMINEES' && (
                        <motion.div
                            key="nominees"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2, filter: "blur(20px)" }}
                            className="w-full max-w-[95vw]"
                        >
                            {/* FLEX ROW for Single Line Layout with Floating Animation */}
                            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
                                {category.nominees.map((nominee, i) => (
                                    <motion.div
                                        key={nominee.name}
                                        initial={{ opacity: 0, y: 50, rotate: -5 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            rotate: 0,
                                            // Floating "Breathing" Effect
                                            translateY: [0, -10, 0]
                                        }}
                                        transition={{
                                            delay: i * 0.1,
                                            opacity: { duration: 0.5 },
                                            y: { type: "spring", stiffness: 100 },
                                            rotate: { duration: 0.5 },
                                            translateY: { // Floating Loop
                                                duration: 3 + (i * 0.5), // Stagger loop duration so they don't sync
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: 0.5 + (i * 0.2) // Stagger start of float
                                            }
                                        }}
                                        className="flex flex-col items-center gap-4 group cursor-default"
                                    >
                                        <div className="relative w-32 h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full p-1 bg-gradient-to-b from-white/20 to-transparent group-hover:from-yellow-500 group-hover:to-yellow-800 transition-all duration-300 shadow-[0_0_0_0px_rgba(234,179,8,0)] group-hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] group-hover:scale-110">
                                            <div className="absolute inset-0 bg-black rounded-full m-[2px]" />
                                            {nominee.image ? (
                                                <img src={nominee.image} alt={nominee.name} className="relative z-10 w-full h-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 pointer-events-none" />
                                            ) : (
                                                <div className="relative z-10 w-full h-full rounded-full bg-white/5 flex items-center justify-center text-white/30 text-2xl font-bold">
                                                    {nominee.name.substring(0, 2)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-white/60 font-bold text-lg md:text-xl group-hover:text-yellow-400 transition-colors text-center max-w-[180px] leading-tight drop-shadow-md">{nominee.name}</span>
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
                            {showConfetti && !onNext && (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1 }}
                                    onClick={onNext || (() => { })} // Hack: pass 'next' to trigger parent state change to 'outro'
                                    className="mt-8 flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white font-bold backdrop-blur-md transition-all group"
                                >
                                    FINISH CEREMONY <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
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
            if (e.key === "ArrowRight") nextSlide();
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
                        key={categories[currentIndex].id}
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

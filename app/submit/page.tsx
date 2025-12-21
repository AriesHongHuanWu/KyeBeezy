"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, onSnapshot, doc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { toast } from "sonner";
import {
    ArrowRight,
    Check,
    Lock,
    WifiOff,
    Music2,
    User,
    Link as LinkIcon,
    Sparkles,
    Radio,
    Zap
} from "lucide-react";

interface SubmissionForm {
    songName: string;
    artistName: string;
    link: string;
}

// Animation Variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const glitchVariants = {
    hidden: { skew: 0 },
    visible: {
        skew: [0, 10, -10, 0],
        x: [0, -2, 2, 0],
        transition: {
            repeat: Infinity,
            repeatDelay: 3,
            duration: 0.2
        }
    }
};

export default function SubmitPage() {
    const [form, setForm] = useState<SubmissionForm>({
        songName: "",
        artistName: "",
        link: "",
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "submitted" | "round_locked" | "event_offline">("idle");
    const [roundId, setRoundId] = useState<number>(1);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [showSplash, setShowSplash] = useState(false);

    // Ref to track previous round for splash triggering
    const prevRoundRef = useRef<number>(1);
    const isFirstLoad = useRef(true);

    // Initial Status Check
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const settingsRef = doc(db, "settings", "submission");
                const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        const currentRound = data.currentRoundId || 1;
                        const isOpen = data.isOpen !== false;
                        const isEventActive = data.isEventActive !== false;
                        const remoteSessionVersion = data.sessionVersion || "v1";

                        // Splash Logic: If round incremented (and not first load), show splash
                        if (!isFirstLoad.current && currentRound > prevRoundRef.current) {
                            setShowSplash(true);
                            // Hide splash after 3 seconds
                            setTimeout(() => setShowSplash(false), 3500);
                        }

                        // Update Refs
                        prevRoundRef.current = currentRound;
                        if (isFirstLoad.current) isFirstLoad.current = false;

                        setRoundId(currentRound);

                        // Version Check (Hard Reset)
                        const localSessionVersion = localStorage.getItem("sessionVersion");
                        if (localSessionVersion !== remoteSessionVersion) {
                            console.log("Session reset detected.");
                            localStorage.removeItem("lastSubmittedRound");
                            localStorage.setItem("sessionVersion", remoteSessionVersion);
                        }

                        // Determine Mode
                        if (!isEventActive) {
                            setStatus("event_offline");
                        } else if (!isOpen) {
                            setStatus("round_locked");
                        } else {
                            // Check local submission
                            const lastSubmittedRound = localStorage.getItem("lastSubmittedRound");
                            if (lastSubmittedRound && parseInt(lastSubmittedRound) === currentRound) {
                                setStatus("submitted");
                            } else {
                                setStatus("idle");
                            }
                        }
                    } else {
                        // Init
                        setDoc(settingsRef, { currentRoundId: 1, isOpen: true, isEventActive: true, sessionVersion: "v1" }, { merge: true });
                        setRoundId(1);
                        setStatus("idle");
                    }
                    setCheckingStatus(false);
                });
                return () => unsubscribe();
            } catch (error) {
                console.error(error);
                setCheckingStatus(false);
            }
        };
        checkStatus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!form.songName || !form.artistName || !form.link) {
            toast.error("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, "submissions"), {
                ...form,
                roundId,
                submittedAt: serverTimestamp(),
                status: "pending"
            });

            localStorage.setItem("lastSubmittedRound", roundId.toString());
            setStatus("submitted");
            toast.success("Requests Sent!");
            setForm({ songName: "", artistName: "", link: "" });
        } catch (error) {
            console.error(error);
            toast.error("Submission failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 rounded-full border-t-2 border-purple-500 animate-spin" />
                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 animate-pulse">Initializing Uplink...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-purple-500/30 flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* --- Splash Overlay (Cinematic Round Start) --- */}
            <AnimatePresence>
                {showSplash && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-2xl"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full animate-pulse" />
                            <h1 className="relative text-7xl md:text-9xl font-black italic tracking-tighter text-white text-center">
                                ROUND <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">{roundId}</span>
                            </h1>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-4"
                            />
                            <p className="text-center text-neutral-400 font-mono tracking-[0.5em] mt-6 text-xl">UNLOCKED // BEGIN</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Ambient Background --- */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] animate-blob" />
                <div className="absolute top-[40%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-600/20 rounded-full blur-[128px] animate-blob animation-delay-4000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* --- Main Container --- */}
            <div className="w-full max-w-lg relative z-10">
                <div className="mb-12 text-center relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-bold tracking-widest uppercase mb-6 text-neutral-300 shadow-lg">
                        {status === "event_offline" ? (
                            <span className="flex items-center gap-2 text-red-500"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Offline</span>
                        ) : (
                            <span className="flex items-center gap-2 text-green-400"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" /> Live • Round {roundId}</span>
                        )}
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white mb-2 drop-shadow-sm">
                        DROP THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">HEAT</span>
                    </h1>
                    <p className="text-neutral-400 text-lg font-medium">Send your track to the stream queue.</p>
                </div>

                <AnimatePresence mode="wait">

                    {/* STATE: OFFLINE */}
                    {status === "event_offline" && (
                        <motion.div
                            key="offline"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                            className="glass-panel p-10 rounded-3xl text-center border border-white/5"
                        >
                            <motion.div
                                variants={glitchVariants}
                                initial="hidden"
                                animate="visible"
                                className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                            >
                                <WifiOff size={40} className="text-red-500" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-2">Stream Offline</h2>
                            <p className="text-neutral-400">The gateway is currently closed.<br />Stand by for the next session.</p>
                        </motion.div>
                    )}

                    {/* STATE: LOCKED */}
                    {status === "round_locked" && (
                        <motion.div
                            key="locked"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                            className="glass-panel p-10 rounded-3xl text-center border border-white/5"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                            >
                                <Lock size={40} className="text-yellow-500" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white mb-2">Round Locked</h2>
                            <p className="text-neutral-400">Submissions are paused while we vibe.<br />Next round starting soon.</p>
                        </motion.div>
                    )}

                    {/* STATE: SUBMITTED */}
                    {status === "submitted" && (
                        <motion.div
                            key="submitted"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="glass-panel p-10 rounded-3xl text-center border border-white/5 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-green-500/5 z-0" />
                            <div className="relative z-10">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.3)]"
                                >
                                    <Check size={48} className="text-green-400 drop-shadow-md" />
                                </motion.div>
                                <h2 className="text-3xl font-bold text-white mb-2">Received</h2>
                                <p className="text-neutral-400 mb-8">You're in the queue for Round {roundId}.<br />Good luck!</p>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-neutral-500 font-mono">
                                    ID: {Date.now().toString().slice(-8)} • PENDING REVIEW
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STATE: FORM */}
                    {status === "idle" && (
                        <motion.div
                            key="form"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, y: -20 }}
                            className="glass-panel p-8 rounded-3xl border border-white/10 relative"
                        >
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                                {/* Input Group */}
                                <motion.div variants={itemVariants} className="space-y-1">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Track Title</label>
                                    <div className="relative group">
                                        <Music2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            type="text"
                                            name="songName"
                                            value={form.songName}
                                            onChange={handleChange}
                                            placeholder="e.g. Lucid Dreams"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-black/60 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-1">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Artist</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input
                                            type="text"
                                            name="artistName"
                                            value={form.artistName}
                                            onChange={handleChange}
                                            placeholder="e.g. Juice WRLD"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500/50 focus:bg-black/60 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="space-y-1">
                                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider ml-1">Link</label>
                                    <div className="relative group">
                                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-pink-400 transition-colors" />
                                        <input
                                            type="url"
                                            name="link"
                                            value={form.link}
                                            onChange={handleChange}
                                            placeholder="SoundCloud, YouTube, etc."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-pink-500/50 focus:bg-black/60 focus:ring-1 focus:ring-pink-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </motion.div>

                                <motion.button
                                    variants={itemVariants}
                                    type="submit"
                                    disabled={loading}
                                    className="mt-4 w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg tracking-wide hover:shadow-[0_0_20px_rgba(147,51,234,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            SEND IT <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 flex items-center gap-2 text-xs font-bold text-neutral-600 uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
                <Sparkles size={12} /> Powered by KyeBeezy Engine
            </div>
        </div>
    );
}

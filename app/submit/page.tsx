"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, onSnapshot, doc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Lock, Music2, Sparkles, AlertCircle, WifiOff, Disc3 } from "lucide-react";

interface SubmissionForm {
    songName: string;
    artistName: string;
    link: string;
}

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

    // Dynamic Greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Listen to round settings
                const settingsRef = doc(db, "settings", "submission");
                const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        const currentRound = data.currentRoundId || 1;
                        const isOpen = data.isOpen !== false; // Default true
                        const isEventActive = data.isEventActive !== false; // Default true

                        setRoundId(currentRound);

                        // 1. Check Event Active
                        if (!isEventActive) {
                            setStatus("event_offline");
                            setCheckingStatus(false);
                            return;
                        }

                        // 2. Check Round Locked
                        if (!isOpen) {
                            setStatus("round_locked");
                            setCheckingStatus(false);
                            return;
                        }

                        // 3. Check User Submission for this round
                        const lastSubmittedRound = localStorage.getItem("lastSubmittedRound");
                        if (lastSubmittedRound && parseInt(lastSubmittedRound) === currentRound) {
                            setStatus("submitted");
                        } else {
                            setStatus("idle");
                        }
                    } else {
                        // Initialize settings if not exists
                        setDoc(settingsRef, { currentRoundId: 1, isOpen: true, isEventActive: true }, { merge: true });
                        setRoundId(1);
                        setStatus("idle");
                    }
                    setCheckingStatus(false);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error("Error checking status:", error);
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

            // Mark this round as submitted locally
            localStorage.setItem("lastSubmittedRound", roundId.toString());

            setStatus("submitted");
            toast.success("Track submitted successfully!");
            setForm({ songName: "", artistName: "", link: "" });
        } catch (error) {
            console.error("Error submitting:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#121212] text-[#e3e3e3]">
                <div animate-pulse className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-[#e3e3e3]/10 border-t-[#d0bcff] animate-spin" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-[#121212] text-[#e3e3e3] font-sans selection:bg-[#d0bcff]/30 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#d0bcff]/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#381E72]/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

            <div className="w-full max-w-md relative z-10">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#332D41] text-[#E8DEF8] text-sm font-medium mb-6 border border-[#4A4458]">
                        <span className="relative flex h-2 w-2">
                            <span className={`${status === 'idle' ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-[#D0BCFF] opacity-75`}></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D0BCFF]"></span>
                        </span>
                        {status === "event_offline" ? "Event Offline" : `Round ${roundId} Live`}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-[#E6E1E5] mb-2 font-[Google Sans,Roboto,sans-serif]">
                        {greeting}, <br /><span className="text-[#D0BCFF] font-medium">Music Lover.</span>
                    </h1>
                    <p className="text-[#CAC4D0] text-lg font-light leading-relaxed">
                        Share your best track with the stream.
                    </p>
                </motion.div>

                {/* Main Content Area */}
                <div className="relative">
                    <AnimatePresence mode="wait">

                        {/* STATE: Event Offline */}
                        {status === "event_offline" && (
                            <motion.div
                                key="offline"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="bg-[#1C1B1F] p-8 rounded-[28px] border border-[#49454F] text-center shadow-xl"
                            >
                                <div className="w-20 h-20 bg-[#4F378B]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#D0BCFF]">
                                    <WifiOff size={32} />
                                </div>
                                <h2 className="text-2xl font-normal text-[#E6E1E5] mb-3">Submissions Closed</h2>
                                <p className="text-[#CAC4D0] mb-8 leading-relaxed">
                                    The event hasn't started yet or has already ended. <br />Sit tight and enjoy the music!
                                </p>
                            </motion.div>
                        )}

                        {/* STATE: Round Locked */}
                        {status === "round_locked" && (
                            <motion.div
                                key="locked"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="bg-[#1C1B1F] p-8 rounded-[28px] border border-[#49454F] text-center shadow-xl"
                            >
                                <div className="w-20 h-20 bg-[#F2B8B5]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#F2B8B5]">
                                    <Lock size={32} />
                                </div>
                                <h2 className="text-2xl font-normal text-[#E6E1E5] mb-3">Round {roundId} Locked</h2>
                                <p className="text-[#CAC4D0] mb-8 leading-relaxed">
                                    The host is currently reviewing submissions. <br />
                                    Next round will begin shortly.
                                </p>
                                <div className="h-1 w-32 bg-[#49454F] rounded-full mx-auto overflow-hidden">
                                    <div className="h-full bg-[#F2B8B5] w-2/3 animate-[shimmer_2s_infinite]" />
                                </div>
                            </motion.div>
                        )}

                        {/* STATE: Already Submitted */}
                        {status === "submitted" && (
                            <motion.div
                                key="submitted"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="bg-[#1C1B1F] p-8 rounded-[28px] border border-[#49454F] text-center shadow-xl"
                            >
                                <div className="w-20 h-20 bg-[#D0BCFF]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#D0BCFF]">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h2 className="text-2xl font-normal text-[#E6E1E5] mb-3">Track Received</h2>
                                <p className="text-[#CAC4D0] mb-8 leading-relaxed">
                                    Your submission for <b>Round {roundId}</b> is in. <br />
                                    Wait for the next round to submit again.
                                </p>
                                <button
                                    disabled
                                    className="w-full py-4 rounded-full bg-[#49454F]/50 text-[#CAC4D0] font-medium tracking-wide cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Reviewing Submissions...
                                </button>
                            </motion.div>
                        )}

                        {/* STATE: Form (Idle) */}
                        {status === "idle" && (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="bg-[#1C1B1F] p-6 sm:p-8 rounded-[32px] shadow-2xl shadow-black/50 border border-[#49454F]"
                            >
                                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                                    {/* Song Name Input */}
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            name="songName"
                                            required
                                            value={form.songName}
                                            onChange={handleChange}
                                            className="peer w-full bg-[#1C1B1F] text-[#E6E1E5] h-14 px-4 rounded-t-lg border-b border-[#938F99] focus:border-[#D0BCFF] focus:border-b-2 outline-none placeholder-transparent transition-all"
                                            placeholder="Song Name"
                                        />
                                        <label className="absolute left-4 top-4 text-[#CAC4D0] text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#D0BCFF] pointer-events-none">
                                            Song Title
                                        </label>
                                        <div className="absolute top-0 left-0 w-full h-full bg-[#D0BCFF]/5 scale-y-0 peer-focus:scale-y-100 origin-bottom transition-transform duration-300 pointer-events-none rounded-t-lg" />
                                    </div>

                                    {/* Artist Name Input */}
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            name="artistName"
                                            required
                                            value={form.artistName}
                                            onChange={handleChange}
                                            className="peer w-full bg-[#1C1B1F] text-[#E6E1E5] h-14 px-4 rounded-t-lg border-b border-[#938F99] focus:border-[#D0BCFF] focus:border-b-2 outline-none placeholder-transparent transition-all"
                                            placeholder="Artist Name"
                                        />
                                        <label className="absolute left-4 top-4 text-[#CAC4D0] text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#D0BCFF] pointer-events-none">
                                            Artist Name
                                        </label>
                                        <div className="absolute top-0 left-0 w-full h-full bg-[#D0BCFF]/5 scale-y-0 peer-focus:scale-y-100 origin-bottom transition-transform duration-300 pointer-events-none rounded-t-lg" />
                                    </div>

                                    {/* Link Input */}
                                    <div className="relative group">
                                        <input
                                            type="url"
                                            name="link"
                                            required
                                            value={form.link}
                                            onChange={handleChange}
                                            className="peer w-full bg-[#1C1B1F] text-[#E6E1E5] h-14 px-4 rounded-t-lg border-b border-[#938F99] focus:border-[#D0BCFF] focus:border-b-2 outline-none placeholder-transparent transition-all"
                                            placeholder="https://..."
                                        />
                                        <label className="absolute left-4 top-4 text-[#CAC4D0] text-base transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#D0BCFF] pointer-events-none">
                                            Link (SoundCloud, YouTube...)
                                        </label>
                                        <div className="absolute top-0 left-0 w-full h-full bg-[#D0BCFF]/5 scale-y-0 peer-focus:scale-y-100 origin-bottom transition-transform duration-300 pointer-events-none rounded-t-lg" />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="mt-4 w-full h-14 rounded-full bg-[#D0BCFF] text-[#381E72] font-medium text-lg tracking-wide hover:shadow-[0_4px_10px_rgba(208,188,255,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full" />
                                        {loading ? (
                                            <div className="w-6 h-6 border-2 border-[#381E72] border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Submit Track <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-[#938F99] text-sm font-medium">
                Powered by <span className="text-[#E6E1E5]">Kyebapp</span>
            </div>
        </div>
    );
}

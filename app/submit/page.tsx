"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import { Music, User, Link as LinkIcon, Send, Loader2, CheckCircle2 } from "lucide-react";

// Types
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
    const [submitted, setSubmitted] = useState(false);
    const [canSubmit, setCanSubmit] = useState(true);
    const [roundId, setRoundId] = useState<number>(1);
    const [checkingStatus, setCheckingStatus] = useState(true);

    // Check round status and user eligibility
    useEffect(() => {
        const checkStatus = async () => {
            try {
                // Listen to round settings
                const settingsRef = doc(db, "settings", "submission");
                const unsubscribe = onSnapshot(settingsRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        const currentRound = data.currentRoundId || 1;
                        setRoundId(currentRound);

                        // Check local storage for this round
                        const lastSubmittedRound = localStorage.getItem("lastSubmittedRound");
                        if (lastSubmittedRound && parseInt(lastSubmittedRound) === currentRound) {
                            setCanSubmit(false);
                            setSubmitted(true);
                        } else {
                            // If it's a new round, allow submission again (unless they just submitted in this session)
                            setCanSubmit(true);
                            setSubmitted(false);
                        }
                    } else {
                        // Initialize settings if not exists
                        setDoc(settingsRef, { currentRoundId: 1 }, { merge: true });
                        setRoundId(1);
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

        if (!form.songName || !form.artistName || !form.link) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            // Add submission to Firestore
            await addDoc(collection(db, "submissions"), {
                ...form,
                roundId: roundId,
                submittedAt: serverTimestamp(),
                status: "pending"
            });

            // Mark as submitted locally
            localStorage.setItem("lastSubmittedRound", roundId.toString());

            setSubmitted(true);
            setCanSubmit(false);
            toast.success("Song submitted successfully!");
            setForm({ songName: "", artistName: "", link: "" });
        } catch (error) {
            console.error("Error submitting:", error);
            toast.error("Failed to submit. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg z-10"
            >
                <div className="mb-8 text-center space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white/60">
                        Submit Your Track
                    </h1>
                    <p className="text-white/50 text-lg">
                        Round {roundId} is open for submissions
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Glass Shine */}
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    {!canSubmit ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring" }}
                                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6"
                            >
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </motion.div>
                            <h2 className="text-2xl font-semibold mb-2">Submission Received!</h2>
                            <p className="text-white/60 max-w-xs mx-auto">
                                You have already submitted a song for this round. Wait for the next round to submit again.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 ml-1">Song Title</label>
                                <div className="relative group">
                                    <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="text"
                                        name="songName"
                                        value={form.songName}
                                        onChange={handleChange}
                                        placeholder="Awesome Track"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 ml-1">Artist Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="text"
                                        name="artistName"
                                        value={form.artistName}
                                        onChange={handleChange}
                                        placeholder="Your Stage Name"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70 ml-1">Track Link</label>
                                <div className="relative group">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                                    <input
                                        type="url"
                                        name="link"
                                        value={form.link}
                                        onChange={handleChange}
                                        placeholder="https://soundcloud.com/..."
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-black font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Submit Track <Send className="w-5 h-5" />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    )}
                </div>

                <p className="text-center text-white/20 text-sm mt-8">
                    KyeBeezy Listening Party • Round {roundId}
                </p>
            </motion.div>
        </div>
    );
}

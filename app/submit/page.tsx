"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Music2, Link as LinkIcon, User, CheckCircle2, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDoc, doc } from "firebase/firestore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- Types ---
interface SubmissionForm {
    songName: string;
    artistName: string;
    link: string;
}

export default function SubmitPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
    const [checkingRound, setCheckingRound] = useState(true);

    const { register, handleSubmit, formState: { errors } } = useForm<SubmissionForm>();

    // Use a hardcoded "default" round if none exists in DB yet, to prevent total blocking
    // In production, we'd want to explicitly create this config doc.
    useEffect(() => {
        const fetchRound = async () => {
            try {
                const configRef = doc(db, "config", "general");
                const configSnap = await getDoc(configRef);

                let roundId = "round_1"; // Default
                if (configSnap.exists()) {
                    roundId = configSnap.data().currentRoundId || "round_1";
                }

                setCurrentRoundId(roundId);

                // Check local storage for this round
                const lastSubmission = localStorage.getItem("last_submission_round");
                if (lastSubmission === roundId) {
                    setIsSubmitted(true);
                }
            } catch (error) {
                console.error("Error fetching round:", error);
                // Fail safe to allow submission or show error? 
                // Let's allow but maybe log it.
            } finally {
                setCheckingRound(false);
            }
        };

        fetchRound();
    }, []);

    const onSubmit = async (data: SubmissionForm) => {
        if (!currentRoundId) return;
        setIsLoading(true);

        try {
            await addDoc(collection(db, "submissions"), {
                ...data,
                roundId: currentRoundId,
                createdAt: serverTimestamp(),
                // We could add client IP or something here if we had backend access, 
                // but for client-side only, localStorage is the best simple deterrent.
            });

            // Mark as submitted locally
            localStorage.setItem("last_submission_round", currentRoundId);

            setIsSubmitted(true);
            toast.success("Song submitted successfully!", {
                description: "Good luck with the review!",
            });
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to submit", {
                description: "Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (checkingRound) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-background text-foreground flex flex-col items-center justify-center p-4">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="mb-8 text-center space-y-2">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent font-outfit">
                            Submit Your Heat
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Drop your track for the next listening session.
                        </p>
                    </motion.div>
                </div>

                <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 md:p-8 rounded-3xl shadow-xl">
                    <AnimatePresence mode="wait">
                        {isSubmitted ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center text-center space-y-6 py-8"
                            >
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-semibold text-foreground">Submission Received!</h2>
                                    <p className="text-muted-foreground">
                                        You're locked in for this round. Stay tuned to the stream to see if your track gets played!
                                    </p>
                                </div>
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-600 dark:text-yellow-200 text-sm flex items-start gap-3 text-left">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>You can only submit once per round. Wait for the admin to start a new round to submit again.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="artistName" className="text-muted-foreground">Artist Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                {...register("artistName", { required: "Artist name is required" })}
                                                className="pl-10 bg-background/50 border-input focus:border-primary/50 h-11 transition-all"
                                                placeholder="e.g. Kye Beezy"
                                            />
                                        </div>
                                        {errors.artistName && <span className="text-destructive text-xs ml-1">{errors.artistName.message}</span>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="songName" className="text-muted-foreground">Song Title</Label>
                                        <div className="relative">
                                            <Music2 className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                {...register("songName", { required: "Song title is required" })}
                                                className="pl-10 bg-background/50 border-input focus:border-primary/50 h-11 transition-all"
                                                placeholder="e.g. Midnight Drives"
                                            />
                                        </div>
                                        {errors.songName && <span className="text-destructive text-xs ml-1">{errors.songName.message}</span>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="link" className="text-muted-foreground">Streaming Link</Label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                {...register("link", {
                                                    required: "Link is required",
                                                    pattern: {
                                                        value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                                                        message: "Please enter a valid URL"
                                                    }
                                                })}
                                                className="pl-10 bg-background/50 border-input focus:border-primary/50 h-11 transition-all"
                                                placeholder="SoundCloud, Spotify, YouTube..."
                                            />
                                        </div>
                                        {errors.link && <span className="text-destructive text-xs ml-1">{errors.link.message}</span>}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transition-all rounded-xl shadow-lg shadow-purple-500/20"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Song"
                                    )}
                                </Button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>

                <p className="mt-8 text-center text-muted-foreground text-sm">
                    Powered by Kye Beezy
                </p>
            </div>
        </div>
    );
}

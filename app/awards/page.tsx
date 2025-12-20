"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Share2, ExternalLink, Star, Crown, Loader2, RefreshCw, ArrowLeft, Lock, MonitorPlay } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";
import { toast } from "sonner";
import Link from "next/link";
import { getAwardsData } from "./data-fetcher";
import { db } from "@/lib/firebase"; // Import db
import { doc, onSnapshot } from "firebase/firestore"; // Import Firestore functions

// --- Configuration ---
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfYw_lYGgNBndvw6TlCYqm6JCcd0QUtON501jjLqOx10Pu_wQ/viewform";

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

export default function AwardsPage() {
    const [revealWinners, setRevealWinners] = useState(false);
    const [canReveal, setCanReveal] = useState(false); // New State
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getAwardsData();
            setCategories(data);
        } catch (e) {
            toast.error("Failed to load awards data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Listen for Admin Settings
        const unsub = onSnapshot(doc(db, "settings", "config"), (docSnap) => {
            if (docSnap.exists()) {
                setCanReveal(docSnap.data()?.showAwardsWinners || false);
                // If permission revoked while revealed, hide it
                if (!docSnap.data()?.showAwardsWinners) {
                    setRevealWinners(false);
                }
            }
        });

        return () => unsub();
    }, []);

    const copyInvite = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success("Invite link copied to clipboard! 🎫");
    };

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-yellow-500/30 font-sans overflow-x-hidden transition-colors duration-300">
            <Confetti isActive={revealWinners} />

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-50">
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-white/50 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
            </div>

            {/* --- Hero Section --- */}
            <div className="relative min-h-[80vh] flex flex-col items-center justify-center p-6 text-center border-b border-border">

                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/10 dark:bg-yellow-600/20 blur-[120px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 flex flex-col items-center gap-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-sm font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
                        <Star className="w-4 h-4 fill-yellow-600 dark:fill-yellow-500" /> The Annual Event
                    </div>

                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 via-yellow-600 to-yellow-900 dark:from-yellow-200 dark:via-yellow-500 dark:to-yellow-800 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                        KYE BEEZY<br />AWARDS
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-light">
                        Celebrating the best moments, beats, and community legends of the year.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 mt-8">
                        <Link
                            href={GOOGLE_FORM_URL}
                            target="_blank"
                            className="group relative px-8 py-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full font-bold text-black text-lg shadow-[0_0_30px_rgba(234,179,8,0.4)] hover:shadow-[0_0_50px_rgba(234,179,8,0.6)] hover:scale-105 transition-all flex items-center gap-3"
                        >
                            VOTE NOW <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <button
                            onClick={copyInvite}
                            className="px-8 py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full font-bold text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center gap-3"
                        >
                            <Share2 className="w-5 h-5" /> Share Invite
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* --- Nominees & Winners -- */}
            <div className="container mx-auto px-6 py-24 min-h-[600px]">
                <div className="flex items-center justify-between mb-16 wrap flex-wrap gap-4">
                    <h2 className="text-4xl md:text-5xl font-bold font-outfit text-foreground">
                        Nominees <span className="text-yellow-500">&</span> Categories
                    </h2>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/awards/live"
                            target="_blank"
                            className="p-3 rounded-lg border border-border hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                            title="Live Presentation Mode"
                        >
                            <MonitorPlay className="w-5 h-5" />
                        </Link>

                        <button
                            onClick={fetchData}
                            className="p-3 rounded-lg border border-border hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
                            title="Refresh Data"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        {canReveal ? (
                            <button
                                onClick={() => setRevealWinners(!revealWinners)}
                                className={`text-xs uppercase tracking-widest font-bold px-4 py-3 rounded-lg border transition-all ${revealWinners ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-foreground'}`}
                            >
                                {revealWinners ? 'Hide Results' : 'Reveal Winners'}
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border bg-black/5 dark:bg-white/5 text-muted-foreground text-xs font-bold uppercase tracking-widest cursor-not-allowed" title="Results not yet available">
                                <Lock className="w-3 h-3" /> Results Locked
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((cat, index) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative group p-[1px] rounded-3xl bg-gradient-to-b from-black/5 to-transparent dark:from-white/10 dark:to-transparent hover:from-yellow-500/50 transition-all duration-500 h-full"
                            >
                                <div className="bg-white/90 dark:bg-black/90 backdrop-blur-xl p-8 rounded-[23px] h-full relative overflow-hidden flex flex-col border border-black/5 dark:border-transparent">
                                    <div className="flex items-start justify-between mb-6">
                                        <h3 className="text-2xl font-bold text-foreground group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors line-clamp-2">
                                            {cat.title}
                                        </h3>
                                        <Trophy className={`w-6 h-6 flex-shrink-0 ${revealWinners ? 'text-yellow-500' : 'text-black/10 dark:text-white/10'}`} />
                                    </div>

                                    {/* Nominees List */}
                                    <div className="space-y-4 mb-8 flex-1">
                                        {cat.nominees.length > 0 ? cat.nominees.map((nominee, i) => (
                                            <div key={i} className="flex items-center gap-4 text-muted-foreground group/nominee">
                                                {nominee.image ? (
                                                    <img src={nominee.image} alt={nominee.name} className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 object-cover group-hover/nominee:border-yellow-500/50 transition-colors" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                        {nominee.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="break-all font-medium text-sm text-foreground/80">{nominee.name}</span>
                                            </div>
                                        )) : (
                                            <p className="text-muted-foreground italic">No nominees yet</p>
                                        )}
                                    </div>

                                    {/* Winner Reveal Overlay */}
                                    <div className="absolute inset-0 bg-white/95 dark:bg-black/95 flex flex-col items-center justify-center text-center p-6 transition-opacity duration-700 z-20"
                                        style={{
                                            opacity: revealWinners ? 1 : 0,
                                            pointerEvents: revealWinners ? 'auto' : 'none',
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />

                                        {cat.winner?.image && (
                                            <img src={cat.winner.image} alt="Winner" className="w-24 h-24 rounded-full border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.5)] mb-6 object-cover" />
                                        )}

                                        <Crown className="w-12 h-12 text-yellow-500 mb-4 animate-bounce" />
                                        <p className="text-yellow-600 dark:text-yellow-500 text-sm font-bold uppercase tracking-widest mb-2">The Winner Is</p>
                                        <p className="text-3xl font-black text-foreground break-words max-w-full">{cat.winner?.name}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="py-12 border-t border-border text-center">
                <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Kye Beezy Awards. All rights reserved.</p>
            </footer>
        </main>
    );
}

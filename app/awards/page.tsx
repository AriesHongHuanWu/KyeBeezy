"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Share2, ExternalLink, Star, Crown, ChevronDown } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";
import { toast } from "sonner";
import Link from "next/link";

// --- Configuration ---
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfYw_lYGgNBndvw6TlCYqm6JCcd0QUtON501jjLqOx10Pu_wQ/viewform";

// Fake Data - Replace with real nominees later
const CATEGORIES = [
    {
        id: "best-clip",
        title: "🔥 Best Clip of the Year",
        nominees: ["Jump Scare 3000", "The Impossible Clutch", "Controller Disconnect", "Singing in the Rain"],
        winner: "The Impossible Clutch"
    },
    {
        id: "funniest",
        title: "🤣 Funniest Moment",
        nominees: ["Mic Drop Fail", "Donation TTS Prank", "Uber Eats Mishap", "Wrong Chat Message"],
        winner: "Mic Drop Fail"
    },
    {
        id: "best-beat",
        title: "🎵 Best Beat Produced",
        nominees: ["Midnight Vibes", "Trap Soul 4", "Cyber Chase", "Lofi Sunday"],
        winner: "Midnight Vibes"
    },
    {
        id: "community-mvp",
        title: "👑 Community MVP",
        nominees: ["ModBot3000", "SuperFan_99", "DailyViewer", "GiftSubKing"],
        winner: "ModBot3000"
    }
];

export default function AwardsPage() {
    const [revealWinners, setRevealWinners] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const copyInvite = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        toast.success("Invite link copied to clipboard! 🎫");
    };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-yellow-500/30 font-sans overflow-x-hidden">
            <Confetti isActive={revealWinners} />

            {/* --- Hero Section --- */}
            <div className="relative min-h-[80vh] flex flex-col items-center justify-center p-6 text-center border-b border-white/10">

                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-600/20 blur-[120px] rounded-full pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 flex flex-col items-center gap-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-sm font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
                        <Star className="w-4 h-4 fill-yellow-500" /> The Annual Event
                    </div>

                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-800 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                        KYE BEEZY<br />AWARDS
                    </h1>

                    <p className="text-xl md:text-2xl text-white/60 max-w-2xl font-light">
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
                            className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-white hover:bg-white/10 transition-all flex items-center gap-3"
                        >
                            <Share2 className="w-5 h-5" /> Share Invite
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* --- Nominees & Winners -- */}
            <div className="container mx-auto px-6 py-24">
                <div className="flex items-center justify-between mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold font-outfit text-white">
                        Nominees <span className="text-yellow-500">&</span> Categories
                    </h2>

                    {/* Secret Admin Button to Toggle Winners (for demo purposes, usually hidden behind auth) */}
                    <button
                        onClick={() => setRevealWinners(!revealWinners)}
                        className={`text-xs uppercase tracking-widest font-bold px-4 py-2 rounded-lg border transition-all ${revealWinners ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-transparent text-white/20 border-white/10 hover:text-white hover:border-white'}`}
                    >
                        {revealWinners ? 'Hide Results' : 'Reveal Winners'}
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {CATEGORIES.map((cat, index) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative group p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent hover:from-yellow-500/50 transition-all duration-500"
                        >
                            <div className="bg-black/90 backdrop-blur-xl p-8 rounded-[23px] h-full relative overflow-hidden">
                                <div className="flex items-start justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                                        {cat.title}
                                    </h3>
                                    <Trophy className={`w-6 h-6 ${revealWinners ? 'text-yellow-500' : 'text-white/10'}`} />
                                </div>

                                {/* Nominees List */}
                                <div className="space-y-3 mb-8">
                                    {cat.nominees.map((nominee) => (
                                        <div key={nominee} className="flex items-center gap-3 text-white/60">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                            {nominee}
                                        </div>
                                    ))}
                                </div>

                                {/* Winner Reveal Overlay */}
                                <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-center p-6 transition-opacity duration-700"
                                    style={{
                                        opacity: revealWinners ? 1 : 0,
                                        pointerEvents: revealWinners ? 'auto' : 'none',
                                    }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent" />
                                    <Crown className="w-12 h-12 text-yellow-400 mb-4 animate-bounce" />
                                    <p className="text-yellow-500 text-sm font-bold uppercase tracking-widest mb-2">The Winner Is</p>
                                    <p className="text-3xl font-black text-white">{cat.winner}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 text-center">
                <p className="text-white/40 text-sm">© {new Date().getFullYear()} Kye Beezy Awards. All rights reserved.</p>
            </footer>
        </main>
    );
}

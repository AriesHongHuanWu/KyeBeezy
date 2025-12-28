"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Calendar, Trophy, Star, Clock, Music, GraduationCap } from "lucide-react";

export default function EventsHubPage() {
    return (
        <main className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500/30 overflow-hidden relative">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-900/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-50">
                <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors px-4 py-2 hover:bg-white/5 rounded-full">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </Link>
            </div>

            <div className="container mx-auto px-6 py-20 relative z-10 min-h-screen flex flex-col">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-20"
                >
                    <h2 className="text-yellow-500 font-bold tracking-[0.3em] uppercase mb-4 text-sm md:text-base">Event Hall</h2>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 drop-shadow-xl">
                        KYE BEEZY<br />EVENTS
                    </h1>
                    <p className="text-white/40 mt-6 max-w-2xl mx-auto text-lg font-light">
                        Explore current and past community events, awards, and tournaments.
                    </p>
                </motion.div>

                {/* Events Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">

                    {/* --- Active Event: BandLab Awards --- */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Link href="/events/bandlab2025" className="group block relative h-full">
                            <div className="absolute inset-0 bg-yellow-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />

                            <div className="relative h-full bg-neutral-900/50 border border-white/10 rounded-3xl overflow-hidden hover:border-yellow-500/50 transition-all duration-500 group-hover:transform group-hover:-translate-y-2 group-hover:shadow-2xl">
                                {/* Banner Image Placeholder */}
                                <div className="h-48 bg-gradient-to-br from-yellow-900/40 to-black relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                                    <Trophy className="absolute bottom-4 right-4 w-24 h-24 text-yellow-500/10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500 text-black text-xs font-black uppercase tracking-wider rounded-full">
                                        Live Now
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">BandLab Awards</h3>
                                    <p className="text-white/50 mb-6 text-sm leading-relaxed">
                                        The biggest community celebration of the year. Vote for your favorite artists and witness the live ceremony.
                                    </p>

                                    <div className="flex items-center gap-4 text-xs font-mono text-white/30 uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" /> 2025
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Music className="w-3 h-3" /> Music
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Arrow */}
                                <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:border-yellow-500 group-hover:text-black transition-all">
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* --- New: BandLab University --- */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        <Link href="/university" className="group block relative h-full">
                            <div className="absolute inset-0 bg-blue-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl" />

                            <div className="relative h-full bg-neutral-900/50 border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 group-hover:transform group-hover:-translate-y-2 group-hover:shadow-2xl">
                                {/* Banner Image Placeholder */}
                                <div className="h-48 bg-gradient-to-br from-blue-900/40 to-black relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
                                    <GraduationCap className="absolute bottom-4 right-4 w-24 h-24 text-blue-500/10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-full">
                                        Open Admission
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">BandLab University</h3>
                                    <p className="text-white/50 mb-6 text-sm leading-relaxed">
                                        Learn, Grow, and Collaborate. The official educational hub for BandLab creators and future stars.
                                    </p>

                                    <div className="flex items-center gap-4 text-xs font-mono text-white/30 uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" /> Forever
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="w-3 h-3" /> Education
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Arrow */}
                                <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:text-white transition-all">
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* --- Past Event (Placeholder) --- */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-not-allowed hidden md:block"
                    >
                        <div className="relative h-full bg-neutral-900/30 border border-white/5 rounded-3xl overflow-hidden">
                            <div className="h-48 bg-gradient-to-br from-purple-900/20 to-black relative">
                                <Clock className="absolute bottom-4 right-4 w-24 h-24 text-white/5 rotate-12" />
                                <div className="absolute top-4 left-4 px-3 py-1 bg-white/10 text-white/50 text-xs font-black uppercase tracking-wider rounded-full">
                                    Archived
                                </div>
                            </div>

                            <div className="p-8">
                                <h3 className="text-3xl font-bold text-white/70 mb-2">2024 Highlights</h3>
                                <p className="text-white/30 mb-6 text-sm leading-relaxed">
                                    A look back at the legendary moments from last year's streams and community events.
                                </p>

                                <div className="flex items-center gap-4 text-xs font-mono text-white/20 uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> 2024
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </main>
    );
}

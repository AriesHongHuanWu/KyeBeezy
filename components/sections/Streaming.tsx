"use client";

import { motion } from "framer-motion";
import { Youtube, Twitch, ExternalLink, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function StreamingSection() {
    const [hovered, setHovered] = useState<string | null>(null);

    return (
        <section id="stream" className="min-h-screen py-20 relative flex items-center">
            {/* Transparent Background */}
            <div className="container mx-auto px-6 z-10">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Twitch Column - Glass Card */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        onMouseEnter={() => setHovered('twitch')}
                        onMouseLeave={() => setHovered(null)}
                        className="flex flex-col gap-6 p-6 md:p-8 rounded-3xl bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 shadow-xl group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-600 rounded-xl shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform duration-300">
                                    <Twitch className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-foreground font-outfit tracking-tight">Twitch</h2>
                            </div>
                            <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider rounded-full animate-pulse">
                                Live
                            </div>
                        </div>

                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50 group-hover:shadow-purple-500/40 transition-all duration-300 transform group-hover:scale-[1.01]">
                            <iframe
                                src="https://player.twitch.tv/?channel=realkyebeezylive&parent=localhost&parent=kyeweb.pages.dev&parent=kyebeezy.pages.dev&parent=kyebeezy.com&muted=false"
                                className="absolute inset-0 w-full h-full"
                                allowFullScreen
                            ></iframe>
                            {/* Overlay frame for "premium" look */}
                            <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-2xl" />
                        </div>

                        <Link href="https://www.twitch.tv/realkyebeezylive" target="_blank" className="relative overflow-hidden group/btn w-full p-5 rounded-xl bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 hover:border-purple-500/50 transition-all flex items-center justify-between">
                            <div className="relative z-10">
                                <h3 className="text-foreground font-bold text-lg font-outfit group-hover/btn:text-purple-400 transition-colors">Follow on Twitch</h3>
                                <p className="text-muted-foreground text-sm">Join the live community</p>
                            </div>
                            <ExternalLink className="text-purple-400 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                            {/* Btn hover effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-purple-600/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 sm:duration-1000" />
                        </Link>
                    </motion.div>

                    {/* YouTube Column - Glass Card */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        onMouseEnter={() => setHovered('youtube')}
                        onMouseLeave={() => setHovered(null)}
                        className="flex flex-col gap-6 p-6 md:p-8 rounded-3xl bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 hover:border-red-500/50 transition-all duration-300 shadow-xl group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-600 rounded-xl shadow-lg shadow-red-600/30 group-hover:scale-110 transition-transform duration-300">
                                    <Youtube className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-foreground font-outfit tracking-tight">YouTube</h2>
                            </div>
                            <div className="px-3 py-1 bg-white/10 border border-white/20 text-foreground text-xs font-bold uppercase tracking-wider rounded-full">
                                Latest Release
                            </div>
                        </div>

                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50 group-hover:shadow-red-500/40 transition-all duration-300 transform group-hover:scale-[1.01]">
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src="https://www.youtube.com/embed/7UN_eYHLssE"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                            {/* Overlay frame for "premium" look */}
                            <div className="absolute inset-0 border border-white/5 pointer-events-none rounded-2xl" />
                        </div>

                        <Link href="https://www.youtube.com/@kyebeezy" target="_blank" className="relative overflow-hidden group/btn w-full p-5 rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 hover:border-red-500/50 transition-all flex items-center justify-between">
                            <div className="relative z-10">
                                <h3 className="text-foreground font-bold text-lg font-outfit group-hover/btn:text-red-400 transition-colors">Subscribe on YouTube</h3>
                                <p className="text-muted-foreground text-sm">Watch highlights & clips</p>
                            </div>
                            <ExternalLink className="text-red-400 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
                            {/* Btn hover effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 sm:duration-1000" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

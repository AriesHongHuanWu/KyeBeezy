"use client";

import { motion } from "framer-motion";
import { Youtube, Twitch, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function StreamingSection() {
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
                        className="flex flex-col gap-6 p-6 md:p-8 rounded-3xl bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-colors shadow-2xl"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-purple-600 rounded-xl shadow-lg shadow-purple-600/20">
                                <Twitch className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-outfit">Twitch</h2>
                        </div>

                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50 group-hover:shadow-purple-500/20 transition-shadow">
                            <iframe
                                src="https://player.twitch.tv/?channel=realkyebeezylive&parent=localhost&parent=kyeweb.pages.dev&parent=kyebeezy.pages.dev&parent=kyebeezy.com&muted=false"
                                className="absolute inset-0 w-full h-full"
                                allowFullScreen
                            ></iframe>
                        </div>

                        <Link href="https://www.twitch.tv/realkyebeezylive" target="_blank" className="group w-full p-4 rounded-xl bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 hover:border-purple-500/50 transition-all flex items-center justify-between">
                            <div>
                                <h3 className="text-foreground font-bold text-lg font-outfit">Follow on Twitch</h3>
                                <p className="text-purple-400/80 text-sm">Join the live community</p>
                            </div>
                            <ExternalLink className="text-purple-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* YouTube Column - Glass Card */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col gap-6 p-6 md:p-8 rounded-3xl bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 hover:border-red-500/30 transition-colors shadow-2xl"
                    >
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-red-600 rounded-xl shadow-lg shadow-red-600/20">
                                <Youtube className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground font-outfit">YouTube</h2>
                        </div>

                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/50 group-hover:shadow-red-500/20 transition-shadow">
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src="https://www.youtube.com/embed/7UN_eYHLssE"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>

                        <Link href="https://www.youtube.com/@kyebeezy" target="_blank" className="group w-full p-4 rounded-xl bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 hover:border-red-500/50 transition-all flex items-center justify-between">
                            <div>
                                <h3 className="text-foreground font-bold text-lg font-outfit">Subscribe on YouTube</h3>
                                <p className="text-red-400/80 text-sm">Watch highlights & clips</p>
                            </div>
                            <ExternalLink className="text-red-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

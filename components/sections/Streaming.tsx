"use client";

import { motion } from "framer-motion";
import { Youtube, Twitch, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function StreamingSection() {
    return (
        <section id="stream" className="min-h-screen py-20 relative">
            <div className="container mx-auto px-6 z-10">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Twitch Column */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-600 rounded-lg">
                                <Twitch className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-4xl font-bold text-white">Twitch</h2>
                        </div>

                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-purple-500/20 shadow-2xl shadow-purple-900/20 bg-black">
                            {/* Embed Twitch Player or Placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-gray-500">
                                <Twitch className="w-20 h-20 opacity-20" />
                                <p>Current Stream Status: Offline</p>
                            </div>
                        </div>

                        <Link href="https://www.twitch.tv/realkyebeezylive" target="_blank" className="group w-full p-6 rounded-2xl bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 hover:border-purple-500/50 transition-all flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold text-xl">Follow on Twitch</h3>
                                <p className="text-purple-300">Join the live community</p>
                            </div>
                            <ExternalLink className="text-purple-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* YouTube Column */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-600 rounded-lg">
                                <Youtube className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-4xl font-bold text-white">YouTube</h2>
                        </div>

                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-red-500/20 shadow-2xl shadow-red-900/20 bg-black">
                            {/* Embed YouTube or Placeholder */}
                            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-gray-500">
                                <Youtube className="w-20 h-20 opacity-20" />
                                <p>Latest Video Placeholder</p>
                            </div>
                        </div>

                        <Link href="https://www.youtube.com/@kyebeezy" target="_blank" className="group w-full p-6 rounded-2xl bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 hover:border-red-500/50 transition-all flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold text-xl">Subscribe on YouTube</h3>
                                <p className="text-red-300">Watch highlights & clips</p>
                            </div>
                            <ExternalLink className="text-red-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

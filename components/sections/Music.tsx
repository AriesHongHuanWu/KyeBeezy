"use client";

import { motion } from "framer-motion";
import { Music, Play } from "lucide-react";
import Link from "next/link";

export default function MusicSection() {
    const tracks = [
        { title: "Latest Drop", genre: "Hip Hop", url: "https://www.bandlab.com/kyebeezy" },
        { title: "Chill Vibes", genre: "Lo-Fi", url: "https://www.bandlab.com/kyebeezy" },
        { title: "Night Drive", genre: "Synthwave", url: "https://www.bandlab.com/kyebeezy" },
    ];

    return (
        <section id="music" className="min-h-screen flex items-center justify-center relative py-20 bg-gradient-to-b from-black/0 to-purple-900/10">
            <div className="container mx-auto px-6 z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl font-bold text-white mb-4">Beats & Music</h2>
                    <p className="text-xl text-gray-400">Crafting sounds on BandLab</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {tracks.map((track, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            viewport={{ once: true }}
                        >
                            <Link href={track.url} target="_blank" className="block group">
                                <div className="relative aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-white/10 group-hover:border-purple-500/50 transition-colors">
                                    <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                        <Music className="w-16 h-16 text-zinc-700 group-hover:text-purple-500 transition-colors" />
                                    </div>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <Play className="w-12 h-12 text-white fill-white" />
                                    </div>
                                </div>
                                <div className="mt-4 text-left p-2">
                                    <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{track.title}</h3>
                                    <p className="text-sm text-gray-500">{track.genre}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link href="https://www.bandlab.com/kyebeezy" target="_blank" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-purple-400 hover:text-white transition-all transform hover:scale-105">
                        Listen on BandLab <Music className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}

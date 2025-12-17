"use client";

import { motion } from "framer-motion";
import { Music, Play } from "lucide-react";
import Link from "next/link";

export default function MusicSection() {
    const tracks = [
        {
            id: "7d44e991-08cf-f011-8196-000d3a96100f",
            title: "Latest Heat",
            genre: "Hip Hop • Trap",
            gradient: "from-purple-800 to-blue-900",
            border: "hover:border-purple-500/50",
            shadow: "hover:shadow-purple-900/20"
        },
        {
            id: "2f1287da-399e-f011-8e64-6045bd354e91",
            title: "Night Vibes",
            genre: "Lo-Fi • Chill",
            gradient: "from-pink-800 to-red-900",
            border: "hover:border-pink-500/50",
            shadow: "hover:shadow-pink-900/20"
        },
        {
            id: "bcdc5788-3f63-f011-8dc9-000d3a960be3",
            title: "Studio Sessions",
            genre: "Experimental • Vibe",
            gradient: "from-blue-800 to-indigo-900",
            border: "hover:border-blue-500/50",
            shadow: "hover:shadow-blue-900/20"
        },
    ];

    return (
        <section id="music" className="min-h-screen flex items-center justify-center relative py-20 bg-background/50 backdrop-blur-sm">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-purple-900/5 to-transparent pointer-events-none" />

            <div className="container mx-auto px-6 z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl font-bold text-foreground mb-4">Beats & Music</h2>
                    <p className="text-xl text-muted-foreground">Crafting sounds on BandLab</p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                    {tracks.map((track, index) => (
                        <motion.div
                            key={track.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * (index + 1) }}
                            className="group"
                        >
                            <div className={`bg-card/50 backdrop-blur-md rounded-3xl p-4 border border-border transition-all hover:shadow-2xl ${track.border} ${track.shadow}`}>
                                <div className={`relative aspect-square rounded-2xl overflow-hidden mb-4 bg-gradient-to-br ${track.gradient}`}>
                                    <iframe
                                        src={`https://www.bandlab.com/embed/?id=${track.id}`}
                                        className="absolute inset-0 w-full h-full"
                                        frameBorder="0"
                                        allow="autoplay"
                                    ></iframe>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground font-outfit mb-1">{track.title}</h3>
                                        <p className="text-sm text-muted-foreground">{track.genre}</p>
                                    </div>
                                    <div className="p-2 bg-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                        <Play className="w-4 h-4 fill-white text-white" />
                                    </div>
                                </div>
                            </div>
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

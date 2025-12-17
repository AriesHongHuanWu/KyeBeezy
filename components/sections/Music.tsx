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

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Track 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="group"
                    >
                        <div className="bg-zinc-900/50 backdrop-blur-md rounded-3xl p-4 border border-white/10 hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-900/20">
                            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-800 to-blue-900">
                                {/* Bandlab Embed would go here, simulating with iframe or placeholder */}
                                <iframe
                                    src="https://www.bandlab.com/embed/?id=aa0e3a47-380d-ef11-96f5-000d3a425266"
                                    className="absolute inset-0 w-full h-full"
                                    frameBorder="0"
                                    allow="autoplay"
                                ></iframe>
                                {/* Fallback overlay if embed fails or for style */}
                                <div className="absolute inset-0 pointer-events-none bg-black/20 group-hover:bg-transparent transition-colors"></div>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white font-outfit mb-1">Latest Heat</h3>
                                    <p className="text-sm text-purple-300">Hip Hop • Trap</p>
                                </div>
                                <div className="p-2 bg-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    <Play className="w-4 h-4 fill-white text-white" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Track 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="group"
                    >
                        <div className="bg-zinc-900/50 backdrop-blur-md rounded-3xl p-4 border border-white/10 hover:border-pink-500/50 transition-all hover:shadow-2xl hover:shadow-pink-900/20">
                            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-pink-800 to-red-900">
                                <iframe
                                    src="https://www.bandlab.com/embed/?id=724e8150-128c-ee11-b75e-000d3a428b97"
                                    className="absolute inset-0 w-full h-full"
                                    frameBorder="0"
                                    allow="autoplay"
                                ></iframe>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white font-outfit mb-1">Night Vibes</h3>
                                <p className="text-sm text-pink-300">Lo-Fi • Chill</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Track 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="group"
                    >
                        <div className="bg-zinc-900/50 backdrop-blur-md rounded-3xl p-4 border border-white/10 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-900/20">
                            <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-blue-800 to-indigo-900">
                                <iframe
                                    src="https://www.bandlab.com/embed/?id=aa0e3a47-380d-ef11-96f5-000d3a425266" // Duplicating the first track's ID for consistency
                                    className="absolute inset-0 w-full h-full"
                                    frameBorder="0"
                                    allow="autoplay"
                                ></iframe>
                                {/* Overlay indicating more on profile since ID is mock */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                    <Link href="https://www.bandlab.com/kyebeezy" target="_blank" className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/50 text-white font-bold hover:bg-white hover:text-black transition-all">
                                        More on BandLab
                                    </Link>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white font-outfit mb-1">Studio Sessions</h3>
                                <p className="text-sm text-blue-300">Behind the Scenes</p>
                            </div>
                        </div>
                    </motion.div>
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

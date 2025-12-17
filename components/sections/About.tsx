"use client";

import { motion } from "framer-motion";

export default function AboutSection() {
    return (
        <section id="about" className="min-h-screen flex items-center justify-center relative py-20">
            <div className="container mx-auto px-6 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl max-w-4xl mx-auto"
                >
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Image Placeholder - User can replace src later */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-white/10">
                                {/* Replace with actual image */}
                                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-gray-500">
                                    <span className="text-4xl text-center p-4">Kye Beezy<br /><span className="text-sm">(Image Placeholder)</span></span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 text-white text-left">
                            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                                The Story
                            </h2>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                Passionate streamer, musician, and content creator. I bring the vibes to every stream and put my soul into every beat. From high-energy gaming sessions on Twitch to crafting unique soundscapes on BandLab, it's all about the community and the craft.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 flex-1">
                                    <div className="text-2xl font-bold text-purple-400">Streamer</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">Twitch Partner</div>
                                </div>
                                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 flex-1">
                                    <div className="text-2xl font-bold text-pink-400">Musician</div>
                                    <div className="text-xs text-gray-400 uppercase tracking-widest mt-1">BandLab Artist</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

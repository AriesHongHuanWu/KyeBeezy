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

                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-purple-500/20 shadow-2xl shadow-purple-900/20 bg-black group-hover:shadow-purple-500/30 transition-shadow">
                            <iframe
                                src="https://player.twitch.tv/?channel=realkyebeezylive&parent=localhost&parent=kyeweb.pages.dev&parent=kyebeezy.pages.dev&parent=kyebeezy.com&muted=false"
                                className="absolute inset-0 w-full h-full"
                                allowFullScreen
                            ></iframe>
                        </div>

                        <Link href="https://www.twitch.tv/realkyebeezylive" target="_blank" className="group w-full p-6 rounded-2xl bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 hover:border-purple-500/50 transition-all flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold text-xl font-outfit">Follow on Twitch</h3>
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
                            <div className="p-3 bg-red-600 rounded-lg shadow-lg shadow-red-900/50">
                                <Youtube className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-4xl font-bold text-white font-outfit">YouTube</h2>
                        </div>

                        <div className="relative aspect-video rounded-3xl overflow-hidden border border-red-500/20 shadow-2xl shadow-red-900/20 bg-black group-hover:shadow-red-500/30 transition-shadow">
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                // Using channel uploads list
                                src="https://www.youtube.com/embed/videoseries?list=UUc-P-q-q-q-q-q-q-q-q-q-q"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>

                        <Link href="https://www.youtube.com/@kyebeezy" target="_blank" className="group w-full p-6 rounded-2xl bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 hover:border-red-500/50 transition-all flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold text-xl font-outfit">Subscribe on YouTube</h3>
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

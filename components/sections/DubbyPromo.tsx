"use client";

import { motion } from "framer-motion";
import { Copy, ExternalLink, Gift, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function DubbyPromo() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("BONNET-ENERGY");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/10 to-background/0 z-0" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-4xl md:text-5xl font-black font-outfit mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
                        POWER UP WITH DUBBY
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Focus better, react faster. No crash, no jitters.
                    </p>

                    {/* Discount Code */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="mt-8 inline-flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl cursor-pointer group"
                        onClick={handleCopy}
                    >
                        <div className="text-left">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">Discount Code</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-mono font-bold text-yellow-400">BONNET-ENERGY</span>
                                <Copy className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                            </div>
                        </div>
                        <div className="pl-4 border-l border-white/10">
                            <span className="text-xl font-bold text-green-400">10% OFF</span>
                        </div>

                        {copied && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded"
                            >
                                COPIED!
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Chef's Choice (Surprise) */}
                    <Link href="https://www.dubby.gg/products/chefs-choice-energy-tub-we-surprise-you?ref=gvqslrbj" target="_blank">
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 rounded-3xl p-1 overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="bg-black/40 backdrop-blur-sm rounded-[22px] p-6 h-full flex flex-col items-center text-center relative z-10">
                                <div className="absolute top-4 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                                    MYSTERY FLAVOR
                                </div>

                                <div className="w-48 h-48 mb-6 relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/40 transition-all duration-500" />
                                    <Gift className="w-24 h-24 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform duration-300" />
                                </div>

                                <h3 className="text-2xl font-bold font-outfit mb-2 group-hover:text-purple-400 transition-colors">
                                    Chef's Choice Energy Tub
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    Can't decide? Let us surprise you! The staff picks a flavor they think you'll love.
                                </p>

                                <div className="mt-auto flex items-center gap-2 text-purple-400 font-bold group-hover:translate-x-2 transition-transform">
                                    GET SURPRISED <ExternalLink className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Hydro Sampler */}
                    <Link href="https://www.dubby.gg/products/hydro-sampler-pack-6-caffeine-free-drinks?ref=gvqslrbj" target="_blank">
                        <motion.div
                            whileHover={{ y: -10 }}
                            className="h-full bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-white/10 rounded-3xl p-1 overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="bg-black/40 backdrop-blur-sm rounded-[22px] p-6 h-full flex flex-col items-center text-center relative z-10">
                                <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    CAFFEINE FREE
                                </div>

                                <div className="w-48 h-48 mb-6 relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/40 transition-all duration-500" />
                                    <Zap className="w-24 h-24 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform duration-300" />
                                </div>

                                <h3 className="text-2xl font-bold font-outfit mb-2 group-hover:text-blue-400 transition-colors">
                                    Hydro Sampler Pack
                                </h3>
                                <p className="text-muted-foreground mb-6">
                                    6 caffeine-free refreshing drinks. Hydrate with flavor and electrolytes.
                                </p>

                                <div className="mt-auto flex items-center gap-2 text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                                    HYDRATE NOW <ExternalLink className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                </div>
            </div>
        </section>
    );
}

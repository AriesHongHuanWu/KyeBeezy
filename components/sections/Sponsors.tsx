"use client";

import { motion } from "framer-motion";

export default function SponsorsSection() {
    return (
        <section className="py-8 overflow-hidden relative z-20 pointer-events-none">
            {/* Transparent Background - Remove black/80 */}

            <div className="flex items-center relative">
                {/* Fade edges */}
                <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-background to-transparent z-10" />
                <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-background to-transparent z-10" />

                <motion.div
                    className="flex whitespace-nowrap"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30
                    }}
                >
                    {/* Repeated items for infinite loop illusion */}
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center mx-8 space-x-6 opacity-50 hover:opacity-100 transition-opacity duration-300">
                            {/* Glass Bubble for Sponsor */}
                            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 backdrop-blur-md">
                                <span className="text-xs font-bold tracking-widest text-muted-foreground">PARTNER</span>
                                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-outfit">
                                    AWBEST
                                </span>
                            </div>

                            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 dark:bg-white/5 border border-white/10 backdrop-blur-md">
                                <span className="text-xs font-bold tracking-widest text-muted-foreground">PARTNER</span>
                                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600 font-outfit">
                                    DUBBY
                                </span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";

export default function SponsorsSection() {
    // Array of text sponsors since we might not have logos for all yet
    const sponsors = [
        "DUBBY ENERGY",
        "BANDLAB",
        "TWITCH",
        "YOUTUBE",
        "DUBBY ENERGY",
        "BANDLAB",
        "TWITCH",
        "YOUTUBE"
    ];

    return (
        <section className="py-10 border-y border-white/5 bg-black/20 backdrop-blur-sm overflow-hidden flex items-center relative">

            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />

            <div className="flex">
                <motion.div
                    className="flex items-center gap-12 md:gap-24 whitespace-nowrap"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 20
                    }}
                >
                    {[...sponsors, ...sponsors, ...sponsors].map((sponsor, i) => (
                        <span key={i} className="text-2xl md:text-4xl font-black font-outfit text-transparent bg-clip-text bg-gradient-to-b from-white/30 to-white/10 dark:from-white/30 dark:to-white/10 uppercase tracking-widest select-none">
                            {sponsor}
                        </span>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";

export default function SponsorsSection() {
    return (
        <section className="py-8 bg-black/80 backdrop-blur-md border-y border-white/10 overflow-hidden relative z-20">
            <div className="flex items-center">
                <div className="absolute left-0 w-20 h-full bg-gradient-to-r from-black to-transparent z-10" />
                <div className="absolute right-0 w-20 h-full bg-gradient-to-l from-black to-transparent z-10" />

                <motion.div
                    className="flex whitespace-nowrap"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 20
                    }}
                >
                    {/* Repeated items for infinite loop illusion */}
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex items-center mx-8 space-x-4">
                            <span className="text-white/40 font-bold tracking-widest text-sm">SPONSORED BY</span>
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 font-outfit">
                                AWBEST
                            </span>
                            <span className="text-white/20">•</span>
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600 font-outfit">
                                DUBBY
                            </span>
                            <span className="text-white/20 mx-8">•</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutSection() {
    return (
        <section id="about" className="relative min-h-[80vh] flex items-center py-20 overflow-hidden bg-background">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-900/5 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-6 md:pr-10 z-20"
                    >
                        <h2 className="text-4xl md:text-5xl font-black font-outfit tracking-tighter text-foreground drop-shadow-lg">
                            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">STORY</span>
                        </h2>

                        <div className="space-y-4 text-muted-foreground text-lg leading-relaxed font-light">
                            <p>
                                Born in the rhythm, raised by the beat. <span className="text-foreground font-semibold">Kye Beezy</span> isn't just a name; it's a frequency. From streaming sessions that light up the night to tracks that hit the soul, the journey has always been about connection.
                            </p>
                            <p>
                                What started in a small room with big dreams has evolved into a multimedia experience. Blending high-energy visuals, raw musical talent, and an interactive community, Kye is redefining what it means to be a digital creator.
                            </p>
                        </div>

                        {/* Formatting "Stats" as a visual bar instead of list */}
                        <div className="flex flex-wrap gap-4 mt-8">
                            <div className="bg-card border border-border px-6 py-3 rounded-full backdrop-blur-md shadow-sm">
                                <span className="text-purple-400 font-bold">100+</span> Streams
                            </div>
                            <div className="bg-card border border-border px-6 py-3 rounded-full backdrop-blur-md shadow-sm">
                                <span className="text-pink-400 font-bold">Global</span> Audience
                            </div>
                            <div className="bg-card border border-border px-6 py-3 rounded-full backdrop-blur-md shadow-sm">
                                <span className="text-blue-400 font-bold">Limitless</span> Vibe
                            </div>
                        </div>
                    </motion.div>

                    {/* Image Area - Refined */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative h-[500px] md:h-[700px] w-full flex items-end justify-center z-10 mt-10 md:mt-0"
                    >
                        {/* Glow effect behind image instead of drop-shadow border */}
                        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent opacity-60 rounded-full blur-3xl transform translate-y-20 pointer-events-none" />

                        <div className="relative w-full h-full">
                            {/* The Cutout Image */}
                            <Image
                                src="/kye-cutout-new.png"
                                alt="Kye Beezy"
                                fill
                                className="object-contain object-bottom"
                                priority
                            />
                        </div>

                        {/* Bottom Gradient for blending - Semantic Color */}
                        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-20" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

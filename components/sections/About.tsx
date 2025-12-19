"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutSection() {
    return (
        <section id="about" className="relative min-h-screen flex items-center py-20 overflow-hidden bg-background transition-colors duration-300">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none dark:via-purple-900/10" />

            <div className="container mx-auto px-4 relative z-10 h-full flex flex-col md:flex-row items-center justify-between">

                {/* Text Content - Positioned Left & Higher Z-Index */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="relative z-20 md:w-1/2 lg:w-5/12 mt-10 md:mt-0"
                >
                    <h2 className="text-6xl md:text-8xl font-black font-outfit tracking-tighter text-foreground drop-shadow-sm dark:drop-shadow-2xl mb-8 relative">
                        THE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400">STORY</span>
                    </h2>

                    <div className="space-y-6 text-muted-foreground text-lg md:text-xl leading-relaxed font-light backdrop-blur-md bg-white/70 dark:bg-black/30 p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-2xl">
                        <p>
                            Born in the rhythm, raised by the beat. <span className="text-foreground font-semibold">Kye Beezy</span> isn't just a name; it's a frequency. From streaming sessions that light up the night to tracks that hit the soul, the journey has always been about connection.
                        </p>
                        <p>
                            What started in a small room with big dreams has evolved into a multimedia experience. Blending high-energy visuals, raw musical talent, and an interactive community, Kye is redefining what it means to be a digital creator.
                        </p>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex flex-wrap gap-4 mt-6">
                        <div className="bg-white/80 dark:bg-card/80 border border-gray-200 dark:border-border px-8 py-4 rounded-full backdrop-blur-md shadow-lg">
                            <span className="text-purple-600 dark:text-purple-400 font-bold text-xl">100+</span> <span className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground">Streams</span>
                        </div>
                        <div className="bg-white/80 dark:bg-card/80 border border-gray-200 dark:border-border px-8 py-4 rounded-full backdrop-blur-md shadow-lg">
                            <span className="text-pink-600 dark:text-pink-400 font-bold text-xl">Global</span> <span className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground">Audience</span>
                        </div>
                    </div>
                </motion.div>

                {/* Image Area - Adjusted positioning and blending */}
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="absolute right-0 bottom-0 w-full md:w-[60%] h-[60vh] md:h-[90vh] z-0 pointer-events-none md:pointer-events-auto"
                >
                    <div className="relative w-full h-full">
                        <Image
                            src="/kye-cutout-new.png"
                            alt="Kye Beezy"
                            fill
                            className="object-contain object-bottom drop-shadow-2xl"
                            priority
                            sizes="(max-width: 768px) 100vw, 60vw"
                            style={{
                                filter: "drop-shadow(0 0 20px rgba(0,0,0,0.2))" // Softer shadow to avoid harsh black border
                            }}
                        />
                        {/* Gradient Fade - Matches background exactly to hide cutoffs */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 md:h-64 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />

                        {/* Side fade for smoother text overlap */}
                        <div className="hidden md:block absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
                    </div>
                </motion.div>

            </div>
        </section>
    );
}

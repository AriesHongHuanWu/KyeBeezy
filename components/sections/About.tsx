"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutSection() {
    return (
        <section id="about" className="relative min-h-screen flex items-center py-20 overflow-hidden text-foreground">
            {/* NO Solid Background - Let global shader show through */}
            {/* Added a subtle gradient only to ensure readability if shader is too bright/dark */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-transparent pointer-events-none z-0" />

            <div className="container mx-auto px-4 relative z-10 h-full flex flex-col md:flex-row items-center justify-between">

                {/* Text Content - Premium Glass Card */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="relative z-20 md:w-1/2 lg:w-5/12 mt-10 md:mt-0"
                >
                    <h2 className="text-6xl md:text-8xl font-black font-outfit tracking-tighter drop-shadow-2xl mb-8 relative">
                        THE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-400 dark:to-pink-400">STORY</span>
                    </h2>

                    {/* Glassmorphism Card */}
                    <div className="space-y-6 text-foreground/90 text-lg md:text-xl leading-relaxed font-light backdrop-blur-xl bg-white/40 dark:bg-black/40 p-8 rounded-3xl border border-white/40 dark:border-white/10 shadow-2xl relative overflow-hidden group">

                        {/* Shimmer effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                        <p>
                            Born in the rhythm, raised by the beat. <span className="font-bold">Kye Beezy</span> isn't just a name; it's a frequency. From streaming sessions that light up the night to tracks that hit the soul, the journey has always been about connection.
                        </p>
                        <p>
                            What started in a small room with big dreams has evolved into a multimedia experience. Blending high-energy visuals, raw musical talent, and an interactive community, Kye is redefining what it means to be a digital creator.
                        </p>
                    </div>

                    {/* Stats Bar - Also Glass */}
                    <div className="flex flex-wrap gap-4 mt-8">
                        <div className="bg-white/40 dark:bg-black/60 border border-white/40 dark:border-white/10 px-8 py-4 rounded-full backdrop-blur-md shadow-lg flex items-center gap-3 transition-transform hover:scale-105 duration-300">
                            <span className="text-purple-600 dark:text-purple-400 font-bold text-2xl">100+</span>
                            <span className="text-xs uppercase tracking-widest text-foreground/70 font-bold">Streams</span>
                        </div>
                        <div className="bg-white/40 dark:bg-black/60 border border-white/40 dark:border-white/10 px-8 py-4 rounded-full backdrop-blur-md shadow-lg flex items-center gap-3 transition-transform hover:scale-105 duration-300 delay-100">
                            <span className="text-pink-600 dark:text-pink-400 font-bold text-2xl">Global</span>
                            <span className="text-xs uppercase tracking-widest text-foreground/70 font-bold">Audience</span>
                        </div>
                    </div>
                </motion.div>

                {/* Image Area - Masked Fade + Positioning */}
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="absolute right-0 bottom-0 w-full md:w-[60%] h-[60vh] md:h-[90vh] z-0 pointer-events-none md:pointer-events-auto"
                >
                    <div
                        className="relative w-full h-full"
                        style={{
                            // CSS Mask to fade the image to transparent at the bottom and right
                            maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
                        }}
                    >
                        <Image
                            src="/kye-cutout-new.png"
                            alt="Kye Beezy"
                            fill
                            className="object-contain object-bottom drop-shadow-2xl"
                            priority
                            sizes="(max-width: 768px) 100vw, 60vw"
                            style={{
                                // softer shadow
                                filter: "drop-shadow(0 0 30px rgba(0,0,0,0.3))"
                            }}
                        />
                    </div>
                </motion.div>

            </div>
        </section>
    );
}

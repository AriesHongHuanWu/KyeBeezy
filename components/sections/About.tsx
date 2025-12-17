"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutSection() {
    return (
        <section id="about" className="relative min-h-screen flex items-center py-20 overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 h-full flex flex-col md:flex-row items-center">

                {/* Image Area - Huge & Overlapping */}
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="absolute right-0 bottom-0 w-full md:w-[65%] h-[70vh] md:h-[90vh] z-0 pointer-events-none"
                    style={{ transform: 'translateX(10%)' }} // Slight offset to right to not clear text completely
                >
                    {/* Glow behind image */}
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />

                    <div className="relative w-full h-full">
                        <Image
                            src="/kye-cutout-new.png"
                            alt="Kye Beezy"
                            fill
                            className="object-contain object-bottom"
                            priority
                            sizes="(max-width: 768px) 100vw, 65vw"
                        />
                        {/* Bottom fade matched to theme */}
                        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-20" />
                    </div>
                </motion.div>

                {/* Text Content - Z-Index higher to sit on top of image part, or lower? 
                    User said "image overlap text". If text is unreadable, it's bad UX.
                    I'll make the text adhere to the left and image pull left.
                    Let's Keep text z-10 and Image z-0. But visual overlap happens.
                */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="relative z-10 md:max-w-xl lg:max-w-2xl mt-10 md:mt-0"
                >
                    <h2 className="text-6xl md:text-8xl font-black font-outfit tracking-tighter text-foreground drop-shadow-2xl mb-8 relative">
                        THE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">STORY</span>
                    </h2>

                    <div className="space-y-6 text-muted-foreground text-lg md:text-xl leading-relaxed font-light backdrop-blur-sm bg-background/30 p-6 rounded-2xl border border-white/5 shadow-xl">
                        <p>
                            Born in the rhythm, raised by the beat. <span className="text-foreground font-semibold">Kye Beezy</span> isn't just a name; it's a frequency. From streaming sessions that light up the night to tracks that hit the soul, the journey has always been about connection.
                        </p>
                        <p>
                            What started in a small room with big dreams has evolved into a multimedia experience. Blending high-energy visuals, raw musical talent, and an interactive community, Kye is redefining what it means to be a digital creator.
                        </p>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex flex-wrap gap-4 mt-10">
                        <div className="bg-card/80 border border-border px-8 py-4 rounded-full backdrop-blur-md shadow-lg">
                            <span className="text-purple-400 font-bold text-xl">100+</span> <span className="text-sm uppercase tracking-wider">Streams</span>
                        </div>
                        <div className="bg-card/80 border border-border px-8 py-4 rounded-full backdrop-blur-md shadow-lg">
                            <span className="text-pink-400 font-bold text-xl">Global</span> <span className="text-sm uppercase tracking-wider">Audience</span>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}

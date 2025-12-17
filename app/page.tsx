"use client";

import { ShaderAnimation } from "@/components/ui/shader-animation";
import Navbar from "@/components/Navbar";
import AboutSection from "@/components/sections/About";
import MusicSection from "@/components/sections/Music";
import StreamingSection from "@/components/sections/Streaming";
import ContactSection from "@/components/sections/Contact";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function Home() {
    return (
        <main className="relative text-white font-sans selection:bg-purple-500/30">
            {/* Background - Fixed */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ShaderAnimation />
            </div>

            {/* Navigation */}
            <Navbar />

            <div className="relative z-10 flex flex-col">
                {/* Hero Section */}
                <section id="home" className="h-screen flex flex-col items-center justify-center relative px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-center"
                    >
                        <div className="mb-6 inline-block">
                            {/* Animated Gradient Avatar Border */}
                            <div className="p-1 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-900/50">
                                <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-black flex items-center justify-center text-4xl md:text-6xl font-bold border-4 border-black">
                                    KB
                                </div>
                            </div>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-gray-400 drop-shadow-sm">
                            KYE BEEZY
                        </h1>
                        <p className="text-xl md:text-2xl text-purple-200 font-light tracking-widest uppercase mb-8">
                            Digital Creator & Artist
                        </p>
                    </motion.div>

                    <motion.a
                        href="#about"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: "reverse" }}
                        className="absolute bottom-10 p-2 text-white/50 hover:text-white transition-colors"
                    >
                        <ChevronDown className="w-8 h-8" />
                    </motion.a>
                </section>

                {/* Content Sections */}
                <div className="bg-gradient-to-b from-transparent via-black/50 to-black backdrop-blur-sm">
                    <AboutSection />
                    <MusicSection />
                    <StreamingSection />
                    <ContactSection />
                </div>
            </div>
        </main>
    );
}

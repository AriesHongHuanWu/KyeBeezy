"use client";

import { ShaderAnimation } from "@/components/ui/shader-animation";
import { GooeyText } from "@/components/ui/gooey-text-morphing";
import Navbar from "@/components/Navbar";
import AboutSection from "@/components/sections/About";
import MusicSection from "@/components/sections/Music";
import StreamingSection from "@/components/sections/Streaming";
import ContactSection from "@/components/sections/Contact";
import DubbyPromo from "@/components/sections/DubbyPromo";
import SponsorsSection from "@/components/sections/Sponsors";
import { motion } from "framer-motion";
import { ChevronDown, Twitch, Youtube, Music, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface GlobalSettings {
    heroTitle: string[];
    heroSubtitle: string;
    socials: {
        twitch: string;
        youtube: string;
        discord: string;
        bandlab: string;
    };
}

export default function Home() {
    const [settings, setSettings] = useState<GlobalSettings>({
        heroTitle: ["KYE BEEZY", "ARTIST", "STREAMER", "VISIONARY"],
        heroSubtitle: "DIGITAL CREATOR & ARTIST",
        socials: {
            twitch: "https://twitch.tv/",
            youtube: "https://youtube.com/",
            discord: "https://discord.gg/JU3MNRGWXq",
            bandlab: "https://www.bandlab.com/"
        }
    });

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "settings", "global"), (doc) => {
            if (doc.exists()) {
                setSettings(doc.data() as GlobalSettings);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <main className="relative text-foreground bg-background font-sans selection:bg-purple-500/30 transition-colors duration-300">
            {/* Background - Fixed */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-10 dark:opacity-100 transition-opacity duration-500">
                <ShaderAnimation />
            </div>

            {/* Navigation - Floating Island */}
            <Navbar />

            <div className="relative z-10 flex flex-col gap-0 md:gap-12">
                {/* 1. Hero Section */}
                <section id="hero" className="min-h-screen flex flex-col items-center justify-center relative pt-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        className="z-10 flex flex-col items-center justify-center space-y-8 md:space-y-12 w-full max-w-4xl px-4"
                    >
                        {/* Dynamic Title */}
                        <motion.div
                            className="h-32 md:h-48 flex items-center justify-center w-full z-20"
                            animate={{ y: [0, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                        >
                            <GooeyText
                                texts={settings.heroTitle}
                                morphTime={1.5}
                                cooldownTime={1}
                                className="font-outfit text-foreground"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="text-center space-y-4"
                        >
                            <p className="text-xl md:text-2xl font-light tracking-[0.2em] text-muted-foreground">
                                {settings.heroSubtitle}
                            </p>
                        </motion.div>

                        {/* Social Links - Enhanced with glass effect */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="flex space-x-8 mt-8 p-4 rounded-2xl bg-white/5 dark:bg-accent/5 backdrop-blur-sm border border-black/5 dark:border-white/10 shadow-lg hover:shadow-purple-500/20 transition-all"
                        >
                            <Link href={settings.socials.twitch} target="_blank" className="hover:text-purple-400 text-foreground transition-colors transform hover:scale-110 duration-300">
                                <Twitch className="w-8 h-8" />
                            </Link>
                            <Link href={settings.socials.bandlab} target="_blank" className="hover:text-red-400 text-foreground transition-colors transform hover:scale-110 duration-300">
                                <Music className="w-8 h-8" />
                            </Link>
                            <Link href={settings.socials.youtube} target="_blank" className="hover:text-red-600 text-foreground transition-colors transform hover:scale-110 duration-300">
                                <Youtube className="w-8 h-8" />
                            </Link>
                            <Link href={settings.socials.discord} target="_blank" className="hover:text-indigo-500 text-foreground transition-colors transform hover:scale-110 duration-300">
                                <Gamepad2 className="w-8 h-8" />
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.a
                        href="#about"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: "reverse" }}
                        className="absolute bottom-10 p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronDown className="w-8 h-8" />
                    </motion.a>
                </section>

                {/* 2. Content Flow: About -> Music -> Streaming */}
                <div className="relative z-10 w-full flex flex-col gap-0">
                    <AboutSection />
                    <MusicSection />
                    <StreamingSection />
                </div>

                {/* 3. Promo & Monetization: Dubby -> Sponsors */}
                <DubbyPromo />
                <SponsorsSection />

                {/* 4. Action: Contact */}
                <ContactSection />
            </div>
        </main>
    );
}

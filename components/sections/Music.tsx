"use client";

import { motion } from "framer-motion";
import { Music, Play } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function MusicSection() {
    const [tracks, setTracks] = useState<any[]>([
        {
            id: "7d44e991-08cf-f011-8196-000d3a96100f",
            title: "Latest Heat",
            genre: "Hip Hop • Trap",
            gradient: "from-purple-500/20 to-blue-500/20",
            border: "hover:border-purple-500/50",
            shadow: "hover:shadow-purple-500/20",
            isLegacy: true
        },
        {
            id: "2f1287da-399e-f011-8e64-6045bd354e91",
            title: "Night Vibes",
            genre: "Lo-Fi • Chill",
            gradient: "from-pink-500/20 to-red-500/20",
            border: "hover:border-pink-500/50",
            shadow: "hover:shadow-pink-500/20",
            isLegacy: true
        },
        {
            id: "bcdc5788-3f63-f011-8dc9-000d3a960be3",
            title: "Studio Sessions",
            genre: "Experimental • Vibe",
            gradient: "from-blue-500/20 to-indigo-500/20",
            border: "hover:border-blue-500/50",
            shadow: "hover:shadow-blue-500/20",
            isLegacy: true
        },
    ]);

    useEffect(() => {
        try {
            const q = query(collection(db, "music"), orderBy("createdAt", "desc"));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                    const fetchedTracks = snapshot.docs.map(doc => {
                        const data = doc.data();
                        // Extract src from iframe if provided
                        let src = "";
                        if (data.embedCode && data.embedCode.includes("src=\"")) {
                            const match = data.embedCode.match(/src="([^"]+)"/);
                            if (match) src = match[1];
                        } else {
                            src = data.embedCode; // Assume it's a raw URL or ID if no iframe tag
                        }

                        return {
                            id: doc.id,
                            title: data.title,
                            genre: "Exclusive", // Default genre for dynamic tracks
                            gradient: "from-indigo-500/20 to-purple-500/20",
                            border: "hover:border-indigo-500/50",
                            shadow: "hover:shadow-indigo-500/20",
                            src: src
                        };
                    });
                    setTracks(fetchedTracks);
                }
            }, (error) => { });
            return () => unsubscribe();
        } catch (e) { }
    }, []);

    return (
        <section id="music" className="min-h-screen flex items-center justify-center relative py-20 overflow-hidden">
            {/* NO Solid Background - Transparency for Shader */}

            <div className="container mx-auto px-6 z-10 relative">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-7xl font-black font-outfit text-foreground mb-4 drop-shadow-xl">
                        BEATS & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">MUSIC</span>
                    </h2>
                    <p className="text-xl text-muted-foreground">Crafting sounds on BandLab</p>
                </motion.div>

                <motion.div
                    className="grid md:grid-cols-3 gap-8"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: {},
                        show: {
                            transition: {
                                staggerChildren: 0.2
                            }
                        }
                    }}
                >
                    {tracks.map((track, index) => (
                        <motion.div
                            key={track.id}
                            variants={{
                                hidden: { opacity: 0, y: 50 },
                                show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
                            }}
                            className="group"
                        >
                            {/* Glassmorphism Card */}
                            <div className={`bg-white/10 dark:bg-black/40 backdrop-blur-xl rounded-3xl p-4 border border-white/20 dark:border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${track.border} ${track.shadow}`}>
                                <div className={`relative aspect-square rounded-2xl overflow-hidden mb-4 bg-gradient-to-br ${track.gradient}`}>
                                    <iframe
                                        src={track.src || `https://www.bandlab.com/embed/?id=${track.id}`}
                                        className="absolute inset-0 w-full h-full opacity-90 hover:opacity-100 transition-opacity"
                                        frameBorder="0"
                                        allow="autoplay"
                                    ></iframe>
                                </div>
                                <div className="flex justify-between items-start px-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground font-outfit mb-1">{track.title}</h3>
                                        <p className="text-sm text-muted-foreground font-medium">{track.genre}</p>
                                    </div>
                                    <div className="p-3 bg-purple-600 rounded-full shadow-lg shadow-purple-600/40 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                                        <Play className="w-4 h-4 fill-white text-white" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="mt-16 text-center">
                    <Link href="https://www.bandlab.com/kyebeezy" target="_blank" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-foreground font-bold rounded-full hover:bg-white/20 hover:scale-110 transition-all shadow-lg hover:shadow-purple-500/20">
                        Listen on BandLab <Music className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section >
    );
}

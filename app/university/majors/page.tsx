"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BookOpen, Music, Mic2, Briefcase, Radio } from "lucide-react";

export default function MajorsPage() {
    const [majors, setMajors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMajors = async () => {
            try {
                // Determine icon based on name or just random/default if dynamic
                const q = query(collection(db, "university_departments"), orderBy("createdAt", "asc"));
                const snap = await getDocs(q);
                setMajors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchMajors();
    }, []);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case "music": return <Music size={32} />;
            case "mic": return <Mic2 size={32} />;
            case "business": return <Briefcase size={32} />;
            case "radio": return <Radio size={32} />;
            default: return <BookOpen size={32} />;
        }
    };

    return (
        <div className="container mx-auto px-6">
            <header className="mb-20 text-center max-w-3xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-black dark:text-white">
                    Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Majors.</span>
                </h1>
                <p className="text-xl text-neutral-500">
                    Specialized tracks designed to give you a competitive edge.
                </p>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
                    {[1, 2].map(i => <div key={i} className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-[2rem]" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-12">
                    {majors.map((major, i) => (
                        <motion.div
                            key={major.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 p-8 md:p-12 rounded-[2.5rem] flex flex-col md:flex-row gap-8 md:gap-16 hover:shadow-2xl transition-shadow duration-500"
                        >
                            <div className="md:w-1/3 flex flex-col justify-between">
                                <div>
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg ${major.color || "bg-black"}`}>
                                        {getIcon(major.icon)}
                                    </div>
                                    <h2 className="text-4xl font-bold mb-4 text-black dark:text-white">{major.name}</h2>
                                    <p className="text-neutral-500 leading-relaxed text-lg">
                                        {major.description}
                                    </p>
                                </div>
                            </div>

                            <div className="md:w-2/3 bg-neutral-50 dark:bg-black/20 rounded-3xl p-8">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">Curriculum Highlights</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {major.courses?.map((course: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 bg-white dark:bg-white/5 p-4 rounded-xl border border-neutral-100 dark:border-white/5">
                                            <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center flex-shrink-0">
                                                <span className="text-[10px] font-bold">{idx + 1}</span>
                                            </div>
                                            <span className="font-medium text-black dark:text-white">{course}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {majors.length === 0 && <div className="text-center py-20 text-neutral-500">Curriculum is currently being updated.</div>}
                </div>
            )}
        </div>
    )
}

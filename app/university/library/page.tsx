"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Download, Lock, FileAudio, FileMusic, Box } from "lucide-react";

export default function LibraryPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const fetchResources = async () => {
            const q = query(collection(db, "university_resources"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            setResources(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        };
        fetchResources();
    }, []);

    const categories = Array.from(new Set(resources.map(r => r.category))).filter(Boolean);
    const filtered = filter === "all" ? resources : resources.filter(r => r.category === filter);

    return (
        <div className="container mx-auto px-6">
            <header className="mb-12 text-center max-w-3xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-black dark:text-white">
                    Resource <span className="text-blue-600">Library.</span>
                </h1>
                <p className="text-xl text-neutral-500">
                    Essential tools, kits, and guidelines for your production journey.
                </p>
            </header>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${filter === "all" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-neutral-100 dark:bg-white/5 text-neutral-500 hover:bg-neutral-200"}`}
                >
                    All Assets
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${filter === cat ? "bg-black text-white dark:bg-white dark:text-black" : "bg-neutral-100 dark:bg-white/5 text-neutral-500 hover:bg-neutral-200"}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filtered.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white dark:bg-white/5 border border-neutral-100 dark:border-white/5 p-4 rounded-3xl group hover:border-blue-500/30 transition-all hover:-translate-y-1"
                        >
                            <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center">
                                {item.image ? (
                                    <img src={item.image} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-neutral-400">
                                        {item.category === 'Drum Kit' ? <Box size={40} /> : <FileAudio size={40} />}
                                    </div>
                                )}

                                {item.isExclusive && (
                                    <div className="absolute top-2 right-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <Lock size={10} /> PRO
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <div className="text-[10px] font-bold uppercase text-blue-500 mb-1">{item.category}</div>
                                <h3 className="font-bold text-black dark:text-white leading-tight">{item.title}</h3>
                            </div>

                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-neutral-100 dark:bg-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                <Download size={16} /> Download
                            </a>
                        </motion.div>
                    ))}
                </div>
            )}
            {filtered.length === 0 && !loading && <p className="text-center text-neutral-500 py-12">No resources found.</p>}
        </div>
    )
}

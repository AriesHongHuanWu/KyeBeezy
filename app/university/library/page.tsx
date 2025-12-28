"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Lock, Search } from "lucide-react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

export default function LibraryPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const q = query(collection(db, "university_resources"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                setResources(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching resources:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, []);

    const filteredResources = filter === "all"
        ? resources
        : resources.filter(r => r.category?.toLowerCase().includes(filter.toLowerCase()));

    const uniqueCategories = ["all", ...Array.from(new Set(resources.map(r => r.category).filter(Boolean)))];

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white pb-24">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-white/5 pt-24 pb-12 px-6">
                <div className="container mx-auto">
                    <Link href="/university" className="inline-flex items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors mb-6 font-bold text-sm">
                        <ArrowLeft size={16} /> Back to University
                    </Link>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black mb-4">Resource Library</h1>
                            <p className="text-xl text-neutral-500 max-w-2xl">Curated samples, presets, and documents for students.</p>
                        </div>

                        {/* Search / Filter (Simplified) */}
                        <div className="bg-neutral-100 dark:bg-black/50 border border-neutral-200 dark:border-white/10 p-1.5 rounded-xl flex gap-1 overflow-x-auto max-w-full">
                            {uniqueCategories.slice(0, 5).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilter(cat)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize whitespace-nowrap ${filter === cat
                                            ? 'bg-white dark:bg-white text-black shadow-lg'
                                            : 'text-neutral-500 hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[4/5] bg-neutral-200 dark:bg-neutral-800 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredResources.map((res, i) => (
                            <motion.div
                                key={res.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-4 pb-20 rounded-3xl overflow-hidden hover:border-blue-500/50 transition-all duration-300"
                            >
                                <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-2xl mb-4 overflow-hidden relative">
                                    {res.image ? (
                                        <img src={res.image} alt={res.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-700 font-black text-6xl opacity-20">
                                            DL
                                        </div>
                                    )}

                                    {res.isExclusive && (
                                        <div className="absolute top-3 right-3 bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                                            <Lock size={10} /> PRO
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <p className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wide opacity-80">{res.category}</p>
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight mb-2 line-clamp-2">{res.title}</h3>
                                </div>

                                <div className="absolute bottom-4 left-4 right-4">
                                    <button
                                        onClick={() => window.open(res.url, '_blank')}
                                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${res.isExclusive
                                                ? 'bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                                                : 'bg-black dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-95'
                                            }`}
                                    >
                                        {res.isExclusive ? <Lock size={16} /> : <Download size={16} />}
                                        {res.isExclusive ? "Locked" : "Download"}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 text-neutral-500">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold mb-2">No Resources Found</h3>
                        <p>Try filtering by a different category.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

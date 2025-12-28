"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Newspaper } from "lucide-react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

export default function NewsPage() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const q = query(collection(db, "university_news"), orderBy("publishedAt", "desc"));
                const querySnapshot = await getDocs(q);
                setNews(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching news:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white pb-24">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-white/5 pt-24 pb-12 px-6">
                <div className="container mx-auto">
                    <Link href="/university" className="inline-flex items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors mb-6 font-bold text-sm">
                        <ArrowLeft size={16} /> Back to University
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black mb-4">Campus News</h1>
                    <p className="text-xl text-neutral-500 max-w-2xl">Latest updates, announcements, and featured stories from BandLab University.</p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-neutral-200 dark:bg-neutral-800 aspect-video rounded-2xl mb-4" />
                                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3 mb-2" />
                                <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4 mb-4" />
                                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
                            </div>
                        ))}
                    </div>
                ) : news.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {news.map((item, i) => (
                            <motion.article
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group flex flex-col h-full bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
                            >
                                <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden relative">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-700">
                                            <Newspaper size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                                        NEWS
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 mb-3">
                                        <Calendar size={14} />
                                        {item.publishedAt?.toDate ? item.publishedAt.toDate().toLocaleDateString() : "Recent"}
                                    </div>
                                    <h2 className="text-2xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors line-clamp-2">
                                        {item.title}
                                    </h2>
                                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 line-clamp-3">
                                        {item.summary}
                                    </p>

                                    {/* Placeholder for 'Read More' if we implement single article view later */}
                                    {/* <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-white/5 flex justify-between items-center">
                                        <span className="text-sm font-bold text-blue-600">Read Article</span>
                                    </div> */}
                                </div>
                            </motion.article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 text-neutral-500">
                        <Newspaper size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold mb-2">No News Yet</h3>
                        <p>Stay tuned for updates from the campus.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

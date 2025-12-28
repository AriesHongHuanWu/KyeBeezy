"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function NewsPage() {
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const q = query(collection(db, "university_news"), orderBy("publishedAt", "desc"));
                const snap = await getDocs(q);
                setNews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    if (loading) return <div className="h-screen flex items-center justify-center text-neutral-500">Loading Campus News...</div>;

    const featured = news[0];
    const rest = news.slice(1);

    return (
        <div className="container mx-auto px-6">
            <header className="mb-16">
                <h1 className="text-6xl font-black tracking-tighter text-black dark:text-white mb-4">
                    CAMPUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">NEWS</span>
                </h1>
                <div className="h-px w-full bg-neutral-200 dark:bg-white/10" />
            </header>

            {/* Featured Article */}
            {featured && (
                <div className="mb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 group cursor-pointer">
                    <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-[2rem] overflow-hidden relative">
                        {featured.image && <img src={featured.image} alt={featured.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                        <div className="absolute top-6 left-6 bg-white dark:bg-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl">
                            Featured
                        </div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4 font-mono">
                            <span>{featured.publishedAt?.toDate ? format(featured.publishedAt.toDate(), "MMM dd, yyyy") : "Reccent"}</span>
                            <span>•</span>
                            <span>{featured.author || "Admin"}</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
                            {featured.title}
                        </h2>
                        <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed line-clamp-3">
                            {featured.summary}
                        </p>
                        <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:translate-x-2 transition-transform">
                            Read Full Story <ArrowUpRight size={20} />
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
                {rest.map((item) => (
                    <div key={item.id} className="group cursor-pointer">
                        <div className="aspect-[16/10] bg-neutral-200 dark:bg-neutral-800 rounded-3xl overflow-hidden mb-6">
                            {item.image && <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />}
                        </div>
                        <div className="text-xs font-bold text-neutral-400 mb-3 uppercase tracking-wider">
                            {item.publishedAt?.toDate ? format(item.publishedAt.toDate(), "MMM dd, yyyy") : "News"}
                        </div>
                        <h3 className="text-2xl font-bold text-black dark:text-white mb-3 group-hover:text-blue-500 transition-colors">
                            {item.title}
                        </h3>
                        <p className="text-neutral-500 leading-relaxed line-clamp-3">
                            {item.summary}
                        </p>
                    </div>
                ))}
            </div>

            {news.length === 0 && (
                <div className="text-center py-20 bg-neutral-100 dark:bg-white/5 rounded-[3rem]">
                    <h3 className="text-2xl font-bold text-neutral-400">No news updates yet.</h3>
                </div>
            )}
        </div>
    );
}

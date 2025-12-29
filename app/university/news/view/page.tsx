"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Newspaper, User } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';

function NewsArticleContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get("id");
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchArticle = async () => {
            try {
                const docRef = doc(db, "university_news", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setArticle({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching article:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]);

    if (!id) return (
        <div className="min-h-screen flex items-center justify-center text-neutral-500">
            Article not found. <Link href="/university/news" className="text-blue-500 hover:underline ml-2">Go Back</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white pb-24">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-white/5 pt-24 pb-8 px-6 sticky top-0 z-40">
                <div className="container mx-auto max-w-4xl">
                    <Link href="/university/news" className="inline-flex items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors font-bold text-sm">
                        <ArrowLeft size={16} /> Back to News
                    </Link>
                </div>
            </div>

            <div className="container mx-auto max-w-4xl px-6 py-12">
                {loading ? (
                    <div className="animate-pulse space-y-8">
                        <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-3/4" />
                        <div className="aspect-video bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
                        <div className="space-y-4">
                            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
                            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
                            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
                        </div>
                    </div>
                ) : article ? (
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        <header className="space-y-6">
                            <div className="flex items-center gap-4 text-sm font-bold text-neutral-500">
                                <span className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full uppercase tracking-wider text-xs">
                                    <Newspaper size={12} /> News
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {article.publishedAt?.toDate ? article.publishedAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Recent"}
                                </span>
                                {article.author && (
                                    <span className="flex items-center gap-1.5">
                                        <User size={14} /> {article.author}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl md:leading-tight font-black tracking-tight text-neutral-900 dark:text-white">
                                {article.title}
                            </h1>

                            {article.image && (
                                <div className="aspect-video relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-3xl" />
                                </div>
                            )}
                        </header>

                        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-2xl prose-img:shadow-lg">
                            {/* Summary as Lead Paragraph */}
                            {article.summary && (
                                <p className="lead text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed mb-8 border-b border-neutral-200 dark:border-white/10 pb-8">
                                    {article.summary}
                                </p>
                            )}

                            {/* Full Content Rendering */}
                            {article.content ? (
                                <ReactMarkdown
                                    components={{
                                        // Custom renderer for images to add styling/optimization if needed
                                        img: ({ node, ...props }) => (
                                            <div className="my-8">
                                                <img {...props} className="rounded-2xl shadow-lg w-full" />
                                            </div>
                                        )
                                    }}
                                >
                                    {article.content}
                                </ReactMarkdown>
                            ) : (
                                <div className="text-neutral-500 italic">No additional content.</div>
                            )}
                        </div>
                    </motion.article>
                ) : (
                    <div className="text-center py-24">
                        <Newspaper size={64} className="mx-auto text-neutral-200 dark:text-neutral-800 mb-6" />
                        <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
                        <p className="text-neutral-500">This news item may have been removed.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function NewsArticlePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-50 dark:bg-black" />}>
            <NewsArticleContent />
        </Suspense>
    )
}

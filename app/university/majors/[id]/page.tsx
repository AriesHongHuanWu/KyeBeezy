"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, BookOpen, Music, Mic, Briefcase, Radio, Star, Calendar, CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const iconMap: Record<string, any> = {
    music: Music,
    mic: Mic,
    business: Briefcase,
    radio: Radio
};

export default function MajorDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [major, setMajor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchMajor = async () => {
            try {
                const docRef = doc(db, "university_departments", id as string);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setMajor({ id: docSnap.id, ...docSnap.data() });
                } else {
                    router.push("/university/majors");
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchMajor();
    }, [id, router]);

    if (loading) return (
        <div className="min-h-screen bg-neutral-50 dark:bg-black flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!major) return null;

    const Icon = iconMap[major.icon] || BookOpen;

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white pb-24">
            {/* Hero Header */}
            <div className={`relative pt-32 pb-20 px-6 overflow-hidden ${major.color ? major.color.replace('bg-', 'bg-').replace('500', '900') : 'bg-neutral-900'} text-white`}>
                <div className="absolute inset-0 bg-black/40" />
                <div className="container mx-auto relative z-10">
                    <Link href="/university/majors" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 font-bold text-sm">
                        <ArrowLeft size={16} /> Back to Majors
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-6 rounded-3xl ${major.color || 'bg-blue-600'} shadow-2xl shadow-black/50`}
                        >
                            <Icon size={64} className="text-white" />
                        </motion.div>
                        <div>
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-5xl md:text-7xl font-black mb-4 tracking-tight"
                            >
                                {major.name}
                            </motion.h1>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-xl md:text-2xl text-white/80 max-w-2xl font-light"
                            >
                                {major.description}
                            </motion.p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Highlights / Big Goals */}
                        <section>
                            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                <Star className="text-yellow-500" /> Program Highlights
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {major.highlights && major.highlights.length > 0 ? (
                                    major.highlights.map((h: string, i: number) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-6 rounded-2xl flex gap-4"
                                        >
                                            <div className="mt-1"><CheckCircle size={20} className="text-green-500" /></div>
                                            <p className="font-medium text-lg leading-relaxed">{h}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <p className="text-neutral-500 italic">No highlights listed yet.</p>
                                )}
                            </div>
                        </section>

                        {/* Activities */}
                        <section>
                            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                                <Calendar className="text-blue-500" /> Key Activities
                            </h2>
                            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-3xl overflow-hidden p-8">
                                {major.activities && major.activities.length > 0 ? (
                                    <ul className="space-y-6">
                                        {major.activities.map((act: string, i: number) => (
                                            <li key={i} className="flex gap-4 items-start pb-6 border-b border-neutral-100 dark:border-white/5 last:border-0 last:pb-0">
                                                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                                                    Module {i + 1}
                                                </div>
                                                <span className="text-lg font-medium">{act}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-neutral-500 italic">Curriculum activities coming soon.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar / Course List */}
                    <div className="space-y-8">
                        <div className="bg-neutral-900 text-white p-8 rounded-3xl sticky top-24">
                            <h3 className="text-2xl font-bold mb-6">Course Framework</h3>
                            <div className="space-y-3">
                                {major.courses?.map((c: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <span className="font-medium text-sm">{c}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <Link
                                    href="/university/apply"
                                    className="block w-full py-4 bg-blue-600 hover:bg-blue-500 text-center font-bold rounded-xl transition-colors text-lg"
                                >
                                    Apply for Major
                                </Link>
                                <p className="text-center text-xs text-white/40 mt-4">
                                    Limited seats available for {new Date().getFullYear()}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

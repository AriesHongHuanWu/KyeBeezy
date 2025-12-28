"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Music, Mic, Briefcase, Radio } from "lucide-react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

const iconMap: Record<string, any> = {
    music: Music,
    mic: Mic,
    business: Briefcase,
    radio: Radio
};

export default function MajorsPage() {
    const [majors, setMajors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMajors = async () => {
            try {
                const q = query(collection(db, "university_departments"), orderBy("createdAt", "asc"));
                const querySnapshot = await getDocs(q);
                setMajors(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching majors:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMajors();
    }, []);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white pb-24">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-white/5 pt-24 pb-12 px-6">
                <div className="container mx-auto">
                    <Link href="/university" className="inline-flex items-center gap-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors mb-6 font-bold text-sm">
                        <ArrowLeft size={16} /> Back to University
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black mb-4">Academic Departments</h1>
                    <p className="text-xl text-neutral-500 max-w-2xl">Explore our specialized curriculums designed to launch your music career.</p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-64 bg-neutral-200 dark:bg-neutral-800 rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : majors.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {majors.map((major, i) => {
                            const Icon = iconMap[major.icon] || BookOpen;

                            return (
                                <Link href={`/university/majors/${major.id}`} key={major.id}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group relative h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-8 md:p-12 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
                                    >
                                        {/* Ambient Background Gradient */}
                                        <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${major.color || 'bg-blue-500'}`} />

                                        <div className="relative z-10">
                                            <div className={`w-16 h-16 rounded-2xl ${major.color ? major.color.replace('bg-', 'bg-').replace('500', '500/10').replace('600', '600/10') : 'bg-neutral-100 dark:bg-white/5'} flex items-center justify-center mb-8`}>
                                                <Icon size={32} className={major.color?.replace('bg-', 'text-') || 'text-neutral-500'} />
                                            </div>

                                            <h2 className="text-3xl md:text-4xl font-black mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors">
                                                {major.name}
                                            </h2>
                                            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                                                {major.description}
                                            </p>

                                            <div>
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-4">Core Curriculum</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {major.courses?.slice(0, 4).map((course: string, idx: number) => (
                                                        <span key={idx} className="bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 px-4 py-2 rounded-full text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                                            {course}
                                                        </span>
                                                    ))}
                                                    {major.courses && major.courses.length > 4 && (
                                                        <span className="bg-neutral-100 dark:bg-white/5 px-4 py-2 rounded-full text-sm font-medium text-neutral-500">+{major.courses.length - 4}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-24 text-neutral-500">
                        <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-bold mb-2">No Departments Found</h3>
                        <p>Curriculum is currently being updated.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

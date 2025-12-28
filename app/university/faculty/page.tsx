"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Plus, User, Award } from "lucide-react";

export default function FacultyPage() {
    const [faculty, setFaculty] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const q = query(collection(db, "university_professors"), orderBy("order", "asc"));
                const snap = await getDocs(q);
                setFaculty(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchFaculty();
    }, []);

    const leaders = faculty.filter(f => f.role === 'leader');
    const professors = faculty.filter(f => f.role === 'professor' || !f.role); // Default to professor
    const mentors = faculty.filter(f => f.role === 'mentor');

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const FacultyGrid = ({ title, list, variant = "normal" }: { title: string, list: any[], variant?: "normal" | "compact" }) => {
        if (list.length === 0) return null;
        return (
            <div className="mb-20">
                <h2 className="text-3xl font-bold mb-8 text-black dark:text-white flex items-center gap-3">
                    {title}
                    <div className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
                </h2>
                <div className={`grid ${variant === 'compact' ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-8`}>
                    {list.map((prof) => (
                        <motion.div
                            key={prof.id}
                            variants={item}
                            className={`bg-white dark:bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all duration-500`}
                        >
                            <div className={`${variant === 'compact' ? 'aspect-square' : 'aspect-[4/5]'} bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden`}>
                                {prof.image ? (
                                    <img src={prof.image} alt={prof.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300 dark:text-neutral-700">
                                        <User size={variant === 'compact' ? 32 : 64} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                                <div className={`absolute bottom-6 left-6 text-white ${variant === 'compact' ? 'bottom-4 left-4' : ''}`}>
                                    {variant !== 'compact' && <div className="bg-blue-600 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">
                                        {prof.department || "Faculty"}
                                    </div>}
                                    <h3 className={`${variant === 'compact' ? 'text-lg' : 'text-2xl'} font-bold`}>{prof.name}</h3>
                                    <p className="text-white/60 text-xs tracking-wider uppercase font-medium">{prof.title}</p>
                                </div>
                            </div>
                            {variant !== 'compact' && <div className="p-6">
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed mb-4 line-clamp-3">
                                    {prof.bio || "No biography available."}
                                </p>
                            </div>}
                        </motion.div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-6">
            <header className="mb-20 text-center max-w-3xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-black dark:text-white">
                    Our <span className="text-blue-600">Faculty.</span>
                </h1>
                <p className="text-xl text-neutral-500">
                    A collective of visionaries, technical masters, and industry leaders.
                </p>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-[2rem]" />)}
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show">
                    <FacultyGrid title="Leadership" list={leaders} />
                    <FacultyGrid title="Professors" list={professors} />
                    <FacultyGrid title="Mentors & Assistants" list={mentors} variant="compact" />

                    {/* Join Card */}
                    <motion.div variants={item} className="mt-20 text-center">
                        <div className="inline-block p-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem]">
                            <div className="bg-white dark:bg-black rounded-[2.4rem] p-12 ">
                                <Award size={48} className="text-blue-600 mx-auto mb-6" />
                                <h3 className="text-3xl font-bold text-black dark:text-white mb-4">Become a Professor</h3>
                                <p className="text-neutral-500 max-w-lg mx-auto mb-8">
                                    Do you have knowledge to share? We are always looking for experienced mentors to join our ranks.
                                </p>
                                <Link href="/university/apply" className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold hover:scale-105 transition-transform">
                                    Apply as Faculty
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

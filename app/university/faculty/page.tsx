"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Plus, User, Award, Briefcase, Mic2, Users, Radio, PenTool, Hash, ShieldCheck } from "lucide-react";

const JOBS = [
    { id: "professor", title: "Professor", description: "Lead comprehensive courses on music production.", icon: Briefcase, color: "bg-blue-500" },
    { id: "mentor", title: "Mentor", description: "Guide students 1-on-1 with career advice.", icon: Users, color: "bg-purple-500" },
    { id: "engineer", title: "Sound Engineer", description: "Teach mixing and mastering arts.", icon: Mic2, color: "bg-orange-500" },
    { id: "visual_artist", title: "Visual Artist", description: "Instruct on design and branding.", icon: PenTool, color: "bg-pink-500" },
    { id: "scout", title: "A&R / Scout", description: "Recruit top-tier talent.", icon: Radio, color: "bg-green-500" },
    { id: "curriculum", title: "Curriculum Dev", description: "Design course materials.", icon: Hash, color: "bg-yellow-500" },
    { id: "event_manager", title: "Event Manager", description: "Organize campus showcases.", icon: Users, color: "bg-red-500" },
    { id: "guest_lecturer", title: "Guest Lecturer", description: "One-off masterclasses.", icon: Mic2, color: "bg-cyan-500" },
    { id: "technical_director", title: "Tech Director", description: "Manage digital infrastructure.", icon: Briefcase, color: "bg-indigo-500" },
    { id: "community_mod", title: "Community Mod", description: "Maintain student engagement.", icon: ShieldCheck, color: "bg-neutral-500" },
];

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
    const mentors = faculty.filter(f => f.role === 'mentor');
    // Capture everyone else (Professors, Sound Engineers, Visual Artists, etc.)
    const professors = faculty.filter(f => f.role !== 'leader' && f.role !== 'mentor');

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

                    {/* AVAILABLE POSITIONS */}
                    <motion.div variants={item} className="mt-32 border-t border-neutral-200 dark:border-white/5 pt-20">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest mb-4">
                                <Award size={14} /> Career Hub
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-6">
                                Join Our <span className="text-blue-600">Team</span>
                            </h2>
                            <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
                                We are looking for industry professionals to fill the following roles.
                                Apply today to shape the future of music education.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {JOBS.map((job, i) => (
                                <Link href="/university/apply/faculty" key={job.id} className="group block">
                                    <div className="h-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 p-8 rounded-[2rem] hover:border-blue-500/30 hover:shadow-xl transition-all relative overflow-hidden">
                                        <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center ${job.color} text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                            <job.icon size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-black dark:text-white mb-2 group-hover:text-blue-500 transition-colors">{job.title}</h3>
                                        <p className="text-neutral-500 text-xs leading-relaxed mb-4">{job.description}</p>
                                        <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold uppercase tracking-wider group-hover:text-blue-500 transition-colors">
                                            Apply <Plus size={12} />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

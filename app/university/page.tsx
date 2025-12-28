import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, Users, Globe, Zap, User } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

function LeadershipSection() {
    const [leaders, setLeaders] = useState<any[]>([]);

    useEffect(() => {
        const fetchLeaders = async () => {
            const q = query(
                collection(db, "university_professors"),
                where("role", "==", "leader"),
                orderBy("order", "asc"),
                limit(3)
            );
            const snap = await getDocs(q);
            setLeaders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        fetchLeaders();
    }, []);

    if (leaders.length === 0) return null;

    return (
        <section className="py-20 border-t border-neutral-200 dark:border-white/5">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 text-black dark:text-white">Leadership</h2>
                <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {leaders.map((prof, i) => (
                    <motion.div
                        key={prof.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="group text-center"
                    >
                        <div className="w-48 h-48 mx-auto rounded-full overflow-hidden mb-6 border-4 border-white dark:border-white/10 shadow-2xl relative">
                            {prof.image ? (
                                <img src={prof.image} alt={prof.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                            ) : (
                                <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"><User size={48} className="opacity-20" /></div>
                            )}
                        </div>
                        <h3 className="text-2xl font-bold text-black dark:text-white mb-1">{prof.name}</h3>
                        <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-3">{prof.title}</p>
                        <p className="text-neutral-500 text-sm max-w-xs mx-auto line-clamp-2">{prof.bio}</p>
                    </motion.div>
                ))}
            </div>

            <div className="text-center mt-12">
                <Link href="/university/faculty" className="text-neutral-500 hover:text-black dark:hover:text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
                    View All Faculty <ArrowRight size={14} />
                </Link>
            </div>
        </section>
    );
}

export default function UniversityPage() {
    return (
        <div className="container mx-auto px-6">

            {/* HERRO SECTION */}
            <section className="min-h-[80vh] flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8 relative"
                >
                    <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
                    <h1 className="relative text-6xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-black to-neutral-600 dark:from-white dark:to-neutral-500">
                        THE FUTURE OF<br />
                        <span className="text-blue-600 dark:text-blue-500">UNDERGROUND.</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl md:text-2xl text-neutral-600 dark:text-neutral-400 font-light leading-relaxed mb-12 max-w-2xl"
                >
                    A next-generation institution designed to discover, cultivate, and launch the world's most promising musical talent.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                    <Link href="/university/apply" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-blue-500/30 hover:scale-105 flex items-center justify-center gap-2">
                        Start Your Application
                        <ArrowRight size={20} />
                    </Link>
                    <Link href="/university/news" className="px-8 py-4 bg-white dark:bg-white/10 hover:bg-neutral-100 dark:hover:bg-white/20 text-black dark:text-white border border-neutral-200 dark:border-white/10 rounded-full font-bold text-lg transition-all flex items-center justify-center">
                        Explore News
                    </Link>
                </motion.div>
            </section>

            {/* LEADERSHIP SECTION (Dynamic) */}
            <LeadershipSection />

            {/* VISION GRID */}
            <section className="py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: <Star size={32} />, title: "Elite Mentorship", desc: "Learn directly from professors who have shaped the underground scene.", color: "bg-yellow-500" },
                        { icon: <Globe size={32} />, title: "Global Network", desc: "Connect with producers and artists from every corner of the world.", color: "bg-purple-500" },
                        { icon: <Zap size={32} />, title: "Instant Exposure", desc: "Top graduates get featured directly on KyeBeezy's main platform.", color: "bg-blue-500" }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="p-8 rounded-[2rem] bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/5 hover:border-black/5 dark:hover:border-white/20 hover:shadow-2xl transition-all duration-300 group"
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:rotate-12 transition-transform ${item.color}`}>
                                {item.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-black dark:text-white">{item.title}</h3>
                            <p className="text-neutral-500 leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* STATS BANNER */}
            <section className="py-20 my-20 rounded-[3rem] bg-black dark:bg-white text-white dark:text-black overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 dark:opacity-5 bg-[url('/noise.png')] mix-blend-overlay" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-around text-center gap-12 p-8">
                    {[
                        { number: "2025", label: "Classes Begin" },
                        { number: "10K+", label: "Applications" },
                        { number: "100%", label: "Scholarships" }
                    ].map((stat, i) => (
                        <div key={i}>
                            <div className="text-6xl md:text-8xl font-black mb-2 tracking-tighter">{stat.number}</div>
                            <div className="text-sm font-bold uppercase tracking-widest opacity-60">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
}

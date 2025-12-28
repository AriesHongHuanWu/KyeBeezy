"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { addDoc, collection, serverTimestamp, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Check, ChevronRight, Loader2, Sparkles, Zap, Crown } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type ApplicationForm = {
    type: "student";
    name: string;
    email: string;
    artistName: string;
    bandlabUrl: string;
    links: string;
    bio: string;
    major: string;
    experienceLevel: "rookie" | "upcoming" | "elite";
};

export default function ApplyPage() {
    const [step, setStep] = useState<"form" | "success">("form");
    const [isLoading, setIsLoading] = useState(false);
    const [majors, setMajors] = useState<any[]>([]);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ApplicationForm>({
        defaultValues: {
            type: "student",
            experienceLevel: "rookie"
        }
    });

    // Fetch Majors
    useEffect(() => {
        const fetchMajors = async () => {
            const q = query(collection(db, "university_departments"), orderBy("createdAt", "asc"));
            const snap = await getDocs(q);
            setMajors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        fetchMajors();
    }, []);

    const selectedLevel = watch("experienceLevel");

    const onSubmit = async (data: ApplicationForm) => {
        setIsLoading(true);
        try {
            await addDoc(collection(db, "university_applications"), {
                ...data,
                status: "pending",
                submittedAt: serverTimestamp()
            });
            setStep("success");
            toast.success("Application Submitted!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit application");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 max-w-3xl mt-12 mb-20">
            <header className="mb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-4">
                    Student Admission
                </h1>
                <p className="text-neutral-500 text-lg">
                    Define Your Legacy. Start Here.
                </p>
            </header>

            <AnimatePresence mode="wait">
                {step === "form" && (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-8 bg-white dark:bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-neutral-200 dark:border-white/5 shadow-2xl shadow-black/5"
                    >
                        {/* Personal Info */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 border-b border-neutral-100 dark:border-white/5 pb-2">Identify Yourself</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-neutral-500">Real Name</label>
                                    <input {...register("name", { required: true })} className="input-field-lg" placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-neutral-500">Artist Alias</label>
                                    <input {...register("artistName", { required: true })} className="input-field-lg" placeholder="Lil Kye" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500">Email Address</label>
                                <input {...register("email", { required: true, pattern: /^\S+@\S+$/i })} type="email" className="input-field-lg" placeholder="you@example.com" />
                            </div>
                        </div>

                        {/* Academics */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 border-b border-neutral-100 dark:border-white/5 pb-2">Academic Path</h3>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500">Intended Major</label>
                                <select {...register("major", { required: true })} className="input-field-lg cursor-pointer">
                                    <option value="" disabled selected>Select a Major...</option>
                                    {majors.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                    <option value="General Studies">General Studies (Undecided)</option>
                                </select>
                            </div>
                        </div>

                        {/* Experience Level */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 border-b border-neutral-100 dark:border-white/5 pb-2">Current Status</h3>

                            <div className="grid grid-cols-1 gap-4">
                                <label className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedLevel === 'rookie' ? 'border-blue-500 bg-blue-500/5' : 'border-neutral-200 dark:border-white/5 hover:border-blue-500/50'}`}>
                                    <input type="radio" value="rookie" {...register("experienceLevel")} className="mt-1" />
                                    <div>
                                        <div className="flex items-center gap-2 font-bold text-black dark:text-white mb-1"><Sparkles size={16} className="text-blue-500" /> Rookie</div>
                                        <p className="text-xs text-neutral-500">Just started. Less than 1 year of experience.</p>
                                    </div>
                                </label>

                                <label className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedLevel === 'upcoming' ? 'border-purple-500 bg-purple-500/5' : 'border-neutral-200 dark:border-white/5 hover:border-purple-500/50'}`}>
                                    <input type="radio" value="upcoming" {...register("experienceLevel")} className="mt-1" />
                                    <div>
                                        <div className="flex items-center gap-2 font-bold text-black dark:text-white mb-1"><Zap size={16} className="text-purple-500" /> Upcoming</div>
                                        <p className="text-xs text-neutral-500">2-3 Years in the game. Serious regarding music production.</p>
                                    </div>
                                </label>

                                <label className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedLevel === 'elite' ? 'border-yellow-500 bg-yellow-500/5' : 'border-neutral-200 dark:border-white/5 hover:border-yellow-500/50'}`}>
                                    <input type="radio" value="elite" {...register("experienceLevel")} className="mt-1" />
                                    <div>
                                        <div className="flex items-center gap-2 font-bold text-black dark:text-white mb-1"><Crown size={16} className="text-yellow-500" /> Elite</div>
                                        <p className="text-xs text-neutral-500">1K+ Followers on BandLab. Proven track record.</p>
                                    </div>
                                </label>
                            </div>
                        </div>


                        {/* Additional Info */}
                        <div className="space-y-4">
                            {/* BandLab URL - Specific Request */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500">BandLab Profile Link (Required)</label>
                                <input {...register("bandlabUrl", { required: true })} className="input-field-lg" placeholder="https://www.bandlab.com/username" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500">Other Portfolio Links (Optional)</label>
                                <textarea {...register("links")} rows={2} className="input-field-lg" placeholder="SoundCloud, Spotify, Instagram, etc..." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500">Self Introduction</label>
                                <textarea {...register("bio", { required: true })} rows={4} className="input-field-lg" placeholder="Who are you? What is your music journey? Why do you want to join?" />
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <>Submit Application <ChevronRight /></>}
                        </button>

                        <div className="text-center pt-4">
                            <Link href="/university/apply/faculty" className="text-xs font-bold text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                                Are you an educator? Apply to join the Faculty.
                            </Link>
                        </div>
                    </motion.form>
                )}

                {step === "success" && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center bg-white dark:bg-white/5 p-12 rounded-[2rem] border border-green-500/20"
                    >
                        <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={48} />
                        </div>
                        <h2 className="text-3xl font-bold mb-4 text-black dark:text-white">Application Received</h2>
                        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                            Welcome, candidate. Your journey to greatness begins now. We will review your <strong>{selectedLevel}</strong> application for the <strong>{watch('major')}</strong> program.
                        </p>
                        <Link href="/university" className="px-8 py-3 bg-neutral-100 dark:bg-white/10 rounded-full font-bold text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 transition-colors">
                            Back to Campus
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .input-field-lg {
                    @apply w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500 rounded-2xl p-4 outline-none transition-all font-medium;
                }
            `}</style>
        </div>
    );
}

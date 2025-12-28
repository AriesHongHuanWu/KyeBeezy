"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type ApplicationForm = {
    type: "professor";
    name: string;
    email: string;
    artistName?: string;
    links: string;
    bio: string;
    specialization: string;
};

export default function FacultyApplyPage() {
    const [step, setStep] = useState<"form" | "success">("form");
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<ApplicationForm>({
        defaultValues: { type: "professor" }
    });

    const onSubmit = async (data: ApplicationForm) => {
        setIsLoading(true);
        try {
            await addDoc(collection(db, "university_applications"), {
                ...data,
                status: "pending",
                submittedAt: serverTimestamp()
            });
            setStep("success");
            toast.success("Faculty Application Submitted!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit application");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-6 max-w-2xl mt-20">
            <header className="mb-12 text-center">
                <span className="text-purple-500 font-bold uppercase tracking-widest text-xs mb-2 block">Faculty Recruitment</span>
                <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white mb-4">
                    Join the Leadership
                </h1>
                <p className="text-neutral-500">
                    Apply to become a Professor or Mentor at BandLab University.
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
                        className="space-y-6 bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-neutral-200 dark:border-white/5"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Full Name</label>
                                <input {...register("name", { required: true })} className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-purple-500 rounded-xl p-4 outline-none transition-all" placeholder="Dr. Dre" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Artist Alias</label>
                                <input {...register("artistName", { required: true })} className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-purple-500 rounded-xl p-4 outline-none transition-all" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Email Address</label>
                                <input {...register("email", { required: true, pattern: /^\S+@\S+$/i })} type="email" className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-purple-500 rounded-xl p-4 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Specialization</label>
                                <input {...register("specialization", { required: true })} className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-purple-500 rounded-xl p-4 outline-none transition-all" placeholder="Mixing, Marketing, Vocals..." />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Portfolio & Credibility (Links)</label>
                            <textarea {...register("links", { required: true })} rows={3} className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-purple-500 rounded-xl p-4 outline-none transition-all" placeholder="SoundCloud, Spotify, Socials..." />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Teaching Philosophy</label>
                            <textarea {...register("bio", { required: true })} rows={5} className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-purple-500 rounded-xl p-4 outline-none transition-all" placeholder="Why do you want to teach?" />
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <>Submit Faculty Application <ChevronRight /></>}
                        </button>
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
                        <p className="text-neutral-500 mb-8">
                            We will review your credentials and get back to you.
                        </p>
                        <Link href="/university" className="px-8 py-3 bg-neutral-100 dark:bg-white/10 rounded-full font-bold text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 transition-colors">
                            Back to Campus
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

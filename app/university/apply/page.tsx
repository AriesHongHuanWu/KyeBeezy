"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Check, ChevronRight, Loader2, User, GraduationCap } from "lucide-react";
import { toast } from "sonner";

type ApplicationForm = {
    type: "student" | "professor";
    name: string;
    email: string;
    artistName?: string;
    links: string;
    bio: string;
    specialization?: string; // For professors
};

export default function ApplyPage() {
    const [step, setStep] = useState<"role" | "form" | "success">("role");
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ApplicationForm>({
        defaultValues: { type: "student" }
    });

    const selectedType = watch("type");

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
        <div className="container mx-auto px-6 max-w-2xl">
            <header className="mb-12 text-center">
                <h1 className="text-4xl md:text-6xl font-black text-black dark:text-white mb-4">
                    Apply Now
                </h1>
                <p className="text-neutral-500">
                    Take the first step towards your future in the underground.
                </p>
            </header>

            <AnimatePresence mode="wait">
                {step === "role" && (
                    <motion.div
                        key="role"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <button
                            onClick={() => { setValue("type", "student"); setStep("form"); }}
                            className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-8 rounded-3xl hover:border-black dark:hover:border-white hover:scale-[1.02] transition-all group text-left"
                        >
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <GraduationCap size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Student</h3>
                            <p className="text-neutral-500 text-sm">I want to learn, grow, and collaborate with other artists.</p>
                        </button>

                        <button
                            onClick={() => { setValue("type", "professor"); setStep("form"); }}
                            className="bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 p-8 rounded-3xl hover:border-purple-500 hover:scale-[1.02] transition-all group text-left"
                        >
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <User size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-black dark:text-white mb-2">Professor</h3>
                            <p className="text-neutral-500 text-sm">I have experience and want to mentor the next generation.</p>
                        </button>
                    </motion.div>
                )}

                {step === "form" && (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-6 bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-neutral-200 dark:border-white/5"
                    >
                        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-neutral-100 dark:border-white/5">
                            <button type="button" onClick={() => setStep("role")} className="text-neutral-400 hover:text-black dark:hover:text-white text-sm">
                                ← Back
                            </button>
                            <span className="bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                Applying as {selectedType}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Full Name</label>
                                <input {...register("name", { required: true })} className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500 rounded-xl p-4 outline-none transition-all" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Artist Name</label>
                                <input {...register("artistName", { required: true })} className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500 rounded-xl p-4 outline-none transition-all" placeholder="Lil Kye" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Email Address</label>
                            <input {...register("email", { required: true, pattern: /^\S+@\S+$/i })} type="email" className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500 rounded-xl p-4 outline-none transition-all" placeholder="you@example.com" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Links (SoundCloud, Spotify, IG)</label>
                            <textarea {...register("links", { required: true })} rows={3} className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500 rounded-xl p-4 outline-none transition-all" placeholder="Paste your URLs here..." />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Why do you want to join?</label>
                            <textarea {...register("bio", { required: true })} rows={5} className="w-full bg-neutral-100 dark:bg-black/50 border border-transparent focus:border-blue-500 rounded-xl p-4 outline-none transition-all" placeholder="Tell us about your goals and experience..." />
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <>Submit Application <ChevronRight /></>}
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
                            We have received your application. Our admissions team will review it shortly.
                            Keep an eye on your email for updates.
                        </p>
                        <button onClick={() => window.location.href = '/university'} className="px-8 py-3 bg-neutral-100 dark:bg-white/10 rounded-full font-bold text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 transition-colors">
                            Back to Campus
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

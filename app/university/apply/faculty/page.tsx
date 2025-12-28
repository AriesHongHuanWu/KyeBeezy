"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { addDoc, collection, serverTimestamp, query, where, getDocs, updateDoc, increment, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { Check, ChevronRight, Loader2, Lock, Upload, Key, AlertTriangle, ShieldCheck, Briefcase, Mic2, Users, Radio, PenTool, Hash } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

type FacultyForm = {
    type: "professor";
    name: string;
    email: string;
    links: string;
    bio: string;
    role: string;
    teachingStyle: string;
    keyId?: string;
};

// --- JOB DEFINITIONS ---
const JOBS = [
    {
        id: "professor",
        title: "Professor",
        description: "Lead comprehensive courses on music production, mixing, or marketing.",
        icon: Briefcase,
        color: "bg-blue-500",
        requirements: ["5+ Years Experience", "Published Discography", "Teaching Experience Preferred"]
    },
    {
        id: "mentor",
        title: "Mentor",
        description: "Guide students 1-on-1, providing feedback and career advice.",
        icon: Users,
        color: "bg-purple-500",
        requirements: ["Strong Communication Skills", "Active Industry Presence", "Patience"]
    },
    {
        id: "engineer",
        title: "Sound Engineer",
        description: "Teach the technical arts of mixing and mastering.",
        icon: Mic2,
        color: "bg-orange-500",
        requirements: ["Expert in DAW Workflow", "Acoustics Knowledge", "Portfolio of Mixed Tracks"]
    },
    {
        id: "visual_artist",
        title: "Visual Artist",
        description: "Instruct on cover art design, branding, and visual identity.",
        icon: PenTool,
        color: "bg-pink-500",
        requirements: ["Graphic Design Portfolio", "Brand Identity Experience"]
    },
    {
        id: "scout",
        title: "A&R / Scout",
        description: "Identify and recruit top-tier talent for the University.",
        icon: Radio,
        color: "bg-green-500",
        requirements: ["Deep Knowledge of Underground Scene", "Strong Network"]
    },
    {
        id: "curriculum",
        title: "Curriculum Developer",
        description: "Design the course structure and educational materials.",
        icon: Hash,
        color: "bg-yellow-500",
        requirements: ["Educational Background", "Structured Thinking"]
    },
    { id: "event_manager", title: "Event Manager", description: "Organize campus events and showcases.", icon: Users, color: "bg-red-500", requirements: ["Event Planning Exp.", "Logistics Management"] },
    { id: "guest_lecturer", title: "Guest Lecturer", description: "One-off masterclasses on specialized topics.", icon: Mic2, color: "bg-cyan-500", requirements: ["Industry Expert Status", "Unique Insight"] },
    { id: "technical_director", title: "Technical Director", description: "Manage the university's digital infrastructure.", icon: Briefcase, color: "bg-indigo-500", requirements: ["Systems Admin Exp.", "Web Development"] },
    { id: "community_mod", title: "Community Mod", description: "Maintain order and engagement in student channels.", icon: ShieldCheck, color: "bg-neutral-500", requirements: ["Discord/Community Mgmt", "Conflict Resolution"] },
];

export default function FacultyApplyPage() {
    const [step, setStep] = useState<"jobs" | "gate" | "form" | "success">("jobs");
    const [selectedJob, setSelectedJob] = useState<typeof JOBS[0] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [accessKey, setAccessKey] = useState("");
    const [validatedKeyId, setValidatedKeyId] = useState<string | null>(null);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<FacultyForm>({
        defaultValues: { type: "professor" }
    });

    const selectJob = (job: typeof JOBS[0]) => {
        setSelectedJob(job);
        setValue("role", job.title); // Pre-fill role
        setStep("gate");
    };

    // --- KEY VALIDATION ---
    const validateKey = async () => {
        if (!accessKey) return;
        setIsLoading(true);
        try {
            const q = query(collection(db, "university_access_keys"), where("key", "==", accessKey));
            const snap = await getDocs(q);

            if (snap.empty) {
                toast.error("Invalid Access Key");
                setIsLoading(false);
                return;
            }

            const keyData = snap.docs[0].data();
            const keyId = snap.docs[0].id;

            if (keyData.currentUses >= keyData.maxUses) {
                toast.error("This key has expired (Max uses reached)");
                setIsLoading(false);
                return;
            }

            setValidatedKeyId(keyId);
            setStep("form");
            toast.success("Access Granted.");
        } catch (error) {
            console.error(error);
            toast.error("Validation failed");
        } finally {
            setIsLoading(false);
        }
    };

    // --- PHOTO HANDLING ---
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image too large (Max 5MB)");
                return;
            }
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    // --- FORM SUBMISSION ---
    const onSubmit = async (data: FacultyForm) => {
        if (!photo) {
            toast.error("Profile photo is required");
            return;
        }

        setIsLoading(true);
        try {
            // 1. Upload Photo
            const storageRef = ref(storage, `university/faculty/${Date.now()}_${photo.name}`);
            await uploadBytes(storageRef, photo);
            const photoUrl = await getDownloadURL(storageRef);

            // 2. Submit Application
            await addDoc(collection(db, "university_applications"), {
                ...data,
                status: "pending",
                photoUrl,
                type: "professor", // Enforce type
                submittedAt: serverTimestamp(),
                usedKey: accessKey
            });

            // 3. Mark Key as Used
            if (validatedKeyId) {
                await updateDoc(doc(db, "university_access_keys", validatedKeyId), {
                    currentUses: increment(1)
                });
            }

            setStep("success");
            toast.success("Faculty Application Submitted!");
        } catch (error) {
            console.error(error);
            toast.error("Submission failed");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-white/10 focus:border-purple-500 rounded-2xl p-4 outline-none transition-all font-medium text-black dark:text-white placeholder:text-neutral-500";

    return (
        <div className="container mx-auto px-6 max-w-5xl mt-24 mb-20 min-h-[60vh] flex flex-col items-center justify-center">

            <AnimatePresence mode="wait">
                {/* --- STATE 1: JOB LIST --- */}
                {step === "jobs" && (
                    <motion.div
                        key="jobs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full"
                    >
                        <header className="text-center mb-16">
                            <h1 className="text-5xl md:text-7xl font-black text-black dark:text-white mb-6">
                                Join Our <span className="text-purple-600">Faculty</span>
                            </h1>
                            <p className="text-xl text-neutral-500 max-w-2xl mx-auto">
                                We are looking for visionaries to shape the next generation of musical talent.
                                Select a role to begin your application.
                            </p>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {JOBS.map((job, i) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => selectJob(job)}
                                    className="group cursor-pointer bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-8 rounded-[2rem] hover:border-purple-500/50 hover:shadow-2xl hover:scale-[1.02] transition-all relative overflow-hidden"
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity ${job.color}`} />

                                    <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center ${job.color} text-white shadow-lg`}>
                                        <job.icon size={28} />
                                    </div>

                                    <h3 className="text-2xl font-bold text-black dark:text-white mb-2">{job.title}</h3>
                                    <p className="text-neutral-500 text-sm mb-6 min-h-[40px]">{job.description}</p>

                                    <div className="space-y-2 mb-6">
                                        {job.requirements.slice(0, 2).map((req, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs font-bold text-neutral-400">
                                                <Check size={12} className="text-green-500" /> {req}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2 text-purple-600 font-bold text-sm group-hover:gap-3 transition-all">
                                        Apply Now <ChevronRight size={16} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* --- STATE 2: GATE STEP --- */}
                {step === "gate" && selectedJob && (
                    <motion.div
                        key="gate"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-10 rounded-[2rem] shadow-2xl text-center relative"
                    >
                        <button onClick={() => setStep("jobs")} className="absolute top-6 left-6 text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                            <ChevronRight className="rotate-180" size={24} />
                        </button>

                        <div className={`w-20 h-20 ${selectedJob.color} bg-opacity-10 text-purple-500 rounded-full flex items-center justify-center mx-auto mb-6`}>
                            <Lock size={32} />
                        </div>
                        <h1 className="text-2xl font-black text-black dark:text-white mb-2 uppercase tracking-wide">
                            {selectedJob.title} Access
                        </h1>
                        <p className="text-neutral-500 mb-8 max-w-xs mx-auto">
                            To apply for the <strong>{selectedJob.title}</strong> position, you need a valid faculty access key.
                        </p>

                        <div className="relative mb-6">
                            <input
                                type="text"
                                value={accessKey}
                                onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                                placeholder="ENTER-ACCESS-KEY"
                                className="w-full bg-neutral-100 dark:bg-black/50 border-2 border-dashed border-neutral-300 dark:border-white/20 rounded-xl p-4 text-center font-mono text-xl tracking-[0.2em] font-bold text-black dark:text-white uppercase focus:border-purple-500 focus:bg-purple-500/5 outline-none transition-all"
                            />
                        </div>

                        <button
                            onClick={validateKey}
                            disabled={!accessKey || isLoading}
                            className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <>Unlock Application <Key size={16} /></>}
                        </button>
                    </motion.div>
                )}

                {/* --- STATE 3: FORM STEP --- */}
                {step === "form" && selectedJob && (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        onSubmit={handleSubmit(onSubmit)}
                        className="w-full max-w-2xl bg-white dark:bg-neutral-900/80 backdrop-blur-md p-8 md:p-12 rounded-[2.5rem] border border-purple-500/20 shadow-2xl relative overflow-hidden"
                    >
                        <div className={`absolute top-0 left-0 w-full h-2 ${selectedJob.color}`} />

                        <header className="mb-10 flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-black text-black dark:text-white mb-1">Apply: {selectedJob.title}</h1>
                                <p className="text-neutral-500 text-sm">Submit your credentials for review.</p>
                            </div>
                            <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-green-500/20">
                                <ShieldCheck size={12} /> Verified
                            </div>
                        </header>

                        <div className="space-y-8">
                            {/* Photo Upload */}
                            <div className="flex flex-col items-center gap-4">
                                <label className="cursor-pointer group relative">
                                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 transition-all bg-neutral-100 dark:bg-neutral-800 ${photoPreview ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'border-neutral-200 dark:border-white/10 border-dashed group-hover:border-purple-400'}`}>
                                        {photoPreview ? (
                                            <img src={photoPreview} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 group-hover:text-purple-400">
                                                <Upload size={24} />
                                                <span className="text-[10px] font-bold uppercase mt-2">Upload Photo</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                    <div className="absolute bottom-0 right-0 bg-purple-500 p-2 rounded-full text-white shadow-lg scale-75 group-hover:scale-100 transition-transform">
                                        <Upload size={14} />
                                    </div>
                                </label>
                                <p className="text-xs text-neutral-500">Professional headshot required. Max 5MB.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-neutral-500 ml-1">Full Name</label>
                                    <input {...register("name", { required: true })} className={inputClass} placeholder="Dr. Dre (Just kidding)" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-neutral-500 ml-1">Target Role</label>
                                    <input value={selectedJob.title} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
                                    <input type="hidden" {...register("role")} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500 ml-1">Email Address</label>
                                <input {...register("email", { required: true })} type="email" className={inputClass} placeholder="faculty@bandlab.edu" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500 ml-1">Professional Links</label>
                                <input {...register("links")} className={inputClass} placeholder="LinkedIn, ArtStation, GitHub, etc." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500 ml-1">Teaching Philosophy & Bio</label>
                                <textarea {...register("bio", { required: true })} rows={4} className={inputClass} placeholder="Describe your experience and how you teach..." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-neutral-500 ml-1">Area of Specialization</label>
                                <input {...register("teachingStyle", { required: true })} className={inputClass} placeholder="e.g. Mixing, Mastering, Branding, Music Theory" />
                            </div>

                            <button
                                disabled={isLoading}
                                type="submit"
                                className={`w-full ${selectedJob.color} hover:opacity-90 text-white font-bold py-5 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 text-xl mt-4`}
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : <>Submit Application <ChevronRight /></>}
                            </button>
                        </div>
                    </motion.form>
                )}

                {/* --- STATE 4: SUCCESS STEP --- */}
                {step === "success" && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center bg-white dark:bg-neutral-900 p-12 rounded-[2rem] border border-green-500/20 shadow-2xl max-w-lg"
                    >
                        <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={48} />
                        </div>
                        <h2 className="text-3xl font-black mb-4 text-black dark:text-white">Application Received</h2>
                        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                            Thank you for applying to be a <strong>{selectedJob?.title}</strong>. We will review your portfolio shortly.
                        </p>
                        <Link href="/university" className="inline-block px-8 py-3 bg-neutral-100 dark:bg-white/10 rounded-full font-bold text-black dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 transition-colors">
                            Return to Campus
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

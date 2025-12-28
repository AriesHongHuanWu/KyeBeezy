"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import {
    GraduationCap, Users, Newspaper, Plus, Trash2, Check, X,
    MoreHorizontal, ChevronRight, User, FileText
} from "lucide-react";
import { format } from "date-fns";

export default function UniversityManager() {
    const [subTab, setSubTab] = useState<"applications" | "faculty" | "news" | "curriculum" | "library">("applications");

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-white mb-1">University Admin</h2>
                    <p className="text-neutral-500">Manage admission, faculty, and campus news.</p>
                </div>
                <div className="flex bg-neutral-900 p-1 rounded-xl">
                    {[
                        { id: "applications", icon: <Users size={16} />, label: "Applications" },
                        { id: "faculty", icon: <GraduationCap size={16} />, label: "Faculty" },
                        { id: "news", icon: <Newspaper size={16} />, label: "News" },
                        { id: "curriculum", icon: <FileText size={16} />, label: "Majors" },
                        { id: "library", icon: <FileText size={16} />, label: "Library" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === tab.id ? "bg-blue-600 text-white shadow-lg" : "text-neutral-400 hover:text-white"}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {subTab === "applications" && <ApplicationsPanel />}
                {subTab === "faculty" && <FacultyPanel />}
                {subTab === "news" && <NewsPanel />}
                {subTab === "curriculum" && <CurriculumPanel />}
                {subTab === "library" && <LibraryPanel />}
            </div>
        </motion.div>
    );
}

// --- SUB COMPONENTS ---

function ApplicationsPanel() {
    const [apps, setApps] = useState<any[]>([]);
    const [filter, setFilter] = useState<"all" | "student" | "professor">("all");

    useEffect(() => {
        const fetchApps = async () => {
            const q = query(collection(db, "university_applications"), orderBy("submittedAt", "desc"));
            const snap = await getDocs(q);
            setApps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        fetchApps();
    }, []);

    const updateStatus = async (id: string, status: string) => {
        try {
            await updateDoc(doc(db, "university_applications", id), { status });
            setApps(apps.map(a => a.id === id ? { ...a, status } : a));
            toast.success(`Application marked as ${status}`);
        } catch (e) { toast.error("Failed to update"); }
    };

    const deleteApp = async (id: string) => {
        if (!confirm("Delete this application?")) return;
        try {
            await deleteDoc(doc(db, "university_applications", id));
            setApps(apps.filter(a => a.id !== id));
            toast.success("Deleted");
        } catch (e) { toast.error("Failed to delete"); }
    }

    const filteredApps = filter === "all" ? apps : apps.filter(a => a.type === filter);

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                {["all", "student", "professor"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-1 rounded-full text-xs font-bold uppercase border ${filter === f ? "bg-white text-black border-white" : "border-white/10 text-neutral-500 hover:border-white/30"}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className="grid gap-4">
                {filteredApps.map(app => (
                    <div key={app.id} className="bg-neutral-900/50 border border-white/5 p-6 rounded-2xl group hover:bg-neutral-900 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${app.type === 'professor' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {app.type === 'professor' ? <GraduationCap size={20} /> : <User size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{app.name}</h3>
                                    <p className="text-neutral-500 text-xs font-mono">{app.email} • {app.artistName}</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${app.status === 'accepted' ? 'bg-green-500/20 text-green-500' : app.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                {app.status}
                            </div>
                        </div>

                        <div className="bg-black/30 p-4 rounded-xl mb-4 text-sm text-neutral-300 font-mono whitespace-pre-wrap">
                            <span className="text-neutral-600 block text-[10px] uppercase mb-1">Bio / Goals</span>
                            {app.bio}
                        </div>
                        <div className="bg-black/30 p-4 rounded-xl mb-6 text-xs text-blue-400 font-mono break-all">
                            <span className="text-neutral-600 block text-[10px] uppercase mb-1 text-white">Links</span>
                            {app.links}
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button onClick={() => deleteApp(app.id)} className="p-2 text-neutral-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                            {app.status === 'pending' && (
                                <>
                                    <button onClick={() => updateStatus(app.id, 'rejected')} className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg font-bold text-xs flex items-center gap-2">
                                        <X size={14} /> Reject
                                    </button>
                                    <button onClick={() => updateStatus(app.id, 'accepted')} className="px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg font-bold text-xs flex items-center gap-2">
                                        <Check size={14} /> Accept
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {filteredApps.length === 0 && <p className="text-neutral-600 text-center py-10">No applications found.</p>}
        </div>
    );
}

function FacultyPanel() {
    const [faculty, setFaculty] = useState<any[]>([]);
    const { register, handleSubmit, reset } = useForm();
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "university_professors"), orderBy("order", "asc"));
        getDocs(q).then(snap => setFaculty(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, [isAdding]);

    const onSubmit = async (data: any) => {
        try {
            await addDoc(collection(db, "university_professors"), {
                ...data,
                order: parseInt(data.order || "99"),
                createdAt: serverTimestamp()
            });
            toast.success("Professor Added");
            reset();
            setIsAdding(false);
        } catch (e) { toast.error("Failed"); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove faculty member?")) return;
        await deleteDoc(doc(db, "university_professors", id));
        setFaculty(faculty.filter(f => f.id !== id));
        toast.success("Removed");
    }

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button onClick={() => setIsAdding(!isAdding)} className="bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-neutral-200">
                    <Plus size={16} /> Add Faculty
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="bg-neutral-900 border border-white/10 p-6 rounded-2xl mb-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input {...register("name")} placeholder="Name" className="input-field" required />
                        <input {...register("title")} placeholder="Title (e.g. Dean of Audio)" className="input-field" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <select {...register("role")} className="input-field">
                            <option value="professor">Professor</option>
                            <option value="leader">Leadership (Homepage)</option>
                            <option value="mentor">Mentor/Assistant</option>
                        </select>
                        <input {...register("department")} placeholder="Department (e.g. Production)" className="input-field" />
                    </div>
                    <input {...register("image")} placeholder="Image URL (Square aspect ratio recommended)" className="input-field" required />
                    <textarea {...register("bio")} placeholder="Biography" className="input-field h-24" required />
                    <input {...register("order")} type="number" placeholder="Sort Order (1 = First)" className="input-field" />

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-neutral-400 text-sm">Cancel</button>
                        <button type="submit" className="bg-blue-600 px-6 py-2 rounded-lg text-white font-bold text-sm">Save</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faculty.map(prof => (
                    <div key={prof.id} className="bg-neutral-900/30 border border-white/5 p-4 rounded-xl flex gap-4 group">
                        <img src={prof.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-neutral-800" />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white truncate">{prof.name}</h4>
                            <p className="text-xs text-blue-400 font-bold uppercase">{prof.role || "Professor"} • {prof.title}</p>
                            <p className="text-xs text-neutral-500 line-clamp-1">{prof.bio}</p>
                        </div>
                        <button onClick={() => handleDelete(prof.id)} className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

function NewsPanel() {
    const [news, setNews] = useState<any[]>([]);
    const { register, handleSubmit, reset } = useForm();
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "university_news"), orderBy("publishedAt", "desc"));
        getDocs(q).then(snap => setNews(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, [isAdding]);

    const onSubmit = async (data: any) => {
        try {
            await addDoc(collection(db, "university_news"), {
                ...data,
                publishedAt: serverTimestamp(),
                author: "Admin"
            });
            toast.success("News Posted");
            reset();
            setIsAdding(false);
        } catch (e) { toast.error("Failed"); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete post?")) return;
        await deleteDoc(doc(db, "university_news", id));
        setNews(news.filter(n => n.id !== id));
        toast.success("Deleted");
    }

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button onClick={() => setIsAdding(!isAdding)} className="bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-neutral-200">
                    <Plus size={16} /> Post News
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="bg-neutral-900 border border-white/10 p-6 rounded-2xl mb-8 space-y-4">
                    <input {...register("title")} placeholder="News Title" className="input-field text-lg font-bold" required />
                    <textarea {...register("summary")} placeholder="Summary / Content" className="input-field h-32" required />
                    <input {...register("image")} placeholder="Cover Image URL" className="input-field" />

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-neutral-400 text-sm">Cancel</button>
                        <button type="submit" className="bg-green-600 px-6 py-2 rounded-lg text-white font-bold text-sm">Publish</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {news.map(item => (
                    <div key={item.id} className="bg-neutral-900/30 border border-white/5 p-4 rounded-xl flex gap-4 group">
                        <div className="w-24 h-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-white">{item.title}</h4>
                            <p className="text-xs text-neutral-500 line-clamp-2">{item.summary}</p>
                            <p className="text-[10px] text-neutral-600 mt-2">{item.publishedAt?.toDate ? format(item.publishedAt.toDate(), "MMM dd, yyyy") : "Just now"}</p>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity h-fit">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

function CurriculumPanel() {
    const [majors, setMajors] = useState<any[]>([]);
    const { register, handleSubmit, reset } = useForm();
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "university_departments"), orderBy("createdAt", "asc"));
        getDocs(q).then(snap => setMajors(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, [isAdding]);

    const onSubmit = async (data: any) => {
        try {
            await addDoc(collection(db, "university_departments"), {
                ...data,
                // Split courses by comma and trim
                courses: data.courseString.split(',').map((s: string) => s.trim()).filter(Boolean),
                createdAt: serverTimestamp()
            });
            toast.success("Major Added");
            reset();
            setIsAdding(false);
        } catch (e) { toast.error("Failed"); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete major?")) return;
        await deleteDoc(doc(db, "university_departments", id));
        setMajors(majors.filter(m => m.id !== id));
        toast.success("Deleted");
    }

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button onClick={() => setIsAdding(!isAdding)} className="bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-neutral-200">
                    <Plus size={16} /> Add Major
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="bg-neutral-900 border border-white/10 p-6 rounded-2xl mb-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input {...register("name")} placeholder="Major Name (e.g. Beat Making)" className="input-field" required />
                        <select {...register("icon")} className="input-field">
                            <option value="music">Music Icon</option>
                            <option value="mic">Mic Icon</option>
                            <option value="business">Business Icon</option>
                            <option value="radio">Radio Icon</option>
                        </select>
                    </div>
                    <textarea {...register("description")} placeholder="Description" className="input-field h-24" required />
                    <input {...register("color")} placeholder="Color Class (e.g. bg-pink-500) - Optional" className="input-field" />

                    <div>
                        <label className="text-xs text-neutral-500 uppercase font-bold mb-1 block">Courses (Comma Separated)</label>
                        <textarea {...register("courseString")} placeholder="Intro to FL Studio, Advanced Mixing, Mastering..." className="input-field" required />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-neutral-400 text-sm">Cancel</button>
                        <button type="submit" className="bg-blue-600 px-6 py-2 rounded-lg text-white font-bold text-sm">Save Major</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {majors.map(major => (
                    <div key={major.id} className="bg-neutral-900/30 border border-white/5 p-6 rounded-2xl group relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-2 h-full ${major.color || 'bg-white'}`} />
                        <div className="pl-6">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-white">{major.name}</h3>
                                <button onClick={() => handleDelete(major.id)} className="text-neutral-600 hover:text-red-500"><Trash2 size={18} /></button>
                            </div>
                            <p className="text-neutral-500 text-sm mb-4">{major.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {major.courses?.map((c: string, i: number) => (
                                    <span key={i} className="bg-white/5 border border-white/5 px-3 py-1 rounded-full text-xs text-neutral-300">{c}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function LibraryPanel() {
    const [resources, setResources] = useState<any[]>([]);
    const { register, handleSubmit, reset } = useForm();
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "university_resources"), orderBy("createdAt", "desc"));
        getDocs(q).then(snap => setResources(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, [isAdding]);

    const onSubmit = async (data: any) => {
        try {
            await addDoc(collection(db, "university_resources"), {
                ...data,
                createdAt: serverTimestamp()
            });
            toast.success("Resource Added");
            reset();
            setIsAdding(false);
        } catch (e) { toast.error("Failed"); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete resource?")) return;
        await deleteDoc(doc(db, "university_resources", id));
        setResources(resources.filter(r => r.id !== id));
        toast.success("Deleted");
    }

    return (
        <div>
            <div className="flex justify-end mb-6">
                <button onClick={() => setIsAdding(!isAdding)} className="bg-white text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-neutral-200">
                    <Plus size={16} /> Add Resource
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="bg-neutral-900 border border-white/10 p-6 rounded-2xl mb-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input {...register("title")} placeholder="Title (e.g. Trap Drum Kit Vol.1)" className="input-field" required />
                        <input {...register("category")} placeholder="Category (e.g. Drum Kit, Config)" className="input-field" required />
                    </div>
                    <input {...register("url")} placeholder="Download URL" className="input-field" required />
                    <input {...register("image")} placeholder="Preview Image URL" className="input-field" />
                    <div className="flex items-center gap-2">
                        <input {...register("isExclusive")} type="checkbox" id="exclusive" className="w-5 h-5 rounded bg-neutral-800 border-white/20" />
                        <label htmlFor="exclusive" className="text-sm font-bold text-neutral-400">Mark as Exclusive (Gold Lock)</label>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-neutral-400 text-sm">Cancel</button>
                        <button type="submit" className="bg-green-600 px-6 py-2 rounded-lg text-white font-bold text-sm">Add to Library</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {resources.map(res => (
                    <div key={res.id} className="bg-neutral-900/30 border border-white/5 p-4 rounded-xl group hover:border-blue-500/30 transition-colors">
                        <div className="aspect-square bg-neutral-800 rounded-lg mb-3 overflow-hidden relative">
                            {res.image && <img src={res.image} className="w-full h-full object-cover" />}
                            {res.isExclusive && <div className="absolute top-1 right-1 bg-yellow-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full">PRO</div>}
                        </div>
                        <h4 className="font-bold text-white text-sm truncate">{res.title}</h4>
                        <p className="text-xs text-neutral-500 mb-2">{res.category}</p>
                        <button onClick={() => handleDelete(res.id)} className="w-full py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-colors">
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

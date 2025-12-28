"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import {
    GraduationCap, Users, Newspaper, Plus, Trash2, Check, X,
    MoreHorizontal, ChevronRight, User, FileText,
    Crown, Zap, Sparkles, MonitorPlay, BookOpen, Library, Key
} from "lucide-react";
import { format } from "date-fns";
import { AccessKeyManager } from "./AccessKeyManager";

// ... (Theme aware updates for UniversityManager to be applied)
// Since the file is long and complex, I will apply these pattern replacements via a rewrite of the specific updated sections or the whole file if feasible. 
// Given the tool limits, I will rely on the tool to apply regex-like logic? No, this tool requires exact matches. 
// I will instead output the FULL updated function for `ApplicationsPanel` and `FacultyPanel` as they are the most visible ones, then `UniversityManager` shell.

// Actually, let's just use `replace_file_content` to swap the entire file content with the theme-fixed version.
// Wait, that's absurdly large for the prompt. I will just do the `FacultyPanel` and `ApplicationsPanel` in chunks.

// CHUNK 1: UniversityManager & ApplicationsPanel (Lines 17-306)
export default function UniversityManager() {
    const [subTab, setSubTab] = useState<"applications" | "faculty" | "news" | "curriculum" | "library" | "keys">("applications");

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-1">University Admin</h2>
                    <p className="text-neutral-500">Manage admission, faculty, and campus news.</p>
                </div>
                <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl">
                    {[
                        { id: "applications", icon: <Users size={16} />, label: "Applications" },
                        { id: "faculty", icon: <GraduationCap size={16} />, label: "Faculty" },
                        { id: "news", icon: <Newspaper size={16} />, label: "News" },
                        { id: "curriculum", icon: <FileText size={16} />, label: "Majors" },
                        { id: "library", icon: <Library size={16} />, label: "Library" },
                        { id: "keys", icon: <Key size={16} />, label: "Keys" },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSubTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${subTab === tab.id ? "bg-blue-600 text-white shadow-lg" : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"}`}
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
                {subTab === "keys" && <AccessKeyManager />}
            </div>
        </motion.div>
    );
}

function ApplicationsPanel() {
    const [apps, setApps] = useState<any[]>([]);
    const [typeFilter, setTypeFilter] = useState<"all" | "student" | "professor">("all");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");

    useEffect(() => {
        const fetchApps = async () => {
            const q = query(collection(db, "university_applications"), orderBy("submittedAt", "desc"));
            const snap = await getDocs(q);
            setApps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        fetchApps();
    }, []);

    const updateStatus = async (id: string, status: string, appData?: any) => {
        try {
            if (status === 'accepted' && appData?.type === 'professor') {
                await addDoc(collection(db, "university_professors"), {
                    name: appData.name,
                    title: appData.role || "Professor",
                    role: appData.role || "Professor",
                    department: appData.teachingStyle || "General",
                    image: appData.photoUrl || "https://placehold.co/400",
                    bio: appData.bio,
                    order: 99,
                    createdAt: serverTimestamp()
                });
                toast.success("Faculty profile created automatically!");
            }

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

    const filteredApps = apps.filter(a => {
        const typeMatch = typeFilter === "all" || a.type === typeFilter;
        const statusMatch = statusFilter === "all" || a.status === statusFilter;
        return typeMatch && statusMatch;
    });

    const stats = {
        total: apps.length,
        pending: apps.filter(a => a.status === 'pending').length,
        accepted: apps.filter(a => a.status === 'accepted').length
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 p-4 rounded-2xl">
                    <div className="text-neutral-500 text-xs font-bold uppercase mb-1">Total Applicants</div>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white">{stats.total}</div>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-yellow-500/20 p-4 rounded-2xl relative overflow-hidden">
                    <div className="text-yellow-600 dark:text-yellow-500 text-xs font-bold uppercase mb-1">Pending Review</div>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white">{stats.pending}</div>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-green-500/20 p-4 rounded-2xl">
                    <div className="text-green-600 dark:text-green-500 text-xs font-bold uppercase mb-1">Admitted</div>
                    <div className="text-2xl font-black text-neutral-900 dark:text-white">{stats.accepted}</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between bg-neutral-100 dark:bg-neutral-900/50 p-2 rounded-xl">
                <div className="flex gap-1">
                    {["all", "student", "professor"].map(f => (
                        <button
                            key={f}
                            onClick={() => setTypeFilter(f as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${typeFilter === f ? "bg-white dark:bg-white text-black shadow-lg" : "text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/5"}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1 border-l border-neutral-300 dark:border-white/5 pl-4 ml-4">
                    {["all", "pending", "accepted", "rejected"].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${statusFilter === s ? (s === 'pending' ? 'bg-yellow-500 text-black' : s === 'accepted' ? 'bg-green-500 text-white' : s === 'rejected' ? 'bg-red-500 text-white' : 'bg-neutral-700 text-white') : "text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-white/5"}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredApps.map(app => (
                    <div key={app.id} className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-xl overflow-hidden group hover:border-blue-500/30 transition-all">
                        <div className={`h-1 w-full ${app.status === 'accepted' ? 'bg-green-500' : app.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`} />

                        <div className="p-6 flex flex-col md:flex-row gap-6">
                            <div className="flex-shrink-0 flex flex-col items-center gap-3 md:w-32 text-center md:border-r border-neutral-200 dark:border-white/5 md:pr-6">
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden text-3xl font-black shadow-inner ${app.type === 'professor' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                    {app.photoUrl ? (
                                        <img src={app.photoUrl} alt={app.name} className="w-full h-full object-cover" />
                                    ) : (
                                        app.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1">{app.type}</div>
                                    <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${app.status === 'accepted' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500' : app.status === 'rejected' ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500' : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'}`}>
                                        {app.status}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight mb-1">{app.name}</h3>
                                        <div className="flex flex-wrap gap-2 text-sm text-neutral-500 dark:text-neutral-400 font-mono">
                                            <span>{app.artistName || app.role}</span>
                                            <span className="text-neutral-300 dark:text-neutral-700">•</span>
                                            <span>{app.email}</span>
                                        </div>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <div className="text-[10px] font-bold uppercase text-neutral-500 mb-1">Applied</div>
                                        <div className="text-xs text-neutral-400 font-mono">
                                            {app.submittedAt?.toDate ? format(app.submittedAt.toDate(), "MMM dd") : "Today"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {app.type === 'student' ? (
                                        <>
                                            {app.experienceLevel && (
                                                <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase flex items-center gap-2 ${app.experienceLevel === 'elite' ? 'bg-yellow-100 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/20 text-yellow-600 dark:text-yellow-500' :
                                                    app.experienceLevel === 'upcoming' ? 'bg-purple-100 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400' :
                                                        'bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400'
                                                    }`}>
                                                    {app.experienceLevel === 'elite' && <Crown size={12} />}
                                                    {app.experienceLevel === 'upcoming' && <Zap size={12} />}
                                                    {app.experienceLevel === 'rookie' && <Sparkles size={12} />}
                                                    {app.experienceLevel}
                                                </div>
                                            )}
                                            {app.major && (
                                                <div className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                                                    Major: <span className="text-neutral-900 dark:text-white">{app.major}</span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 font-bold uppercase">
                                                {app.role || app.specialization || "Professor"}
                                            </div>
                                            {app.teachingStyle && (
                                                <div className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/5 text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                                                    Style: <span className="text-neutral-900 dark:text-white">{app.teachingStyle}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-neutral-50 dark:bg-black/40 rounded-lg p-3 border border-neutral-200 dark:border-white/5">
                                        <div className="text-[9px] font-bold uppercase text-neutral-500 mb-1">Self Introduction</div>
                                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">{app.bio}</p>
                                    </div>

                                    {app.bandlabUrl && (
                                        <div className="bg-orange-50 dark:bg-orange-500/10 rounded-lg p-3 border border-orange-100 dark:border-orange-500/20 flex items-center gap-3 group/link hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors cursor-pointer" onClick={() => window.open(app.bandlabUrl, '_blank')}>
                                            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                                                <MonitorPlay size={16} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] font-bold uppercase text-orange-600 dark:text-orange-500 mb-0.5">BandLab Profile</div>
                                                <div className="text-sm text-neutral-900 dark:text-white font-bold truncate underline decoration-orange-500/50 group-hover:decoration-orange-500">
                                                    {app.bandlabUrl}
                                                </div>
                                            </div>
                                            <div className="text-orange-500 opacity-50 group-hover:opacity-100">
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    )}

                                    {app.links && (
                                        <div className="bg-neutral-50 dark:bg-black/40 rounded-lg p-3 border border-neutral-200 dark:border-white/5 flex items-start gap-2">
                                            <div className="mt-0.5 text-neutral-500"><FileText size={12} /></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] font-bold uppercase text-neutral-500 mb-1">Other Links</div>
                                                <a href={app.links.split(/\s+/)[0]} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block">
                                                    {app.links}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex md:flex-col gap-2 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-white/5 pt-4 md:pt-0 md:pl-6 justify-center">
                                {app.status === 'pending' && (
                                    <>
                                        <button onClick={() => updateStatus(app.id, 'accepted', app)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white dark:text-black font-bold text-xs rounded-lg hover:bg-green-400 transition-colors shadow-lg shadow-green-900/20">
                                            <Check size={14} /> Accept
                                        </button>
                                        <button onClick={() => updateStatus(app.id, 'rejected')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold text-xs rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white transition-colors">
                                            <X size={14} /> Reject
                                        </button>
                                        <div className="w-full h-px bg-neutral-200 dark:bg-white/5 my-1 hidden md:block" />
                                    </>
                                )}
                                <button onClick={() => deleteApp(app.id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 font-bold text-xs rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                    <Trash2 size={14} /> <span className="md:hidden">Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {filteredApps.length === 0 && <div className="text-center py-20 text-neutral-500">No applications found matching filters.</div>}
        </div>
    );
}

function FacultyPanel() {
    const [faculty, setFaculty] = useState<any[]>([]);
    const { register, handleSubmit, reset, setValue } = useForm();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "university_professors"), orderBy("order", "asc"));
        getDocs(q).then(snap => setFaculty(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    }, [isAdding, editingId]); // Refresh on change

    const onSubmit = async (data: any) => {
        try {
            const payload = {
                ...data,
                order: parseInt(data.order || "99"),
                updatedAt: serverTimestamp()
            };

            if (editingId) {
                await updateDoc(doc(db, "university_professors", editingId), payload);
                toast.success("Professor Updated");
            } else {
                await addDoc(collection(db, "university_professors"), {
                    ...payload,
                    createdAt: serverTimestamp()
                });
                toast.success("Professor Added");
            }

            reset();
            setIsAdding(false);
            setEditingId(null);
        } catch (e) { toast.error("Failed"); }
    };

    const handleEdit = (prof: any) => {
        setEditingId(prof.id);
        setIsAdding(true);
        setValue("name", prof.name);
        setValue("title", prof.title);
        setValue("role", prof.role);
        setValue("department", prof.department);
        setValue("image", prof.image);
        setValue("bio", prof.bio);
        setValue("order", prof.order);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove faculty member?")) return;
        await deleteDoc(doc(db, "university_professors", id));
        setFaculty(faculty.filter(f => f.id !== id));
        toast.success("Removed");
    }

    const cancelEdit = () => {
        setIsAdding(false);
        setEditingId(null);
        reset();
    };

    return (
        <div>
            <div className="flex justify-end mb-6">
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm hover:opacity-80 transition-opacity">
                        <Plus size={16} /> Add Faculty
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-6 rounded-2xl mb-8 space-y-4 relative">
                    <div className="absolute top-6 right-6 text-xs font-bold text-neutral-500 uppercase">
                        {editingId ? "Editing Function" : "New Entry"}
                    </div>
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
                        <button type="button" onClick={cancelEdit} className="px-4 py-2 text-neutral-500 text-sm hover:text-neutral-900 dark:hover:text-white">Cancel</button>
                        <button type="submit" className="bg-blue-600 px-6 py-2 rounded-lg text-white font-bold text-sm hover:bg-blue-500">
                            {editingId ? "Update Faculty" : "Save Faculty"}
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {faculty.map(prof => (
                    <div key={prof.id} className="bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5 p-4 rounded-xl flex gap-4 group hover:border-blue-500/30 transition-all">
                        <img src={prof.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-neutral-100 dark:bg-neutral-800" />
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-neutral-900 dark:text-white truncate">{prof.name}</h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase">{prof.role || "Professor"} • {prof.title}</p>
                            <p className="text-xs text-neutral-500 line-clamp-1">{prof.bio}</p>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(prof)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                                <FileText size={18} />
                            </button>
                            <button onClick={() => handleDelete(prof.id)} className="text-neutral-400 hover:text-red-500">
                                <Trash2 size={18} />
                            </button>
                        </div>
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
                <button onClick={() => setIsAdding(!isAdding)} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm hover:opacity-80 transition-opacity">
                    <Plus size={16} /> Post News
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-6 rounded-2xl mb-8 space-y-4">
                    <input {...register("title")} placeholder="News Title" className="input-field text-lg font-bold" required />
                    <textarea {...register("summary")} placeholder="Summary / Content" className="input-field h-32" required />
                    <input {...register("image")} placeholder="Cover Image URL" className="input-field" />

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-neutral-500 text-sm hover:text-neutral-900 dark:hover:text-white">Cancel</button>
                        <button type="submit" className="bg-green-600 px-6 py-2 rounded-lg text-white font-bold text-sm hover:bg-green-500">Publish</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {news.map(item => (
                    <div key={item.id} className="bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5 p-4 rounded-xl flex gap-4 group hover:border-blue-500/30 transition-all">
                        <div className="w-24 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image && <img src={item.image} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-neutral-900 dark:text-white">{item.title}</h4>
                            <p className="text-xs text-neutral-500 line-clamp-2">{item.summary}</p>
                            <p className="text-[10px] text-neutral-400 mt-2">{item.publishedAt?.toDate ? format(item.publishedAt.toDate(), "MMM dd, yyyy") : "Just now"}</p>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity h-fit">
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
                // Split multi-line or comma fields
                courses: data.courseString.split(',').map((s: string) => s.trim()).filter(Boolean),
                highlights: data.highlightString ? data.highlightString.split('\n').filter(Boolean) : [],
                activities: data.activityString ? data.activityString.split('\n').filter(Boolean) : [],
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

    const seedDefaults = async () => {
        if (!confirm("Overwrite with DETAILED default majors (Artist, Producer, Creator, Business)?")) return;

        // Comprehensive Curriculum Data
        const defaults = [
            {
                name: "Recording Artist",
                icon: "mic",
                description: "A complete 360° program designed to transform raw talent into a market-ready brand. Focuses on vocal mastery, songwriting, performance, and understanding the music business.",
                color: "bg-purple-600",
                courses: [
                    "Vocal Physiology & Health",
                    "Advanced Songwriting Structure",
                    "Lyricism & Metaphor",
                    "Stage Presence & Movement",
                    "Studio Recording Techniques",
                    "Personal Branding 101",
                    "Media Training & Interviews",
                    "Contract Negotiation Basics"
                ],
                highlights: [
                    "Release a professionally mixed debut EP",
                    "Headline the End-of-Year University Showcase",
                    "Develop a complete Electronic Press Kit (EPK)",
                    "Secure a feature with a verified artist"
                ],
                activities: [
                    "Weekly 'Tiny Desk' Style Assessments",
                    "Co-writing Camps with Producer Stream",
                    "Mock Label Meetings",
                    "Live Performance Reviews"
                ]
            },
            {
                name: "Music Producer",
                icon: "music",
                description: "Shape the sonic landscape. From sound design to mastering, this stream prepares you for the technical and creative demands of modern music production.",
                color: "bg-blue-600",
                courses: [
                    "Digital Audio Workstations (FL/Ableton)",
                    "Synthesis & Sound Design",
                    "Sampling History & Ethics",
                    "Advanced Mixing Techniques",
                    "Mastering for Streaming Services",
                    "Music Theory for Producers",
                    "Collaborative Production Workflow",
                    "Studio Acoustics & Hardware"
                ],
                highlights: [
                    "Produce 3 full tracks for Artist Stream students",
                    "Create and sell a custom Sample Pack",
                    "Win the Semester Beat Battle Championship",
                    "Placement credit on a University Release"
                ],
                activities: [
                    "48-Hour Beat Creation Challenges",
                    "Remix Contests",
                    "Signal Flow & Hardware Labs",
                    "Listening Parties & Critique Sessions"
                ]
            },
            {
                name: "Content Creator",
                icon: "radio",
                description: "Master the attention economy. Learn to shoot, edit, and strategize content that builds engaged communities and converts followers into superfans.",
                color: "bg-green-600",
                courses: [
                    "Short-Form Storytelling (TikTok/Reels)",
                    "Video Editing Mastery (Premiere/CapCut)",
                    "Algorithm Psychology & SEO",
                    "Graphic Design for Thumbnails",
                    "Livestream Setup & Showrunning",
                    "Community Management",
                    "Monetization Strategies",
                    "Crisis Management & PR"
                ],
                highlights: [
                    "Grow a channel to 10k engaged followers",
                    "Launch & monetize a weekly Podcast",
                    "Direct a Music Video for an Artist student",
                    "Secure first Brand Deal / Sponsorship"
                ],
                activities: [
                    "Daily Content Vlogs (30-Day Challenge)",
                    "Cross-Stream Collaboration Projects",
                    "Analytics Review & Strategy Pivots",
                    "Trend Forecasting Workshops"
                ]
            },
            {
                name: "Music Business",
                icon: "business",
                description: "The backbone of the industry. Understand royalties, copyright, artist management, and the future of music tech.",
                color: "bg-neutral-800",
                courses: [
                    "Copyright Law & Publishing",
                    "Artist Management Fundamentals",
                    "Tour Booking & Logistics",
                    "Streaming Economics",
                    "Marketing & Release Strategies",
                    "A&R (Artists and Repertoire)",
                    "Music Tech & AI Landscape",
                    "Financial Literacy for Creatives"
                ],
                highlights: [
                    "Manage a rollout for an Artist student",
                    "Draft a Standard 360 Deal Contract",
                    "Organize a Sold-Out Campus Event",
                    "Pitch a Music Tech Startup Idea"
                ],
                activities: [
                    "Mock Label Drafting Sessions",
                    "Event Planning Committee",
                    "Contract Review Clinics",
                    "Industry Networking Mixers"
                ]
            }
        ];

        try {
            // Optional: Clear existing defaults to avoid duplicates if user wants fresh start
            // For now, we just append/create new ones.
            for (const maj of defaults) {
                await addDoc(collection(db, "university_departments"), {
                    ...maj,
                    createdAt: serverTimestamp()
                });
            }
            toast.success("Detailed Curriculum Seeded!");
            setIsAdding(!isAdding); // Trigger refresh
        } catch (e) {
            toast.error("Failed to seed items.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    {majors.length > 0 && (
                        <button onClick={seedDefaults} className="text-neutral-500 hover:text-blue-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} /> Reset Presets
                        </button>
                    )}
                </div>

                <button onClick={() => setIsAdding(!isAdding)} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm hover:opacity-80 transition-opacity">
                    <Plus size={16} /> Add Major
                </button>
            </div>

            {majors.length === 0 && !isAdding && (
                <button onClick={seedDefaults} className="w-full py-12 border-2 border-dashed border-neutral-300 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 text-neutral-500 hover:text-blue-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all mb-8 group cursor-pointer">
                    <div className="bg-neutral-100 dark:bg-white/5 p-6 rounded-full group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-all">
                        <Sparkles size={32} className="text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="font-black text-xl text-neutral-900 dark:text-white mb-1">Database is Empty</h3>
                        <p className="text-sm font-medium">Click here to generate the 4 Default Majors instantly.</p>
                    </div>
                </button>
            )}

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-6 rounded-2xl mb-8 space-y-4">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-neutral-500 uppercase font-bold mb-1 block">Highlights (One per line)</label>
                            <textarea {...register("highlightString")} placeholder="Release a debut EP..." className="input-field h-32" />
                        </div>
                        <div>
                            <label className="text-xs text-neutral-500 uppercase font-bold mb-1 block">Activities (One per line)</label>
                            <textarea {...register("activityString")} placeholder="Weekly Open Mics..." className="input-field h-32" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-neutral-500 text-sm hover:text-neutral-900 dark:hover:text-white">Cancel</button>
                        <button type="submit" className="bg-blue-600 px-6 py-2 rounded-lg text-white font-bold text-sm hover:bg-blue-500">Save Major</button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {majors.map(major => (
                    <div key={major.id} className="bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5 p-6 rounded-2xl group relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-2 h-full ${major.color || 'bg-neutral-200 dark:bg-white'}`} />
                        <div className="pl-6">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">{major.name}</h3>
                                <button onClick={() => handleDelete(major.id)} className="text-neutral-400 hover:text-red-500"><Trash2 size={18} /></button>
                            </div>
                            <p className="text-neutral-500 text-sm mb-4">{major.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {major.courses?.slice(0, 5).map((c: string, i: number) => (
                                    <span key={i} className="bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/5 px-3 py-1 rounded-full text-xs text-neutral-600 dark:text-neutral-300">{c}</span>
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
                <button onClick={() => setIsAdding(!isAdding)} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 text-sm hover:opacity-80 transition-opacity">
                    <Plus size={16} /> Add Resource
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-6 rounded-2xl mb-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input {...register("title")} placeholder="Title (e.g. Trap Drum Kit Vol.1)" className="input-field" required />
                        <input {...register("category")} placeholder="Category (e.g. Drum Kit, Config)" className="input-field" required />
                    </div>
                    <input {...register("url")} placeholder="Download URL" className="input-field" required />
                    <input {...register("image")} placeholder="Preview Image URL" className="input-field" />
                    <div className="flex items-center gap-2">
                        <input {...register("isExclusive")} type="checkbox" id="exclusive" className="w-5 h-5 rounded bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-white/20" />
                        <label htmlFor="exclusive" className="text-sm font-bold text-neutral-600 dark:text-neutral-400">Mark as Exclusive (Gold Lock)</label>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-neutral-500 text-sm hover:text-neutral-900 dark:hover:text-white">Cancel</button>
                        <button type="submit" className="bg-green-600 px-6 py-2 rounded-lg text-white font-bold text-sm hover:bg-green-500">Add to Library</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {resources.map(res => (
                    <div key={res.id} className="bg-white dark:bg-neutral-900/30 border border-neutral-200 dark:border-white/5 p-4 rounded-xl group hover:border-blue-500/30 transition-colors">
                        <div className="aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-3 overflow-hidden relative">
                            {res.image && <img src={res.image} className="w-full h-full object-cover" />}
                            {res.isExclusive && <div className="absolute top-1 right-1 bg-yellow-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full">PRO</div>}
                        </div>
                        <h4 className="font-bold text-neutral-900 dark:text-white text-sm truncate">{res.title}</h4>
                        <p className="text-xs text-neutral-500 mb-2">{res.category}</p>
                        <button onClick={() => handleDelete(res.id)} className="w-full py-1.5 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-colors">
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

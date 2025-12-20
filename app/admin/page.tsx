"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Video, Music, Settings, Save, ExternalLink, GripVertical } from "lucide-react";
import { useForm } from "react-hook-form";

// Types
interface VideoItem {
    id: string;
    title: string;
    url: string;
    platform: "youtube" | "twitch";
    order: number;
}

interface MusicItem {
    id: string;
    title: string;
    embedCode: string; // iframe html
    order: number;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"videos" | "music" | "settings">("videos");

    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <div className="min-h-screen bg-black text-foreground font-sans">
            {/* Navbar */}
            <nav className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                        KYEBEEZY<span className="text-white ml-2 opacity-50 font-light">ADMIN</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-neutral-900/50 rounded-2xl p-2 border border-white/5 space-y-1">
                            <TabButton
                                active={activeTab === 'videos'}
                                onClick={() => setActiveTab('videos')}
                                icon={<Video size={18} />}
                                label="Stream Highlights"
                            />
                            <TabButton
                                active={activeTab === 'music'}
                                onClick={() => setActiveTab('music')}
                                icon={<Music size={18} />}
                                label="Music Embeds"
                            />
                            <TabButton
                                active={activeTab === 'settings'}
                                onClick={() => setActiveTab('settings')}
                                icon={<Settings size={18} />}
                                label="Global Settings"
                            />
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1">
                        <AnimatePresence mode="wait">
                            {activeTab === 'videos' && <VideosManager key="videos" />}
                            {activeTab === 'music' && <MusicManager key="music" />}
                            {activeTab === 'settings' && <SettingsManager key="settings" />}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
}

// --- Components ---

function TabButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${active
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
        >
            {icon}
            {label}
        </button>
    )
}

function VideosManager() {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const { register, handleSubmit, reset } = useForm();
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoItem));
            setVideos(data);
        });
        return () => unsubscribe();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            await addDoc(collection(db, "videos"), {
                ...data,
                createdAt: new Date(),
                platform: data.url.includes('twitch') ? 'twitch' : 'youtube' // Simple detection
            });
            toast.success("Video added successfully");
            reset();
            setIsAdding(false);
        } catch (e) {
            toast.error("Failed to add video");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteDoc(doc(db, "videos", id));
            toast.success("Video deleted");
        } catch (e) {
            toast.error("Delete failed");
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-outfit">Stream Highlights</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-neutral-200 transition-colors"
                >
                    <Plus size={18} /> Add New
                </button>
            </div>

            {isAdding && (
                <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold mb-4">Add New Video</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input {...register("title", { required: true })} placeholder="Video Title" className="input-field" />
                            <input {...register("url", { required: true })} placeholder="YouTube/Twitch URL" className="input-field" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-neutral-400 hover:text-white">Cancel</button>
                            <button type="submit" className="bg-purple-600 px-6 py-2 rounded-lg text-white font-bold hover:bg-purple-500">Save Video</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {videos.map((video) => (
                    <div key={video.id} className="bg-neutral-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-neutral-500">
                                <Video size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{video.title}</h4>
                                <a href={video.url} target="_blank" className="text-sm text-purple-400 hover:underline flex items-center gap-1">
                                    {video.url} <ExternalLink size={10} />
                                </a>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(video.id)} className="p-2 text-neutral-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function MusicManager() {
    const [tracks, setTracks] = useState<MusicItem[]>([]);
    const { register, handleSubmit, reset } = useForm();
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "music"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MusicItem));
            setTracks(data);
        });
        return () => unsubscribe();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            await addDoc(collection(db, "music"), {
                ...data,
                createdAt: new Date(),
            });
            toast.success("Track added");
            reset();
            setIsAdding(false);
        } catch (e) {
            toast.error("Failed to add track");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteDoc(doc(db, "music", id));
            toast.success("Track deleted");
        } catch (e) {
            toast.error("Delete failed");
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-outfit">Music Embeds</h2>
                <button onClick={() => setIsAdding(!isAdding)} className="bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-neutral-200">
                    <Plus size={18} /> Add Track
                </button>
            </div>

            {isAdding && (
                <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-bold mb-4">Add Bandlab/Soundcloud</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <input {...register("title", { required: true })} placeholder="Track Title" className="input-field w-full" />
                        <textarea {...register("embedCode", { required: true })} rows={4} placeholder="<iframe> Embed Code" className="input-field w-full font-mono text-xs" />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-neutral-400 hover:text-white">Cancel</button>
                            <button type="submit" className="bg-blue-600 px-6 py-2 rounded-lg text-white font-bold hover:bg-blue-500">Save Track</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {tracks.map((track) => (
                    <div key={track.id} className="bg-neutral-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-neutral-500">
                                <Music size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{track.title}</h4>
                                <p className="text-xs text-neutral-500 font-mono truncate max-w-xs">{track.embedCode}</p>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(track.id)} className="p-2 text-neutral-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function SettingsManager() {
    return (
        <div className="text-center py-20 text-neutral-500">
            <Settings size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Global Settings</h3>
            <p>Coming soon: Toggle sections, update bio, and more.</p>
        </div>
    )
}

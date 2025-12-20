"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, setDoc, writeBatch, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LogOut, Plus, Trash2, Video, Music, Settings, Users, ShieldCheck, User as UserIcon, ShoppingBag, Database, Pencil, X, Trophy, MonitorPlay } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";

// --- Types ---
interface VideoItem { id: string; title: string; url: string; platform: "youtube" | "twitch"; order: number; }
interface MusicItem { id: string; title: string; embedCode: string; order: number; }
interface AdminUser { email: string; createdAt: any; }
interface ProductItem {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
    tag: string;
    tagColor: string;
    gradient: string;
    glowColor: string;
    hoverText: string;
    buttonText: string;
    buttonColor: string;
    order: number;
}

const SUPER_ADMIN = "arieswu001@gmail.com";

// --- Default Data for Seeding ---
const defaultVideos = [
    { title: "Current Stream", url: "https://www.twitch.tv/realkyebeezylive", platform: "twitch", order: 1 },
    { title: "Latest Highlight", url: "https://www.youtube.com/watch?v=7UN_eYHLssE", platform: "youtube", order: 2 }
];

const defaultMusic = [
    { title: "Latest Heat", embedCode: '<iframe src="https://www.bandlab.com/embed/?id=7d44e991-08cf-f011-8196-000d3a96100f&blur=true" width="100%" height="450" frameborder="0" allowfullscreen></iframe>', order: 1 },
    { title: "Night Vibes", embedCode: '<iframe src="https://www.bandlab.com/embed/?id=2f1287da-399e-f011-8e64-6045bd354e91&blur=true" width="100%" height="450" frameborder="0" allowfullscreen></iframe>', order: 2 },
    { title: "Studio Sessions", embedCode: '<iframe src="https://www.bandlab.com/embed/?id=bcdc5788-3f63-f011-8dc9-000d3a960be3&blur=true" width="100%" height="450" frameborder="0" allowfullscreen></iframe>', order: 3 }
];

const defaultProducts = [
    {
        id: "chefs-choice",
        title: "Chef's Choice Energy Tub",
        description: "Can't decide? Let us surprise you! The staff picks a flavor they think you'll love.",
        image: "/dubby/chef-choice.png",
        link: "https://www.dubby.gg/products/chefs-choice-energy-tub-we-surprise-you?ref=gvqslrbj",
        tag: "MYSTERY FLAVOR",
        tagColor: "bg-purple-500",
        gradient: "from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20",
        glowColor: "rgba(168,85,247,0.5)",
        hoverText: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
        buttonText: "GET SURPRISED",
        buttonColor: "text-purple-600 dark:text-purple-400",
        order: 1
    },
    {
        id: "hydro-sampler",
        title: "Hydro Sampler Pack",
        description: "6 caffeine-free refreshing drinks. Hydrate with flavor and electrolytes.",
        image: "/dubby/hydro-sampler.png",
        link: "https://www.dubby.gg/products/hydro-sampler-pack-6-caffeine-free-drinks?ref=gvqslrbj",
        tag: "CAFFEINE FREE",
        tagColor: "bg-blue-500",
        gradient: "from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20",
        glowColor: "rgba(59,130,246,0.5)",
        hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
        buttonText: "HYDRATE NOW",
        buttonColor: "text-blue-600 dark:text-blue-400",
        order: 2
    },
    {
        id: "pushin-punch",
        title: "Pushin Punch",
        description: "A refreshing fruit punch kick. The perfect daily driver without the crash.",
        image: "/dubby/PushinPunch_Front.png",
        link: "https://www.dubby.gg/products/pushin-punch-energy-drink-tub?ref=gvqslrbj",
        tag: "BEST SELLER",
        tagColor: "bg-red-500",
        gradient: "from-red-500/10 to-orange-500/10 dark:from-red-900/20 dark:to-orange-900/20",
        glowColor: "rgba(239,68,68,0.5)",
        hoverText: "group-hover:text-red-600 dark:group-hover:text-red-400",
        buttonText: "GET PUNCHED",
        buttonColor: "text-red-600 dark:text-red-400",
        order: 3
    },
    {
        id: "japanese-soda",
        title: "Japanese Soda",
        description: "Sweet, bubbly, and unique. Experience the iconic Ramune flavor with a kick.",
        image: "/dubby/Dubby_JapaneseSoda_Front.png",
        link: "https://www.dubby.gg/products/japanese-soda-flavor-energy-drink-tub?ref=gvqslrbj",
        tag: "FAN FAVORITE",
        tagColor: "bg-pink-500",
        gradient: "from-pink-500/10 to-cyan-500/10 dark:from-pink-900/20 dark:to-cyan-900/20",
        glowColor: "rgba(236,72,153,0.5)",
        hoverText: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
        buttonText: "TASTE JAPAN",
        buttonColor: "text-pink-600 dark:text-pink-400",
        order: 4
    },
    {
        id: "grandmas-lemonade",
        title: "Grandma's Lemonade",
        description: "Classic, tart, and sweet. The ultimate caffeine-free hydration refresher.",
        image: "/dubby/gRandma_lemon.png",
        link: "https://www.dubby.gg/products/grandmas-lemonade-hydro-hydration-drink-tub-caffeine-free?ref=gvqslrbj",
        tag: "CAFFEINE FREE",
        tagColor: "bg-yellow-500",
        gradient: "from-yellow-500/10 to-green-500/10 dark:from-yellow-900/20 dark:to-green-900/20",
        glowColor: "rgba(234,179,8,0.5)",
        hoverText: "group-hover:text-yellow-600 dark:group-hover:text-yellow-400",
        buttonText: "GET LEMONADE",
        buttonColor: "text-yellow-600 dark:text-yellow-400",
        order: 5
    },
    {
        id: "smores",
        title: "Smores Flavor",
        description: "Toasted marshmallow and chocolate. A campfire treat in a tub.",
        image: "/dubby/Dubby_Smores_Front.png",
        link: "https://www.dubby.gg/products/smores-flavor-energy-drink-tub?ref=gvqslrbj",
        tag: "LIMITED EDITION",
        tagColor: "bg-orange-600",
        gradient: "from-orange-600/10 to-amber-600/10 dark:from-orange-900/20 dark:to-amber-900/20",
        glowColor: "rgba(234,88,12,0.5)",
        hoverText: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
        buttonText: "GET TOASTY",
        buttonColor: "text-orange-600 dark:text-orange-400",
        order: 6
    }
];

// --- Settings Manager (NEW) ---
function SettingsManager() {
    const [settings, setSettings] = useState<any>({ showAwardsWinners: false, isLiveActive: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Doc: settings/config
        const unsub = onSnapshot(doc(db, "settings", "config"), (docSnap) => {
            if (docSnap.exists()) {
                setSettings(docSnap.data());
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const toggleSetting = async (key: string) => {
        try {
            const newVal = !settings[key];
            await setDoc(doc(db, "settings", "config"), { ...settings, [key]: newVal }, { merge: true });
            toast.success(`Setting '${key}' updated to ${newVal ? 'ON' : 'OFF'}`);
        } catch (e) {
            toast.error("Failed to update settings");
        }
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <SectionHeader
                title="System Settings"
                subtitle="Global configuration for the website."
                action={<div />}
            />

            <div className="bg-neutral-900/30 border border-white/5 p-6 rounded-2xl space-y-4">
                {/* Winners Reveal Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${settings?.showAwardsWinners ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-neutral-400'}`}>
                            <Trophy size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Awards: Reveal Winners</h4>
                            <p className="text-sm text-neutral-500">
                                {settings?.showAwardsWinners
                                    ? "Winners are currently VISIBLE to the public."
                                    : "Winners are users HIDDEN. Only 'Vote Now' is shown."}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => toggleSetting('showAwardsWinners')}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-black ${settings?.showAwardsWinners ? 'bg-yellow-500' : 'bg-neutral-700'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings?.showAwardsWinners ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="h-px bg-white/10 w-full" />

                {/* Live Ceremony Toggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${settings?.isLiveActive ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-neutral-400'}`}>
                            <MonitorPlay size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Awards: Live Ceremony</h4>
                            <p className="text-sm text-neutral-500">
                                {settings?.isLiveActive
                                    ? "Live Page is ACTIVE. Streamers can start."
                                    : "Live Page is LOCKED in 'Waiting Room' state."}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => toggleSetting('isLiveActive')}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black ${settings?.isLiveActive ? 'bg-red-500' : 'bg-neutral-700'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings?.isLiveActive ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// --- Main Dashboard Component --- (Updated)
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"videos" | "music" | "products" | "admins" | "settings">("videos");
    const { user } = useAuth();

    const handleLogout = () => { signOut(auth); };

    return (
        <div className="min-h-screen bg-black text-foreground font-sans selection:bg-purple-500/30">
            {/* Top Navigation Bar */}
            <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl tracking-tight text-white leading-none">KYEBEEZY<span className="text-purple-400">.ADMIN</span></h1>
                            <p className="text-xs text-neutral-500 font-mono mt-1">V2.2.0 • ACCESS GRANTED</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-3 bg-white/5 py-2 px-4 rounded-full border border-white/5">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" />
                            ) : (
                                <UserIcon className="w-5 h-5 text-neutral-400" />
                            )}
                            <span className="text-sm font-medium text-neutral-300">{user?.displayName || user?.email}</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="group relative px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 transition-all duration-300 overflow-hidden"
                        >
                            <div className="relative z-10 flex items-center gap-2 text-sm font-bold">
                                <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                            </div>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <aside className="lg:w-72 flex-shrink-0">
                        <div className="sticky top-28 space-y-8">
                            <div className="bg-neutral-900/40 backdrop-blur-md rounded-3xl p-4 border border-white/5 shadow-2xl">
                                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-4 mb-2">Content</p>
                                <div className="space-y-1">
                                    <TabButton active={activeTab === 'videos'} onClick={() => setActiveTab('videos')} icon={<Video size={20} />} label="Stream Highlights" />
                                    <TabButton active={activeTab === 'music'} onClick={() => setActiveTab('music')} icon={<Music size={20} />} label="Music Embeds" />
                                    <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')} icon={<ShoppingBag size={20} />} label="Dubby Products" />
                                </div>

                                <div className="my-4 h-px bg-white/5 mx-4" />

                                <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-4 mb-2">System</p>
                                <div className="space-y-1">
                                    <TabButton active={activeTab === 'admins'} onClick={() => setActiveTab('admins')} icon={<Users size={20} />} label="Manage Admins" />
                                    <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} label="Global Settings" />
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-3xl p-6 border border-white/5">
                                <h3 className="text-white font-bold mb-1">System Status</h3>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-green-400 font-mono">ONLINE</span>
                                </div>
                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    Database connection is active. All systems operational.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            {activeTab === 'videos' && <VideosManager key="videos" />}
                            {activeTab === 'music' && <MusicManager key="music" />}
                            {activeTab === 'products' && <ProductsManager key="products" />}
                            {activeTab === 'admins' && <AdminsManager key="admins" currentUser={user?.email || ''} />}
                            {activeTab === 'settings' && <SettingsManager key="settings" />}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </div>
    );
}

// --- Helper Components ---

function TabButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 font-medium group relative overflow-hidden ${active
                ? 'bg-white text-black shadow-lg shadow-white/10 scale-[1.02]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <span className={`relative z-10 ${active ? 'text-black' : 'group-hover:scale-110 transition-transform duration-300'}`}>{icon}</span>
            <span className="relative z-10">{label}</span>
        </button>
    )
}

function SectionHeader({ title, subtitle, action }: any) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h2 className="text-3xl font-black font-outfit text-white mb-1">{title}</h2>
                <p className="text-neutral-500">{subtitle}</p>
            </div>
            {action}
        </div>
    )
}

function VideosManager() {
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const { register, handleSubmit, reset } = useForm();
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoItem)));
        });
        return () => unsubscribe();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            await addDoc(collection(db, "videos"), { ...data, createdAt: new Date() });
            toast.success("Video added successfully");
            reset(); setIsAdding(false);
        } catch (e) { toast.error("Failed to add video"); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this video?")) return;
        try {
            await deleteDoc(doc(db, "videos", id));
            toast.success("Video deleted");
        } catch (e) { toast.error("Failed to delete video"); }
    };

    const handleSeed = async () => {
        if (!confirm("⚠️ WARNING: This will DELETE ALL current videos and restore the defaults. Continue?")) return;
        try {
            // 1. Delete all existing videos
            const snapshot = await getDocs(collection(db, "videos"));

            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // 2. Add defaults
            const addBatch = writeBatch(db);
            defaultVideos.forEach(v => {
                const docRef = doc(collection(db, "videos"));
                addBatch.set(docRef, { ...v, createdAt: new Date() });
            });
            await addBatch.commit();

            toast.success("Reset to default videos");
        } catch (e) {
            console.error(e);
            toast.error("Reset failed");
        }
    }

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <SectionHeader
                title="Stream Highlights"
                subtitle="Manage YouTube and Twitch content."
                action={
                    <div className="flex gap-2">
                        <button onClick={handleSeed} className="bg-red-500/10 text-red-500 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-500/20 transition-all border border-red-500/10">
                            <Database size={18} /> Reset Defaults
                        </button>
                        <button onClick={() => setIsAdding(!isAdding)} className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-200 transition-all hover:scale-105 shadow-lg shadow-white/10">
                            <Plus size={20} /> Add New
                        </button>
                    </div>
                }
            />

            {isAdding && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 mb-8 overflow-hidden">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input {...register("title")} placeholder="Video Title" className="input-field" required />
                            <input {...register("url")} placeholder="Video URL" className="input-field" required />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-neutral-400 hover:text-white">Cancel</button>
                            <button type="submit" className="bg-purple-600 px-8 py-2 rounded-xl text-white font-bold hover:bg-purple-500">Save</button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="grid gap-4">
                {videos.map((video) => (
                    <div key={video.id} className="bg-neutral-900/30 border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-purple-500/30 hover:bg-neutral-900/50 transition-all duration-300">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-purple-400 group-hover:scale-110 transition-all">
                                <Video size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{video.title}</h4>
                                <p className="text-sm text-neutral-500 truncate max-w-md">{video.url}</p>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(video.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={20} />
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
            setTracks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MusicItem)));
        });
        return () => unsubscribe();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            await addDoc(collection(db, "music"), { ...data, createdAt: new Date() });
            toast.success("Track added");
            reset(); setIsAdding(false);
        } catch (e) { toast.error("Error adding track"); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this track?")) return;
        try {
            await deleteDoc(doc(db, "music", id));
            toast.success("Track deleted");
        } catch (e) { toast.error("Failed to delete track"); }
    };

    const handleSeed = async () => {
        if (!confirm("⚠️ WARNING: This will DELETE ALL current music and restore the defaults. Continue?")) return;
        try {
            // Delete current
            const snapshot = await getDocs(collection(db, "music"));
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // Add defaults
            const addBatch = writeBatch(db);
            defaultMusic.forEach(t => {
                const docRef = doc(collection(db, "music"));
                addBatch.set(docRef, { ...t, createdAt: new Date() });
            });
            await addBatch.commit();
            toast.success("Reset to default music");
        } catch (e) { toast.error("Reset failed"); }
    }

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <SectionHeader
                title="Music Embeds"
                subtitle="Manage BandLab & SoundCloud players."
                action={
                    <div className="flex gap-2">
                        <button onClick={handleSeed} className="bg-red-500/10 text-red-500 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-500/20 transition-all border border-red-500/10">
                            <Database size={18} /> Reset Defaults
                        </button>
                        <button onClick={() => setIsAdding(!isAdding)} className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-200 transition-all hover:scale-105 shadow-lg shadow-white/10">
                            <Plus size={20} /> Add New
                        </button>
                    </div>
                }
            />

            {isAdding && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 mb-8 overflow-hidden">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <input {...register("title")} placeholder="Track Title" className="input-field" required />
                        <textarea {...register("embedCode")} rows={4} placeholder="<iframe> code here..." className="input-field font-mono text-xs" required />
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-neutral-400 hover:text-white">Cancel</button>
                            <button type="submit" className="bg-blue-600 px-8 py-2 rounded-xl text-white font-bold hover:bg-blue-500">Save</button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="grid gap-4">
                {tracks.map((track) => (
                    <div key={track.id} className="bg-neutral-900/30 border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 hover:bg-neutral-900/50 transition-all duration-300">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-blue-400 group-hover:scale-110 transition-all">
                                <Music size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{track.title}</h4>
                                <p className="text-xs text-neutral-500 font-mono truncate max-w-xs">{track.embedCode.substring(0, 50)}...</p>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(track.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}



function ProductsManager() {
    const [products, setProducts] = useState<ProductItem[]>([]);
    const { register, handleSubmit, reset, setValue } = useForm();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "products"), orderBy("order", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductItem)));
        });
        return () => unsubscribe();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            if (editingId) {
                await updateDoc(doc(db, "products", editingId), data);
                toast.success("Product updated");
                setEditingId(null);
            } else {
                await addDoc(collection(db, "products"), { ...data, order: products.length + 1 });
                toast.success("Product added");
            }
            reset();
            setIsAdding(false);
        } catch (e) { toast.error("Error saving product"); }
    };

    const handleEdit = (product: ProductItem) => {
        setEditingId(product.id);
        setIsAdding(true);
        // Populate form
        setValue("title", product.title);
        setValue("tag", product.tag);
        setValue("description", product.description);
        setValue("image", product.image);
        setValue("link", product.link);
        setValue("tagColor", product.tagColor);
        setValue("gradient", product.gradient);
        setValue("glowColor", product.glowColor);
        setValue("buttonColor", product.buttonColor);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        reset();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this product?")) return;
        try {
            await deleteDoc(doc(db, "products", id));
            toast.success("Product deleted");
        } catch (e) { toast.error("Failed to delete product"); }
    }

    const handleSeed = async () => {
        if (!confirm("⚠️ WARNING: This will DELETE ALL current products and restore the defaults. Continue?")) return;
        try {
            // Delete current
            const snapshot = await getDocs(collection(db, "products"));
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // Add defaults
            const addBatch = writeBatch(db);
            defaultProducts.forEach(p => {
                const docRef = doc(collection(db, "products"));
                addBatch.set(docRef, p);
            });
            await addBatch.commit();
            toast.success("Reset to default products");
        } catch (e) { toast.error("Reset failed"); }
    }

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <SectionHeader
                title="Dubby Products"
                subtitle="Manage your affiliate product showcase."
                action={
                    <div className="flex gap-2">
                        <button onClick={handleSeed} className="bg-red-500/10 text-red-500 px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-red-500/20 transition-all border border-red-500/10">
                            <Database size={18} /> Reset Defaults
                        </button>
                        {!isAdding && (
                            <button onClick={() => { reset(); setEditingId(null); setIsAdding(true); }} className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-200 transition-all hover:scale-105 shadow-lg shadow-white/10">
                                <Plus size={20} /> Add Product
                            </button>
                        )}
                    </div>
                }
            />

            {isAdding && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 mb-8 overflow-hidden relative">
                    <div className="absolute top-4 right-4">
                        <button onClick={handleCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} className="text-neutral-400" /></button>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-4">{editingId ? "Edit Product" : "New Product"}</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input {...register("title")} placeholder="Product Title" className="input-field" required />
                            <input {...register("tag")} placeholder="Tag (e.g. BEST SELLER)" className="input-field" required />
                        </div>
                        <input {...register("description")} placeholder="Description" className="input-field" required />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input {...register("image")} placeholder="Image Path (e.g. /dubby/image.png)" className="input-field" required />
                            <input {...register("link")} placeholder="Affiliate Link" className="input-field" required />
                        </div>

                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-4">Styling (Advanced)</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <input {...register("tagColor")} placeholder="Tag Color (Tailwind)" className="input-field text-xs" />
                            <input {...register("gradient")} placeholder="Card Gradient" className="input-field text-xs" />
                            <input {...register("glowColor")} placeholder="Glow Hex" className="input-field text-xs" />
                            <input {...register("buttonColor")} placeholder="Btn Color (Tailwind)" className="input-field text-xs" />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={handleCancel} className="px-4 py-2 text-neutral-400 hover:text-white">Cancel</button>
                            <button type="submit" className="bg-green-600 px-8 py-2 rounded-xl text-white font-bold hover:bg-green-500">{editingId ? "Update" : "Save"} Product</button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="grid gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-neutral-900/30 border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-green-500/30 hover:bg-neutral-900/50 transition-all duration-300">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-green-400 group-hover:scale-110 transition-all overflow-hidden relative">
                                <img src={product.image} alt="Product" className="object-cover w-full h-full" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{product.title}</h4>
                                <p className="text-xs text-neutral-500 font-mono">{product.tag}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                            <button onClick={() => handleEdit(product)} className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all">
                                <Pencil size={20} />
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

function AdminsManager({ currentUser }: { currentUser: string }) {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const { register, handleSubmit, reset } = useForm();
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "admins"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const adminList = snapshot.docs.map(doc => ({ email: doc.id, ...doc.data() } as AdminUser));
            if (!adminList.find(a => a.email === SUPER_ADMIN)) {
                adminList.unshift({ email: SUPER_ADMIN, createdAt: null });
            }
            setAdmins(adminList);
        });
        return () => unsubscribe();
    }, []);

    const onSubmit = async (data: any) => {
        try {
            await setDoc(doc(db, "admins", data.email), { createdAt: new Date(), addedBy: currentUser });
            toast.success(`Admin ${data.email} added`);
            reset(); setIsAdding(false);
        } catch (e) { toast.error("Failed to add admin"); }
    };

    const handleDelete = async (email: string) => {
        if (email === SUPER_ADMIN) {
            toast.error("Cannot delete Super Admin");
            return;
        }
        if (!confirm(`Remove admin access for ${email}?`)) return;
        try {
            await deleteDoc(doc(db, "admins", email));
            toast.success("Admin removed");
        } catch (e) { toast.error("Failed to remove admin"); }
    }

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <SectionHeader
                title="Manage Team"
                subtitle="Control who has access to this dashboard."
                action={
                    <button onClick={() => setIsAdding(!isAdding)} className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-neutral-200 transition-all hover:scale-105 shadow-lg shadow-white/10">
                        <Plus size={20} /> Add Admin
                    </button>
                }
            />

            {isAdding && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 mb-8 overflow-hidden">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex gap-4">
                            <input {...register("email")} placeholder="New Admin Email (Gmail)" className="input-field flex-1" required type="email" />
                            <button type="submit" className="bg-green-600 px-8 py-2 rounded-xl text-white font-bold hover:bg-green-500">Grant Access</button>
                        </div>
                    </form>
                </motion.div>
            )}

            <div className="grid gap-4">
                {admins.map((admin) => (
                    <div key={admin.email} className="bg-neutral-900/30 border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all duration-300">
                        <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${admin.email === SUPER_ADMIN ? 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg shadow-orange-500/20' : 'bg-neutral-800'}`}>
                                {admin.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg flex items-center gap-2">
                                    {admin.email}
                                    {admin.email === SUPER_ADMIN && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/20 uppercase tracking-wider">Super Admin</span>}
                                    {admin.email === currentUser && <span className="text-[10px] bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-wider">You</span>}
                                </h4>
                                <p className="text-sm text-neutral-500">{admin.email === SUPER_ADMIN ? "System Owner" : "Content Moderator"}</p>
                            </div>
                        </div>
                        {admin.email !== SUPER_ADMIN && (
                            <button onClick={() => handleDelete(admin.email)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

        </motion.div>
    )
}

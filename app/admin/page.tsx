"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot,
    query,
    orderBy,
    setDoc,
    writeBatch,
    getDocs,
    increment,
    serverTimestamp
} from "firebase/firestore";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, addMonths, subMonths, isSameDay, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    LogOut,
    Plus,
    Trash2,
    Video,
    Music,
    Settings,
    Users,
    ShieldCheck,
    User as UserIcon,
    ShoppingBag,
    Database,
    Pencil,
    X,
    Trophy,
    MonitorPlay,
    ListMusic,
    Search,
    Filter,
    Copy,
    ArrowRight,
    Calendar,
    ExternalLink,
    CheckSquare,
    Square,
    Bell,
    GraduationCap
} from "lucide-react";
import UniversityManager from "@/components/admin/UniversityManager";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
interface Submission {
    id: string;
    songName: string;
    artistName: string;
    link: string;
    roundId: number;
    submittedAt: any;
    status: string;
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

// --- Modal System ---
interface ModalState {
    isOpen: boolean;
    type: "confirm" | "danger" | "alert";
    title: string;
    message: string;
    actionLabel?: string;
    onConfirm: (inputValue?: string) => void;
    requireInput?: string; // If set, user must type this to confirm
}

function ConfirmationModal({ state, onClose }: { state: ModalState; onClose: () => void }) {
    const [input, setInput] = useState("");

    if (!state.isOpen) return null;

    const isDanger = state.type === "danger";

    const handleConfirm = () => {
        if (state.requireInput && input !== state.requireInput) {
            toast.error(`Please type '${state.requireInput}' to confirm.`);
            return;
        }
        state.onConfirm(input);
        onClose();
        setInput("");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-[#1e1e1e] border ${isDanger ? "border-red-500/30" : "border-white/10"} w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden`}
            >
                {/* Background Glow */}
                {isDanger && <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 blur-[50px] pointer-events-none" />}

                <h3 className={`text-xl font-bold mb-2 ${isDanger ? "text-red-500" : "text-white"}`}>{state.title}</h3>
                <p className="text-neutral-400 mb-6 leading-relaxed">{state.message}</p>

                {state.requireInput && (
                    <div className="mb-6">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 block">
                            Type <span className="text-white select-all">{state.requireInput}</span> to confirm
                        </label>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors font-mono"
                            placeholder={state.requireInput}
                        />
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-6 py-2 rounded-lg font-bold text-white transition-all shadow-lg ${isDanger
                            ? "bg-red-600 hover:bg-red-500 shadow-red-900/20"
                            : "bg-white text-black hover:bg-neutral-200 shadow-white/10"}`}
                    >
                        {state.actionLabel || "Confirm"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// --- Submissions Manager (Enhanced) ---
function SubmissionsManager() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [filterRound, setFilterRound] = useState<number | "all">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
    const [roundConfig, setRoundConfig] = useState<any>({ currentRoundId: 1, isOpen: true, isEventActive: true });

    // Modal State
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        type: "confirm",
        title: "",
        message: "",
        onConfirm: () => { },
    });

    const openConfirm = (title: string, message: string, onConfirm: () => void, actionLabel = "Confirm") => {
        setModal({ isOpen: true, type: "confirm", title, message, onConfirm, actionLabel });
    };

    const openDanger = (title: string, message: string, requireInput: string, onConfirm: () => void, actionLabel = "Execute") => {
        setModal({ isOpen: true, type: "danger", title, message, requireInput, onConfirm, actionLabel });
    };

    useEffect(() => {
        const q = query(collection(db, "submissions"), orderBy("submittedAt", sortOrder));
        const unsubSubmissions = onSnapshot(q, (snapshot) => {
            const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Submission[];
            setSubmissions(subs);
            setLoading(false);
        });

        const unsubSettings = onSnapshot(doc(db, "settings", "submission"), (docSnap) => {
            if (docSnap.exists()) setRoundConfig(docSnap.data());
            else setDoc(doc(db, "settings", "submission"), { currentRoundId: 1, isOpen: true, isEventActive: true });
        });

        return () => { unsubSubmissions(); unsubSettings(); };
    }, [sortOrder]);

    // --- Actions ---

    const handleNextRound = () => {
        openConfirm(
            "Start Next Round?",
            "This will increment the round ID and UNLOCK submissions for everyone.",
            async () => {
                try {
                    await updateDoc(doc(db, "settings", "submission"), {
                        currentRoundId: increment(1),
                        isOpen: true
                    });
                    toast.success("Round Updated successfully!");
                } catch (error) {
                    toast.error("Failed to update round.");
                }
            },
            "Start Round"
        );
    };

    const toggleRoundStatus = async () => {
        try {
            await updateDoc(doc(db, "settings", "submission"), { isOpen: !roundConfig.isOpen });
            toast.success(roundConfig.isOpen ? "Round LOCKED." : "Round OPENED.");
        } catch (error) { toast.error("Failed to toggle status."); }
    };

    const toggleEventActive = () => {
        const action = roundConfig.isEventActive ? "DISABLE" : "ENABLE";
        openConfirm(
            `${action} Event?`,
            `Are you sure you want to ${action} the submission system? This affects the public page immediately.`,
            async () => {
                try {
                    await updateDoc(doc(db, "settings", "submission"), { isEventActive: !roundConfig.isEventActive });
                    toast.success(`Event is now ${!roundConfig.isEventActive ? "ONLINE" : "OFFLINE"}`);
                } catch (error) { toast.error("Failed to toggle event."); }
            },
            action === "DISABLE" ? "Stop Event" : "Go Live"
        );
    };

    const handleResetEvent = () => {
        openDanger(
            "HARD RESET EVENT",
            "This will PERMANENTLY DELETE all submissions and reset the event to Round 1. This action cannot be undone.",
            "RESET",
            async () => {
                try {
                    const batch = writeBatch(db);
                    const snapshot = await getDocs(collection(db, "submissions"));
                    snapshot.docs.forEach((doc) => batch.delete(doc.ref));

                    // Generate new session version to force client reset
                    const newSessionVersion = Date.now().toString();

                    batch.set(doc(db, "settings", "submission"), {
                        currentRoundId: 1,
                        isOpen: true,
                        isEventActive: false,
                        sessionVersion: newSessionVersion
                    });

                    await batch.commit();
                    toast.success("System RESET complete.");
                    setSubmissions([]);
                    setSelectedIds(new Set());
                } catch (error) {
                    toast.error("Reset failed.");
                }
            },
            "Wipe Everything"
        );
    };

    const handleDelete = (id: string) => {
        openConfirm(
            "Delete Submission?",
            "Are you sure you want to remove this track?",
            async () => {
                try {
                    await deleteDoc(doc(db, "submissions", id));
                    toast.success("Deleted.");
                    setSelectedIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(id);
                        return newSet;
                    });
                } catch (error) { toast.error("Error deleting."); }
            },
            "Delete"
        );
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        openConfirm(
            `Delete ${selectedIds.size} Submissions?`,
            "This action cannot be undone.",
            async () => {
                try {
                    const batch = writeBatch(db);
                    selectedIds.forEach(id => batch.delete(doc(db, "submissions", id)));
                    await batch.commit();
                    toast.success(`Deleted ${selectedIds.size} submissions.`);
                    setSelectedIds(new Set());
                } catch (error) { toast.error("Bulk delete failed."); }
            },
            "Delete All"
        );
    };

    const handleCopyLinks = () => {
        const links = submissions.filter(s => selectedIds.has(s.id)).map(s => s.link).join("\n");
        navigator.clipboard.writeText(links);
        toast.success(`Copied ${selectedIds.size} links!`);
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredSubmissions.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredSubmissions.map(s => s.id)));
    };

    // Derived state
    const filteredSubmissions = submissions.filter(s => {
        const matchesSearch = s.songName.toLowerCase().includes(searchTerm.toLowerCase()) || s.artistName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRound = filterRound === "all" || s.roundId === filterRound;
        return matchesSearch && matchesRound;
    });

    const rounds = Array.from(new Set(submissions.map(s => s.roundId))).sort((a, b) => b - a);

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <AnimatePresence>
                {modal.isOpen && <ConfirmationModal state={modal} onClose={() => setModal({ ...modal, isOpen: false })} />}
            </AnimatePresence>

            <SectionHeader
                title="Song Submissions"
                subtitle={`Manage Round ${roundConfig.currentRoundId} submissions.`}
                action={
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${roundConfig.isOpen ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                            {roundConfig.isOpen ? "ACCEPTING" : "LOCKED"}
                        </div>
                    </div>
                }
            />

            {/* CONTROL CENTER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* 1. Round Control */}
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ListMusic size={64} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1">Round {roundConfig.currentRoundId}</h3>
                        <p className="text-neutral-500 text-sm">Increment round to reset eligibility.</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleNextRound}
                            className="flex-1 bg-white text-black py-2 rounded-lg font-bold text-sm hover:scale-[1.02] transition-transform shadow-lg shadow-white/5"
                        >
                            Start Round {roundConfig.currentRoundId + 1}
                        </button>
                        <button
                            onClick={toggleRoundStatus}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors border ${roundConfig.isOpen ? "border-red-500/20 text-red-500 hover:bg-red-500/10" : "border-green-500/20 text-green-500 hover:bg-green-500/10"}`}
                        >
                            {roundConfig.isOpen ? "Lock" : "Open"}
                        </button>
                    </div>
                </div>

                {/* 2. Global Event Status */}
                <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <MonitorPlay size={64} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg mb-1">Event Status</h3>
                        <p className="text-neutral-500 text-sm">{roundConfig.isEventActive ? "Event is LIVE. Users can access page." : "Event OFFLINE. 'Starting Soon' screen."}</p>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={toggleEventActive}
                            className={`w-full py-2 rounded-lg font-bold text-sm transition-all shadow-lg ${roundConfig.isEventActive ? "bg-red-500 text-white shadow-red-500/20 hover:bg-red-600" : "bg-green-600 text-white shadow-green-500/20 hover:bg-green-500"}`}
                        >
                            {roundConfig.isEventActive ? "Stop Event (Go Offline)" : "Start Event (Go Live)"}
                        </button>
                    </div>
                </div>

                {/* 3. Danger Zone */}
                <div className="bg-red-900/10 border border-red-500/10 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 text-red-500 group-hover:opacity-20 transition-opacity">
                        <Trash2 size={64} />
                    </div>
                    <div>
                        <h3 className="text-red-500 font-bold text-lg mb-1">Danger Zone</h3>
                        <p className="text-red-400/60 text-sm">Irreversible actions.</p>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={handleResetEvent}
                            className="w-full py-2 rounded-lg font-bold text-sm bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                        >
                            Hard Reset Event
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/30 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search artist or song..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-neutral-500 text-white"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-neutral-400" />
                            <select
                                value={filterRound}
                                onChange={(e) => setFilterRound(e.target.value === "all" ? "all" : Number(e.target.value))}
                                className="bg-neutral-900 border border-white/10 rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-purple-500 text-white"
                            >
                                <option value="all">All Rounds</option>
                                {rounds.map(r => (
                                    <option key={r} value={r}>Round {r}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedIds.size > 0 && (
                            <>
                                <button
                                    onClick={handleCopyLinks}
                                    className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium transition-colors border border-white/10"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Links ({selectedIds.size})
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-500 hover:text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete ({selectedIds.size})
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-neutral-900/30 rounded-xl border border-white/5 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-black/40 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 w-12 text-white">
                                        <button onClick={toggleSelectAll} className="flex items-center justify-center text-neutral-400 hover:text-purple-500 transition-colors">
                                            {filteredSubmissions.length > 0 && selectedIds.size === filteredSubmissions.length ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-neutral-400">Date & Round</th>
                                    <th className="px-6 py-4 font-semibold text-neutral-400">Track Info</th>
                                    <th className="px-6 py-4 font-semibold text-neutral-400">Link</th>
                                    <th className="px-6 py-4 font-semibold text-neutral-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                                            No submissions found matching your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubmissions.map((submission) => (
                                        <tr
                                            key={submission.id}
                                            className={`hover:bg-neutral-800/50 transition-colors group ${selectedIds.has(submission.id) ? "bg-purple-900/10" : ""}`}
                                        >
                                            <td className="px-6 py-4">
                                                <button onClick={() => toggleSelect(submission.id)} className="flex items-center justify-center text-neutral-400 hover:text-purple-500 transition-colors">
                                                    {selectedIds.has(submission.id) ? <CheckSquare className="w-5 h-5 text-purple-500" /> : <Square className="w-5 h-5" />}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-white">
                                                <div className="flex flex-col">
                                                    <span className="font-medium flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3 text-neutral-400" />
                                                        {submission.submittedAt?.toDate().toLocaleDateString() || "Just now"}
                                                    </span>
                                                    <span className="text-xs text-neutral-500">
                                                        {submission.submittedAt?.toDate().toLocaleTimeString()} • Round {submission.roundId}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-white">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 font-medium max-w-[200px] truncate">
                                                        <Music className="w-3.5 h-3.5 text-purple-500" />
                                                        {submission.songName}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-neutral-500 max-w-[200px] truncate">
                                                        <UserIcon className="w-3.5 h-3.5" />
                                                        {submission.artistName}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <a
                                                    href={submission.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 hover:underline text-sm font-medium"
                                                >
                                                    Open Link <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(submission.link);
                                                            toast.success("Link copied!");
                                                        }}
                                                        className="p-2 hover:bg-neutral-700 rounded-lg text-neutral-500 hover:text-white transition-colors"
                                                        title="Copy Link"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(submission.id)}
                                                        className="p-2 hover:bg-red-900/30 rounded-lg text-neutral-500 hover:text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

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

import BroadcastManager from "@/components/admin/BroadcastManager";

// --- Schedule Manager (NEW) ---
interface CalendarEvent {
    id: string;
    date: string; // ISO String YYYY-MM-DD
    title: string;
    time: string;
    type: "stream" | "release" | "event";
}

function ScheduleManager() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [nextStream, setNextStream] = useState<string>("");
    const [loading, setLoading] = useState(true);

    // Event Modal
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventTime, setNewEventTime] = useState("20:00");
    const [newEventType, setNewEventType] = useState<"stream" | "release" | "event">("stream");

    // Fetch Data
    useEffect(() => {
        // Fetch Next Stream
        const unsubSettings = onSnapshot(doc(db, "settings", "schedule"), (doc) => {
            if (doc.exists()) {
                setNextStream(doc.data().nextStream || "");
            }
        });

        // Fetch Events
        const q = query(collection(db, "events"));
        const unsubEvents = onSnapshot(q, (snapshot) => {
            const evs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CalendarEvent[];
            setEvents(evs);
            setLoading(false);
        });

        return () => { unsubSettings(); unsubEvents(); };
    }, []);

    const updateNextStream = async (val: string) => {
        try {
            await setDoc(doc(db, "settings", "schedule"), { nextStream: val }, { merge: true });
            setNextStream(val);
            toast.success("Next Stream Updated");
        } catch (e) { toast.error("Failed to update"); }
    };

    const handleAddEvent = async () => {
        if (!selectedDate || !newEventTitle) return;
        try {
            const dateStr = format(selectedDate, "yyyy-MM-dd");
            await addDoc(collection(db, "events"), {
                date: dateStr,
                title: newEventTitle,
                time: newEventTime,
                type: newEventType,
                createdAt: serverTimestamp()
            });
            toast.success("Event Added");
            setSelectedDate(null);
            setNewEventTitle("");
        } catch (e) { toast.error("Failed to add event"); }
    };

    const handleDeleteEvent = async (id: string) => {
        try {
            await deleteDoc(doc(db, "events", id));
            toast.success("Event Deleted");
        } catch (e) { toast.error("Failed to delete"); }
    };

    // Calendar Logic
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Fill empty days for grid alignment
    const startDay = monthStart.getDay(); // 0 is Sunday
    const emptyDays = Array(startDay).fill(null);

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <SectionHeader
                title="Broadcast Schedule"
                subtitle="Manage your streaming calendar and countdowns."
                action={<div />}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Next Stream Setter */}
                <div className="col-span-1 bg-neutral-900/40 border border-white/5 rounded-2xl p-6 h-fit">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                            <MonitorPlay size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Next Stream</h3>
                            <p className="text-xs text-neutral-500">Global countdown target.</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="datetime-local"
                            value={nextStream}
                            onChange={(e) => updateNextStream(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        />
                        <p className="text-xs text-center text-neutral-500">
                            Updates homepage ticker automatically.
                        </p>
                    </div>
                </div>

                {/* 2. Calendar Manager */}
                <div className="col-span-1 lg:col-span-2 bg-neutral-900/40 border border-white/5 rounded-2xl p-6 relative">

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">
                            {format(currentDate, "MMMM yyyy")}
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-lg text-white"><ArrowRight className="rotate-180 w-5 h-5" /></button>
                            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-neutral-400">TODAY</button>
                            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white/10 rounded-lg text-white"><ArrowRight className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden mb-4">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                            <div key={d} className="bg-black/40 p-2 text-center text-xs font-bold text-neutral-500 uppercase">{d}</div>
                        ))}

                        {emptyDays.map((_, i) => <div key={`empty-${i}`} className="bg-black/20 h-32" />)}

                        {days.map(day => {
                            const dateEvents = events.filter(e => e.date === format(day, "yyyy-MM-dd"));
                            const isTodayDate = isToday(day);

                            return (
                                <div
                                    key={day.toString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`bg-black/20 h-32 p-2 relative group hover:bg-white/5 transition-colors cursor-pointer border-t border-l border-white/5 ${isTodayDate ? 'bg-purple-900/10' : ''}`}
                                >
                                    <span className={`text-sm font-bold block mb-1 ${isTodayDate ? 'text-purple-400' : 'text-neutral-400'}`}>
                                        {format(day, "d")}
                                    </span>

                                    <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                                        {dateEvents.map(ev => (
                                            <div key={ev.id} className="group/ev relative text-[10px] bg-neutral-800 border border-white/5 p-1 rounded hover:bg-neutral-700">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold truncate text-white">{ev.time} {ev.title}</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }}
                                                        className="opacity-0 group-hover/ev:opacity-100 text-red-500 hover:text-white"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                                <div className={`h-0.5 w-full mt-1 rounded-full ${ev.type === 'stream' ? 'bg-purple-500' : ev.type === 'release' ? 'bg-green-500' : 'bg-blue-500'}`} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Hint */}
                                    <div className="absolute opacity-0 group-hover:opacity-100 bottom-2 right-2 text-white/20">
                                        <Plus size={16} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Add Event Modal */}
            <AnimatePresence>
                {selectedDate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative"
                        >
                            <button onClick={() => setSelectedDate(null)} className="absolute top-4 right-4 text-neutral-500 hover:text-white"><X size={20} /></button>

                            <h3 className="text-xl font-bold text-white mb-1">Add Event</h3>
                            <p className="text-neutral-400 text-sm mb-6">{format(selectedDate, "PPP")}</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Title</label>
                                    <input
                                        autoFocus
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                        placeholder="Stream, Drop, etc."
                                        value={newEventTitle}
                                        onChange={e => setNewEventTitle(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Time</label>
                                        <input
                                            type="time"
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                            value={newEventTime}
                                            onChange={e => setNewEventTime(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Type</label>
                                        <select
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                                            value={newEventType}
                                            onChange={e => setNewEventType(e.target.value as any)}
                                        >
                                            <option value="stream">Stream</option>
                                            <option value="release">Release</option>
                                            <option value="event">Event</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddEvent}
                                    className="w-full py-3 bg-white text-black font-bold rounded-xl mt-2 hover:bg-neutral-200 transition-colors"
                                >
                                    Create Event
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </motion.div>
    );
}

function TabButton({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${active
                ? 'bg-white text-black shadow-lg shadow-white/10 scale-[1.02]'
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <span className={`relative z-10 ${active ? 'text-black' : 'group-hover:scale-110 transition-transform duration-300'}`}>{icon}</span>
            <span className="relative z-10">{label}</span>
        </button>
    );
}

export function SectionHeader({ title, subtitle, action }: any) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h2 className="text-3xl font-black font-outfit text-white mb-1">{title}</h2>
                <p className="text-neutral-500">{subtitle}</p>
            </div>
            {action}
        </div>
    );
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
        if (!confirm("?? WARNING: This will DELETE ALL current videos and restore the defaults. Continue?")) return;
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
        if (!confirm("?? WARNING: This will DELETE ALL current music and restore the defaults. Continue?")) return;
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
        if (!confirm("?? WARNING: This will DELETE ALL current products and restore the defaults. Continue?")) return;
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

// --- Main Dashboard Component --- (Updated)
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"videos" | "music" | "products" | "admins" | "settings" | "submissions" | "schedule" | "broadcast" | "university">("submissions");
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
                            <p className="text-xs text-neutral-500 font-mono mt-1">V2.2.0 ??ACCESS GRANTED</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-3 bg-white/5 py-2 px-4 rounded-full border border-white/5">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <UserIcon size={14} className="text-purple-400" />
                                </div>
                            )}
                            <span className="text-sm font-medium text-white">{user?.displayName || "Admin"}</span>
                        </div>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-white/10 rounded-xl text-neutral-400 hover:text-white transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Sidebar & Content Layout */}
            <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row gap-8">

                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="sticky top-28 space-y-2">
                        <button
                            onClick={() => setActiveTab("submissions")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "submissions" ? "bg-white text-black font-bold shadow-lg shadow-white/10" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}
                        >
                            <ListMusic size={20} />
                            Submissions
                        </button>
                        <button
                            onClick={() => setActiveTab("schedule")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "schedule" ? "bg-white text-black font-bold shadow-lg shadow-white/10" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}
                        >
                            <Calendar size={20} />
                            Schedule
                        </button>
                        <div className="h-px bg-white/10 my-2 mx-4" />
                        <button
                            onClick={() => setActiveTab("videos")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "videos" ? "bg-white text-black font-bold shadow-lg shadow-white/10" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}
                        >
                            <Video size={20} />
                            Videos
                        </button>
                        <button
                            onClick={() => setActiveTab("music")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "music" ? "bg-white text-black font-bold shadow-lg shadow-white/10" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}
                        >
                            <Music size={20} />
                            Music
                        </button>
                        <button
                            onClick={() => setActiveTab("products")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "products" ? "bg-white text-black font-bold shadow-lg shadow-white/10" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}
                        >
                            <ShoppingBag size={20} />
                            Merch
                        </button>
                        <button
                            onClick={() => setActiveTab("broadcast")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "broadcast" ? "bg-white text-black font-bold shadow-lg shadow-white/10" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}
                        >
                            <Bell size={20} />
                            Broadcast
                        </button>
                        <div className="h-px bg-white/10 my-2 mx-4" />
                        <button
                            onClick={() => setActiveTab("admins")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "admins" ? "bg-white text-black font-bold shadow-lg shadow-white/10" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}
                        >
                            <Users size={20} />
                            Admins
                        </button>
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === "settings" ? "bg-white text-black font-bold shadow-lg shadow-white/10" : "text-neutral-400 hover:bg-white/5 hover:text-white"}`}
                        >
                            <Settings size={20} />
                            Settings
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        {activeTab === "submissions" && <SubmissionsManager key="submissions" />}
                        {activeTab === "schedule" && <ScheduleManager key="schedule" />}
                        {activeTab === "settings" && <SettingsManager key="settings" />}
                        {activeTab === "admins" && <AdminsManager key="admins" currentUser={user?.email || ''} />}
                        {activeTab === "videos" && <VideosManager key="videos" />}
                        {activeTab === "music" && <MusicManager key="music" />}
                        {activeTab === "products" && <ProductsManager key="products" />}
                        {activeTab === "broadcast" && <BroadcastManager key="broadcast" />}
                        {activeTab === "university" && <UniversityManager key="university" />}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    doc,
    updateDoc,
    deleteDoc,
    increment,
    writeBatch
} from "firebase/firestore";
import {
    Trash2,
    RefreshCcw,
    Search,
    ExternalLink,
    Copy,
    CheckSquare,
    Square,
    MoreHorizontal,
    Music,
    User,
    Calendar,
    Filter,
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface Submission {
    id: string;
    songName: string;
    artistName: string;
    link: string;
    roundId: number;
    submittedAt: any;
    status: string;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"dashboard" | "submissions">("submissions");
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [currentRound, setCurrentRound] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [filterRound, setFilterRound] = useState<number | "all">("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

    // Real-time Submissions & Round
    useEffect(() => {
        const q = query(collection(db, "submissions"), orderBy("submittedAt", sortOrder));
        const unsubSubmissions = onSnapshot(q, (snapshot) => {
            const subs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Submission[];
            setSubmissions(subs);
            setLoading(false);
        });

        const unsubSettings = onSnapshot(doc(db, "settings", "submission"), (doc) => {
            if (doc.exists()) {
                setCurrentRound(doc.data().currentRoundId);
            }
        });

        return () => {
            unsubSubmissions();
            unsubSettings();
        };
    }, [sortOrder]);

    const handleNextRound = async () => {
        if (!confirm("Are you sure you want to start the NEXT ROUND? Users will be able to submit again.")) return;

        try {
            await updateDoc(doc(db, "settings", "submission"), {
                currentRoundId: increment(1)
            });
            toast.success("Round Updated! Users can now submit again.");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update round.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this submission?")) return;
        try {
            await deleteDoc(doc(db, "submissions", id));
            toast.success("Deleted.");
            setSelectedIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        } catch (error) {
            toast.error("Error deleting.");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Delete ${selectedIds.size} submissions?`)) return;

        try {
            const batch = writeBatch(db);
            selectedIds.forEach(id => {
                batch.delete(doc(db, "submissions", id));
            });
            await batch.commit();
            toast.success(`Deleted ${selectedIds.size} submissions.`);
            setSelectedIds(new Set());
        } catch (error) {
            toast.error("Bulk delete failed.");
        }
    };

    const handleCopyLinks = () => {
        const links = submissions
            .filter(s => selectedIds.has(s.id))
            .map(s => s.link)
            .join("\n");
        navigator.clipboard.writeText(links);
        toast.success(`Copied ${selectedIds.size} links to clipboard!`);
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredSubmissions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredSubmissions.map(s => s.id)));
        }
    };

    // Derived state
    const filteredSubmissions = submissions.filter(s => {
        const matchesSearch =
            s.songName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.artistName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRound = filterRound === "all" || s.roundId === filterRound;
        return matchesSearch && matchesRound;
    });

    const rounds = Array.from(new Set(submissions.map(s => s.roundId))).sort((a, b) => b - a);

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                            KyeBeezy Admin
                        </h1>
                        <nav className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab("dashboard")}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "dashboard"
                                        ? "bg-white dark:bg-neutral-700 shadow-sm text-purple-600 dark:text-purple-400"
                                        : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab("submissions")}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "submissions"
                                        ? "bg-white dark:bg-neutral-700 shadow-sm text-purple-600 dark:text-purple-400"
                                        : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                                    }`}
                            >
                                Submissions
                            </button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                            <span className="text-xs font-mono text-neutral-500 mr-2">CURRENT ROUND:</span>
                            <span className="text-sm font-bold text-purple-600 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                {currentRound}
                            </span>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {activeTab === "dashboard" && (
                    <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-3xl">
                        <p className="text-lg text-neutral-400">Original Dashboard Content Placeholder</p>
                        <p className="text-sm text-neutral-500 max-w-md mt-2">
                            The original admin page content would be displayed here.
                            Switch to the <b>Submissions</b> tab to manage song requests.
                        </p>
                    </div>
                )}

                {activeTab === "submissions" && (
                    <div className="space-y-6">
                        {/* Toolbar */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input
                                        type="text"
                                        placeholder="Search artist or song..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-neutral-100 dark:bg-neutral-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-neutral-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-neutral-400" />
                                    <select
                                        value={filterRound}
                                        onChange={(e) => setFilterRound(e.target.value === "all" ? "all" : Number(e.target.value))}
                                        className="bg-neutral-100 dark:bg-neutral-900 border-none rounded-lg text-sm py-2 px-3 focus:ring-2 focus:ring-purple-500"
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
                                            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                            Copy Links ({selectedIds.size})
                                        </button>
                                        <button
                                            onClick={handleBulkDelete}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete ({selectedIds.size})
                                        </button>
                                    </>
                                )}
                                <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700 mx-2" />
                                <button
                                    onClick={handleNextRound}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/25 text-white rounded-lg text-sm font-bold transition-all transform active:scale-95"
                                >
                                    Next Round <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Stats Cards (Optional for "cool" factor) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                                <p className="text-xs text-neutral-500 uppercase font-semibold">Total Submissions</p>
                                <p className="text-2xl font-bold">{submissions.length}</p>
                            </div>
                            <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                                <p className="text-xs text-neutral-500 uppercase font-semibold">This Round</p>
                                <p className="text-2xl font-bold text-purple-500">
                                    {submissions.filter(s => s.roundId === currentRound).length}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700">
                                <p className="text-xs text-neutral-500 uppercase font-semibold">Latest</p>
                                <p className="text-sm truncate mt-1 text-neutral-600 dark:text-neutral-300">
                                    {submissions[0] ? `${submissions[0].songName} by ${submissions[0].artistName}` : "No submissions"}
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700">
                                        <tr>
                                            <th className="px-6 py-4 w-12">
                                                <button onClick={toggleSelectAll} className="flex items-center justify-center text-neutral-400 hover:text-purple-500 transition-colors">
                                                    {filteredSubmissions.length > 0 && selectedIds.size === filteredSubmissions.length ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                </button>
                                            </th>
                                            <th className="px-6 py-4 font-semibold text-neutral-500 dark:text-neutral-400">Date & Round</th>
                                            <th className="px-6 py-4 font-semibold text-neutral-500 dark:text-neutral-400">Track Info</th>
                                            <th className="px-6 py-4 font-semibold text-neutral-500 dark:text-neutral-400">Link</th>
                                            <th className="px-6 py-4 font-semibold text-neutral-500 dark:text-neutral-400 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
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
                                                    className={`hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors group ${selectedIds.has(submission.id) ? "bg-purple-50/50 dark:bg-purple-900/10" : ""}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <button onClick={() => toggleSelect(submission.id)} className="flex items-center justify-center text-neutral-400 hover:text-purple-500 transition-colors">
                                                            {selectedIds.has(submission.id) ? <CheckSquare className="w-5 h-5 text-purple-500" /> : <Square className="w-5 h-5" />}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100">
                                                                <Calendar className="w-3 h-3 text-neutral-400" />
                                                                {submission.submittedAt?.toDate().toLocaleDateString() || "Just now"}
                                                            </span>
                                                            <span className="text-xs text-neutral-500">
                                                                {submission.submittedAt?.toDate().toLocaleTimeString()} • Round {submission.roundId}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2 font-medium text-neutral-900 dark:text-neutral-100 max-w-[200px] truncate">
                                                                <Music className="w-3.5 h-3.5 text-purple-500" />
                                                                {submission.songName}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-neutral-500 max-w-[200px] truncate">
                                                                <User className="w-3.5 h-3.5" />
                                                                {submission.artistName}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <a
                                                            href={submission.link}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:underline text-sm font-medium"
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
                                                                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                                                                title="Copy Link"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(submission.id)}
                                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-neutral-500 hover:text-red-500 transition-colors"
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
                )}
            </main>
        </div>
    );
}

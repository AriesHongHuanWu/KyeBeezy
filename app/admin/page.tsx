"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc, deleteDoc, writeBatch } from "firebase/firestore";
import {
    Loader2,
    RefreshCcw,
    Link as LinkIcon,
    Trash2,
    CheckSquare,
    Square,
    MoreHorizontal,
    Calendar,
    Music,
    Search,
    Filter,
    LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface Submission {
    id: string;
    artistName: string;
    songName: string;
    link: string;
    roundId: string;
    createdAt: any; // Timestamp
}

export default function AdminPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentRoundId, setCurrentRoundId] = useState<string>("round_1");

    // Filters & Selection
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRoundFilter, setSelectedRoundFilter] = useState<string>("all");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // --- Auth Check ---
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login"); // Secure functionality
        }
    }, [user, authLoading, router]);

    // --- Initial Config Fetch ---
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const configRef = doc(db, "config", "general");
                const snap = await getDoc(configRef);
                if (snap.exists()) {
                    setCurrentRoundId(snap.data().currentRoundId);
                } else {
                    // Create initial config if missing
                    await setDoc(configRef, { currentRoundId: "round_1" });
                }
            } catch (e) {
                console.error("Config fetch error", e);
            }
        };
        fetchConfig();
    }, []);

    // --- Real-time Submissions Listener ---
    useEffect(() => {
        if (!user) return; // Don't subscribe if not logged in

        const q = query(
            collection(db, "submissions"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const subs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Submission[];
            setSubmissions(subs);
            setIsLoading(false);
        }, (error) => {
            console.error("Snapshot error:", error);
            toast.error("Error fetching data");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // --- Filtering Logic ---
    useEffect(() => {
        let res = submissions;

        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            res = res.filter(s =>
                s.artistName.toLowerCase().includes(lower) ||
                s.songName.toLowerCase().includes(lower) ||
                s.roundId.toLowerCase().includes(lower)
            );
        }

        if (selectedRoundFilter !== "all") {
            res = res.filter(s => s.roundId === selectedRoundFilter);
        }

        setFilteredSubmissions(res);
    }, [submissions, searchQuery, selectedRoundFilter]);

    // --- Actions ---

    const handleNextRound = async () => {
        if (!confirm("Are you sure? This will allow all users to submit again.")) return;

        try {
            const newRoundId = `round_${Date.now()}`;
            await setDoc(doc(db, "config", "general"), {
                currentRoundId: newRoundId
            }, { merge: true });

            setCurrentRoundId(newRoundId);
            toast.success("New Round Started!", { description: `Current ID: ${newRoundId}` });
        } catch (e) {
            toast.error("Failed to start next round");
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredSubmissions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredSubmissions.map(s => s.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const deleteSelected = async () => {
        if (!confirm(`Delete ${selectedIds.size} submissions? This cannot be undone.`)) return;

        try {
            const batch = writeBatch(db);
            selectedIds.forEach(id => {
                const ref = doc(db, "submissions", id);
                batch.delete(ref);
            });
            await batch.commit();
            setSelectedIds(new Set());
            toast.success("Deleted successfully");
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const copyLink = (link: string) => {
        navigator.clipboard.writeText(link);
        toast.success("Link copied!");
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return "N/A";
        // Handle Firestore Timestamp or standard Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    // Get unique rounds for filter
    const rounds = Array.from(new Set(submissions.map(s => s.roundId))).sort().reverse();


    if (authLoading || isLoading) {
        return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    }

    if (!user) return null; // Logic handled by useEffect, but just safe return

    return (
        <div className="min-h-screen bg-background text-foreground p-6 relative font-sans">
            <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background" />

            {/* Header */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Curation Dashboard</h1>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Music className="w-4 h-4" /> {submissions.length} total subs</span>
                        <span className="flex items-center gap-1"><RefreshCcw className="w-4 h-4" /> Current: <span className="text-green-500 font-mono bg-green-900/10 dark:bg-green-900/20 px-2 py-0.5 rounded">{currentRoundId}</span></span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleNextRound}
                        className="bg-purple-600 hover:bg-purple-500 text-white border-none"
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Next Round
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => auth.signOut()}>
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <div className="relative z-10 flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search artist, song, round..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card/50 border-input text-foreground focus:border-primary/50"
                    />
                </div>

                <select
                    title="Filters"
                    className="h-10 px-3 rounded-md bg-card/50 border border-input text-sm focus:outline-none focus:border-primary/50 text-foreground"
                    value={selectedRoundFilter}
                    onChange={(e) => setSelectedRoundFilter(e.target.value)}
                >
                    <option value="all">All Rounds</option>
                    {rounds.map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>

                {selectedIds.size > 0 && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <Button variant="destructive" onClick={deleteSelected} className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Delete ({selectedIds.size})
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* Table */}
            <div className="relative z-10 border border-border rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm">
                <div className="grid grid-cols-[50px_2fr_2fr_1fr_1fr_80px] gap-4 p-4 border-b border-border bg-card/50 text-sm font-semibold text-muted-foreground">
                    <div className="flex items-center justify-center">
                        <button onClick={toggleSelectAll} className="hover:text-foreground transition-colors">
                            {selectedIds.size === filteredSubmissions.length && filteredSubmissions.length > 0 ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5" />}
                        </button>
                    </div>
                    <div>Song</div>
                    <div>Artist</div>
                    <div>Round</div>
                    <div>Date</div>
                    <div className="text-right">Action</div>
                </div>

                <div className="divide-y divide-border max-h-[70vh] overflow-y-auto">
                    {filteredSubmissions.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No submissions found.</div>
                    ) : (
                        filteredSubmissions.map((sub) => (
                            <motion.div
                                layout
                                key={sub.id}
                                className={`grid grid-cols-[50px_2fr_2fr_1fr_1fr_80px] gap-4 p-4 items-center text-sm hover:bg-card/50 transition-colors ${selectedIds.has(sub.id) ? 'bg-purple-500/10' : ''}`}
                            >
                                <div className="flex items-center justify-center">
                                    <button onClick={() => toggleSelect(sub.id)} className={`transition-colors ${selectedIds.has(sub.id) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                                        {selectedIds.has(sub.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="font-medium text-foreground truncate" title={sub.songName}>{sub.songName}</div>
                                <div className="text-muted-foreground truncate" title={sub.artistName}>{sub.artistName}</div>
                                <div className="text-xs font-mono text-muted-foreground bg-card px-2 py-1 rounded w-fit border border-border">{sub.roundId}</div>
                                <div className="text-muted-foreground text-xs">{formatTime(sub.createdAt)}</div>
                                <div className="flex justify-end gap-2">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => copyLink(sub.link)} title="Copy Link">
                                        <LinkIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

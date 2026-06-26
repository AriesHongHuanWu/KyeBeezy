"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    collection,
    doc,
    onSnapshot,
    updateDoc,
    deleteDoc,
    writeBatch,
    increment,
    setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lock,
    Unlock,
    SkipForward,
    Play,
    Trash2,
    Copy,
    Search,
    AlertTriangle,
    CheckSquare,
    Square,
    ExternalLink,
    Star,
    Megaphone,
    XCircle,
    CheckCircle2,
    Users,
    ListMusic,
    Zap,
    ZapOff,
    RotateCcw,
    Crown,
    ChevronRight,
    Disc3,
} from "lucide-react";
import type { Submission, SubmissionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

/* -------------------------------------------------------------------------- */
/*  Settings document shape                                                    */
/* -------------------------------------------------------------------------- */

interface SubmissionSettings {
    currentRoundId: number;
    isOpen: boolean;
    isEventActive: boolean;
    sessionVersion: string;
}

const DEFAULT_SETTINGS: SubmissionSettings = {
    currentRoundId: 1,
    isOpen: true,
    isEventActive: false,
    sessionVersion: "0",
};

/* -------------------------------------------------------------------------- */
/*  Status + tier presentation maps                                            */
/* -------------------------------------------------------------------------- */

type Tier = NonNullable<Submission["tier"]>;

const TIER_META: Record<Tier, { label: string; className: string }> = {
    vip: { label: "Bonnet Gang", className: "bg-amber-400/15 text-amber-300 border-amber-400/40" },
    supporter: { label: "Inner Circle", className: "bg-brand/15 text-brand border-brand/40" },
    squad: { label: "Squad", className: "bg-white/5 text-neutral-300 border-white/15" },
};

const STATUS_META: Record<
    SubmissionStatus,
    { label: string; className: string }
> = {
    pending: { label: "Pending", className: "bg-white/5 text-neutral-300 border-white/15" },
    queued: { label: "Queued", className: "bg-sky-500/15 text-sky-300 border-sky-500/40" },
    playing: { label: "Playing", className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" },
    played: { label: "Played", className: "bg-neutral-700/40 text-neutral-400 border-white/10" },
    featured: { label: "Featured", className: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40" },
    promoted: { label: "Promoted", className: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
    rejected: { label: "Rejected", className: "bg-rose-500/15 text-rose-300 border-rose-500/40" },
};

const STATUS_FILTERS: (SubmissionStatus | "all")[] = [
    "all",
    "pending",
    "queued",
    "playing",
    "played",
    "featured",
    "promoted",
    "rejected",
];

/* Action buttons available on each row. */
const ROW_ACTIONS: { status: SubmissionStatus; label: string; icon: typeof Play }[] = [
    { status: "playing", label: "Play", icon: Play },
    { status: "played", label: "Played", icon: CheckCircle2 },
    { status: "featured", label: "Feature", icon: Star },
    { status: "promoted", label: "Promote", icon: Megaphone },
    { status: "rejected", label: "Reject", icon: XCircle },
];

/* -------------------------------------------------------------------------- */
/*  Small UI helpers                                                           */
/* -------------------------------------------------------------------------- */

function formatDuration(sec?: number): string {
    if (!sec || sec <= 0 || !Number.isFinite(sec)) return "—";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function submittedMillis(s: Submission): number {
    return s.submittedAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER;
}

function Badge({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                className,
            )}
        >
            {children}
        </span>
    );
}

function Kpi({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Users;
    label: string;
    value: number | string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900/40 px-4 py-3 backdrop-blur-xl">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand">
                <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
                <div className="font-outfit text-2xl font-black leading-none tracking-tighter text-white">
                    {value}
                </div>
                <div className="truncate text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                    {label}
                </div>
            </div>
        </div>
    );
}

/* A control button used in the round controls bar. */
function ControlButton({
    onClick,
    disabled,
    icon: Icon,
    label,
    tone = "neutral",
}: {
    onClick: () => void;
    disabled?: boolean;
    icon: typeof Play;
    label: string;
    tone?: "neutral" | "brand" | "live" | "danger";
}) {
    const tones: Record<string, string> = {
        neutral: "bg-white/5 hover:bg-white/10 border-white/10 text-white",
        brand: "bg-brand/15 hover:bg-brand/25 border-brand/40 text-white",
        live: "bg-rose-500/15 hover:bg-rose-500/25 border-rose-500/40 text-rose-200",
        danger: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/40 text-rose-300",
    };
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
                "disabled:cursor-not-allowed disabled:opacity-50",
                tones[tone],
            )}
        >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
        </button>
    );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

export default function SubmissionsManagerPro() {
    const reduceMotion = usePrefersReducedMotion();

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [settings, setSettings] = useState<SubmissionSettings>(DEFAULT_SETTINGS);
    const [loaded, setLoaded] = useState(false);

    // Filters
    const [roundFilter, setRoundFilter] = useState<number | "all">("all");
    const [statusFilter, setStatusFilter] = useState<SubmissionStatus | "all">("all");
    const [search, setSearch] = useState("");

    // Selection
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // Now-playing audio
    const [activeAudioId, setActiveAudioId] = useState<string | null>(null);

    // Hard reset modal
    const [resetOpen, setResetOpen] = useState(false);
    const [resetText, setResetText] = useState("");
    const [resetting, setResetting] = useState(false);

    const settingsRef = useMemo(() => doc(db, "settings", "submission"), []);

    /* ----------------------------- Subscriptions ----------------------------- */

    useEffect(() => {
        const unsubSubs = onSnapshot(
            collection(db, "submissions"),
            (snap) => {
                const rows: Submission[] = snap.docs.map((d) => {
                    const data = d.data() as Omit<Submission, "id">;
                    return { id: d.id, ...data };
                });
                setSubmissions(rows);
                setLoaded(true);
            },
            (err) => {
                console.error(err);
                toast.error("Lost connection to the submissions feed.");
            },
        );

        const unsubSettings = onSnapshot(
            settingsRef,
            (snap) => {
                if (snap.exists()) {
                    setSettings({ ...DEFAULT_SETTINGS, ...(snap.data() as Partial<SubmissionSettings>) });
                } else {
                    setSettings(DEFAULT_SETTINGS);
                }
            },
            (err) => {
                console.error(err);
                toast.error("Lost connection to live settings.");
            },
        );

        return () => {
            unsubSubs();
            unsubSettings();
        };
    }, [settingsRef]);

    // Drop selections that no longer exist.
    useEffect(() => {
        setSelected((prev) => {
            if (prev.size === 0) return prev;
            const ids = new Set(submissions.map((s) => s.id));
            const next = new Set<string>();
            for (const id of prev) if (ids.has(id)) next.add(id);
            return next.size === prev.size ? prev : next;
        });
    }, [submissions]);

    /* ------------------------------- Derived -------------------------------- */

    const rounds = useMemo(() => {
        const set = new Set<number>();
        for (const s of submissions) set.add(s.roundId);
        set.add(settings.currentRoundId);
        return Array.from(set).sort((a, b) => b - a);
    }, [submissions, settings.currentRoundId]);

    // The live queue: current round, priority DESC then submittedAt ASC.
    const liveQueue = useMemo(() => {
        return submissions
            .filter((s) => s.roundId === settings.currentRoundId)
            .sort((a, b) => {
                const pa = a.priority ?? 0;
                const pb = b.priority ?? 0;
                if (pb !== pa) return pb - pa;
                return submittedMillis(a) - submittedMillis(b);
            });
    }, [submissions, settings.currentRoundId]);

    const nowPlaying = useMemo(
        () => liveQueue.find((s) => s.status === "playing") ?? null,
        [liveQueue],
    );

    // KPIs scoped to the current round.
    const kpis = useMemo(() => {
        const total = liveQueue.length;
        const members = liveQueue.filter((s) => s.tier === "supporter" || s.tier === "vip").length;
        const played = liveQueue.filter((s) => s.status === "played").length;
        return { total, members, played };
    }, [liveQueue]);

    // The filtered list shown in the table (respects all filters).
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return submissions
            .filter((s) => (roundFilter === "all" ? true : s.roundId === roundFilter))
            .filter((s) => (statusFilter === "all" ? true : s.status === statusFilter))
            .filter((s) => {
                if (!q) return true;
                return (
                    s.songName?.toLowerCase().includes(q) ||
                    s.artistName?.toLowerCase().includes(q) ||
                    s.discordName?.toLowerCase().includes(q) ||
                    s.fileName?.toLowerCase().includes(q)
                );
            })
            .sort((a, b) => {
                const pa = a.priority ?? 0;
                const pb = b.priority ?? 0;
                if (pb !== pa) return pb - pa;
                return submittedMillis(a) - submittedMillis(b);
            });
    }, [submissions, roundFilter, statusFilter, search]);

    /* --------------------------- Round controls ----------------------------- */

    const ensureSettings = useCallback(
        async (patch: Partial<SubmissionSettings>) => {
            // setDoc with merge so the doc is created if it doesn't yet exist.
            await setDoc(settingsRef, patch, { merge: true });
        },
        [settingsRef],
    );

    const startNextRound = useCallback(async () => {
        try {
            await updateDoc(settingsRef, { currentRoundId: increment(1), isOpen: true });
            toast.success("New round started — submissions open.");
        } catch {
            // Fallback when the doc doesn't exist yet.
            try {
                await ensureSettings({ currentRoundId: settings.currentRoundId + 1, isOpen: true });
                toast.success("New round started — submissions open.");
            } catch {
                toast.error("Couldn't start the next round.");
            }
        }
    }, [settingsRef, ensureSettings, settings.currentRoundId]);

    const toggleOpen = useCallback(async () => {
        const next = !settings.isOpen;
        try {
            await ensureSettings({ isOpen: next });
            toast.success(next ? "Submissions unlocked." : "Submissions locked.");
        } catch {
            toast.error("Couldn't change the lock state.");
        }
    }, [settings.isOpen, ensureSettings]);

    const toggleLive = useCallback(async () => {
        const next = !settings.isEventActive;
        try {
            await ensureSettings({ isEventActive: next });
            toast.success(next ? "You're live." : "You're offline.");
        } catch {
            toast.error("Couldn't change live state.");
        }
    }, [settings.isEventActive, ensureSettings]);

    const hardReset = useCallback(async () => {
        if (resetText.trim().toUpperCase() !== "RESET") return;
        setResetting(true);
        const toastId = toast.loading("Wiping the board…");
        try {
            // Firestore batches cap at 500 ops; chunk the deletes to be safe.
            const ids = submissions.map((s) => s.id);
            for (let i = 0; i < ids.length; i += 450) {
                const batch = writeBatch(db);
                for (const id of ids.slice(i, i + 450)) {
                    batch.delete(doc(db, "submissions", id));
                }
                await batch.commit();
            }
            await ensureSettings({
                currentRoundId: 1,
                isOpen: true,
                isEventActive: false,
                sessionVersion: Date.now().toString(),
            });
            toast.success("Hard reset complete.", { id: toastId });
            setResetOpen(false);
            setResetText("");
            setSelected(new Set());
        } catch (e) {
            console.error(e);
            toast.error("Hard reset failed.", { id: toastId });
        } finally {
            setResetting(false);
        }
    }, [resetText, submissions, ensureSettings]);

    /* ------------------------------- Row ops -------------------------------- */

    const setStatus = useCallback(
        async (id: string, status: SubmissionStatus) => {
            try {
                await updateDoc(doc(db, "submissions", id), { status });
            } catch {
                toast.error("Couldn't update status.");
            }
        },
        [],
    );

    // Advance the queue: current "playing" -> "played", top pending -> "playing".
    const advanceQueue = useCallback(async () => {
        const current = liveQueue.find((s) => s.status === "playing");
        // "Pending" in the practical sense = not yet played/rejected and not playing.
        const upNext = liveQueue.find(
            (s) =>
                s.status !== "playing" &&
                s.status !== "played" &&
                s.status !== "rejected",
        );

        if (!current && !upNext) {
            toast.info("Nothing left to advance.");
            return;
        }
        try {
            const batch = writeBatch(db);
            if (current) batch.update(doc(db, "submissions", current.id), { status: "played" });
            if (upNext) batch.update(doc(db, "submissions", upNext.id), { status: "playing" });
            await batch.commit();
            if (upNext) {
                toast.success(`Now playing: ${upNext.songName}`);
            } else {
                toast.success("Queue cleared — last track marked played.");
            }
        } catch {
            toast.error("Couldn't advance the queue.");
        }
    }, [liveQueue]);

    const deleteOne = useCallback(async (s: Submission) => {
        if (
            !window.confirm(
                `Delete "${s.songName}" by ${s.artistName}? This cannot be undone.`,
            )
        )
            return;
        try {
            await deleteDoc(doc(db, "submissions", s.id));
            toast.success("Submission deleted.");
        } catch {
            toast.error("Couldn't delete that submission.");
        }
    }, []);

    /* ------------------------------ Selection ------------------------------- */

    const toggleSelect = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const allVisibleSelected =
        filtered.length > 0 && filtered.every((s) => selected.has(s.id));

    const toggleSelectAll = useCallback(() => {
        setSelected((prev) => {
            if (filtered.length > 0 && filtered.every((s) => prev.has(s.id))) {
                const next = new Set(prev);
                for (const s of filtered) next.delete(s.id);
                return next;
            }
            const next = new Set(prev);
            for (const s of filtered) next.add(s.id);
            return next;
        });
    }, [filtered]);

    const selectedRows = useMemo(
        () => submissions.filter((s) => selected.has(s.id)),
        [submissions, selected],
    );

    const copyLinks = useCallback(async () => {
        const links = selectedRows
            .map((s) => s.link || s.fileUrl)
            .filter((v): v is string => Boolean(v));
        if (links.length === 0) {
            toast.error("None of the selected tracks have a link.");
            return;
        }
        try {
            await navigator.clipboard.writeText(links.join("\n"));
            toast.success(`Copied ${links.length} link${links.length === 1 ? "" : "s"}.`);
        } catch {
            toast.error("Clipboard blocked by the browser.");
        }
    }, [selectedRows]);

    const bulkDelete = useCallback(async () => {
        if (selectedRows.length === 0) return;
        if (
            !window.confirm(
                `Delete ${selectedRows.length} submission${
                    selectedRows.length === 1 ? "" : "s"
                }? This cannot be undone.`,
            )
        )
            return;
        const toastId = toast.loading("Deleting…");
        try {
            const ids = selectedRows.map((s) => s.id);
            for (let i = 0; i < ids.length; i += 450) {
                const batch = writeBatch(db);
                for (const id of ids.slice(i, i + 450)) {
                    batch.delete(doc(db, "submissions", id));
                }
                await batch.commit();
            }
            toast.success("Deleted.", { id: toastId });
            setSelected(new Set());
        } catch {
            toast.error("Bulk delete failed.", { id: toastId });
        }
    }, [selectedRows]);

    /* ------------------------------- Render --------------------------------- */

    const fade = reduceMotion
        ? {}
        : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

    return (
        <div className="space-y-8 text-white">
            {/* Header */}
            <header className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                    Live Console
                </p>
                <h1 className="font-outfit text-3xl font-black leading-[0.95] tracking-tighter sm:text-4xl">
                    BonnetSubmit
                </h1>
                <p className="max-w-2xl text-sm font-light text-neutral-400">
                    Run the live queue — start rounds, lock submissions, go live, and
                    drive the now-playing track in real time.
                </p>
            </header>

            {/* Status + round controls */}
            <section
                aria-label="Round controls"
                className="rounded-3xl border border-white/10 bg-neutral-900/40 p-5 backdrop-blur-xl sm:p-6"
            >
                <div className="mb-5 flex flex-wrap items-center gap-3">
                    <span className="font-outfit text-lg font-black tracking-tighter">
                        Round {settings.currentRoundId}
                    </span>
                    <Badge
                        className={
                            settings.isEventActive
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                                : "bg-white/5 text-neutral-400 border-white/15"
                        }
                    >
                        <span
                            className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                settings.isEventActive ? "bg-rose-400" : "bg-neutral-500",
                                settings.isEventActive && !reduceMotion && "animate-pulse",
                            )}
                            aria-hidden
                        />
                        {settings.isEventActive ? "Live" : "Offline"}
                    </Badge>
                    <Badge
                        className={
                            settings.isOpen
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                                : "bg-amber-500/15 text-amber-300 border-amber-500/40"
                        }
                    >
                        {settings.isOpen ? "Open" : "Locked"}
                    </Badge>
                    {!loaded && (
                        <span className="text-xs text-neutral-500">Connecting…</span>
                    )}
                </div>

                <div className="flex flex-wrap gap-3">
                    <ControlButton
                        onClick={startNextRound}
                        icon={ChevronRight}
                        label="Start next round"
                        tone="brand"
                    />
                    <ControlButton
                        onClick={toggleOpen}
                        icon={settings.isOpen ? Lock : Unlock}
                        label={settings.isOpen ? "Lock submissions" : "Open submissions"}
                    />
                    <ControlButton
                        onClick={toggleLive}
                        icon={settings.isEventActive ? ZapOff : Zap}
                        label={settings.isEventActive ? "Go offline" : "Go live"}
                        tone={settings.isEventActive ? "live" : "neutral"}
                    />
                    <ControlButton
                        onClick={() => setResetOpen(true)}
                        icon={RotateCcw}
                        label="Hard reset"
                        tone="danger"
                    />
                </div>
            </section>

            {/* KPI strip */}
            <section
                aria-label="Round stats"
                className="grid grid-cols-1 gap-3 sm:grid-cols-3"
            >
                <Kpi icon={ListMusic} label="This round" value={kpis.total} />
                <Kpi icon={Users} label="Members" value={kpis.members} />
                <Kpi icon={CheckCircle2} label="Played" value={kpis.played} />
            </section>

            {/* Now playing banner */}
            <AnimatePresence mode="wait">
                {nowPlaying && (
                    <motion.section
                        key={nowPlaying.id}
                        aria-label="Now playing"
                        {...(reduceMotion
                            ? {}
                            : {
                                  initial: { opacity: 0, scale: 0.98 },
                                  animate: { opacity: 1, scale: 1 },
                                  exit: { opacity: 0, scale: 0.98 },
                              })}
                        className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-emerald-500/5 p-5 backdrop-blur-xl sm:p-6"
                    >
                        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-300">
                                    <Disc3
                                        className={cn("h-6 w-6", !reduceMotion && "animate-spin")}
                                        style={!reduceMotion ? { animationDuration: "4s" } : undefined}
                                        aria-hidden
                                    />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                                        Now playing
                                    </p>
                                    <p className="truncate font-outfit text-xl font-black tracking-tighter">
                                        {nowPlaying.songName}
                                    </p>
                                    <p className="truncate text-sm font-light text-neutral-300">
                                        {nowPlaying.artistName}
                                    </p>
                                </div>
                            </div>
                            <ControlButton
                                onClick={advanceQueue}
                                icon={SkipForward}
                                label="Next track"
                                tone="brand"
                            />
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Filters */}
            <section
                aria-label="Filters"
                className="rounded-3xl border border-white/10 bg-neutral-900/40 p-4 backdrop-blur-xl sm:p-5"
            >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:items-end">
                        {/* Round */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="round-filter"
                                className="text-[11px] font-bold uppercase tracking-wide text-neutral-500"
                            >
                                Round
                            </label>
                            <select
                                id="round-filter"
                                value={String(roundFilter)}
                                onChange={(e) =>
                                    setRoundFilter(
                                        e.target.value === "all" ? "all" : Number(e.target.value),
                                    )
                                }
                                className="min-h-[44px] rounded-xl border border-white/10 bg-neutral-950/60 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            >
                                <option value="all">All rounds</option>
                                {rounds.map((r) => (
                                    <option key={r} value={r}>
                                        Round {r}
                                        {r === settings.currentRoundId ? " (current)" : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="status-filter"
                                className="text-[11px] font-bold uppercase tracking-wide text-neutral-500"
                            >
                                Status
                            </label>
                            <select
                                id="status-filter"
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value as SubmissionStatus | "all")
                                }
                                className="min-h-[44px] rounded-xl border border-white/10 bg-neutral-950/60 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            >
                                {STATUS_FILTERS.map((s) => (
                                    <option key={s} value={s}>
                                        {s === "all" ? "All statuses" : STATUS_META[s].label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search */}
                        <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
                            <label
                                htmlFor="search-filter"
                                className="text-[11px] font-bold uppercase tracking-wide text-neutral-500"
                            >
                                Search
                            </label>
                            <div className="relative">
                                <Search
                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
                                    aria-hidden
                                />
                                <input
                                    id="search-filter"
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Song, artist, Discord…"
                                    className="min-h-[44px] w-full rounded-xl border border-white/10 bg-neutral-950/60 pl-9 pr-3 text-sm text-white placeholder:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:w-64"
                                />
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-neutral-500">
                        Showing {filtered.length} of {submissions.length}
                    </p>
                </div>
            </section>

            {/* Bulk action bar */}
            <AnimatePresence>
                {selected.size > 0 && (
                    <motion.div
                        {...(reduceMotion
                            ? {}
                            : {
                                  initial: { opacity: 0, y: -8 },
                                  animate: { opacity: 1, y: 0 },
                                  exit: { opacity: 0, y: -8 },
                              })}
                        className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand/40 bg-brand/10 p-3 backdrop-blur-xl"
                    >
                        <span className="text-sm font-bold">
                            {selected.size} selected
                        </span>
                        <div className="ml-auto flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={copyLinks}
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-bold hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            >
                                <Copy className="h-4 w-4" aria-hidden /> Copy links
                            </button>
                            <button
                                type="button"
                                onClick={bulkDelete}
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-sm font-bold text-rose-300 hover:bg-rose-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                            >
                                <Trash2 className="h-4 w-4" aria-hidden /> Delete
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelected(new Set())}
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-bold hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                            >
                                Clear
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Queue list */}
            <section aria-label="Submissions" className="space-y-3">
                {/* Select-all header */}
                {filtered.length > 0 && (
                    <div className="flex items-center gap-3 px-1">
                        <button
                            type="button"
                            onClick={toggleSelectAll}
                            aria-label={allVisibleSelected ? "Deselect all" : "Select all"}
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-2 text-sm text-neutral-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                            {allVisibleSelected ? (
                                <CheckSquare className="h-4 w-4 text-brand" aria-hidden />
                            ) : (
                                <Square className="h-4 w-4" aria-hidden />
                            )}
                            Select all
                        </button>
                    </div>
                )}

                {loaded && filtered.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-neutral-900/40 p-10 text-center">
                        <p className="font-outfit text-lg font-black tracking-tighter text-white">
                            No submissions
                        </p>
                        <p className="mt-1 text-sm font-light text-neutral-400">
                            {submissions.length === 0
                                ? "The board is empty. Start a round and let the gang drop tracks."
                                : "Nothing matches these filters."}
                        </p>
                    </div>
                )}

                <ul className="space-y-3">
                    {filtered.map((s, i) => {
                        const isPlaying = s.status === "playing";
                        const isSelected = selected.has(s.id);
                        const tier = s.tier ? TIER_META[s.tier] : null;
                        const href = s.link || s.fileUrl;
                        return (
                            <motion.li
                                key={s.id}
                                {...(reduceMotion
                                    ? {}
                                    : {
                                          ...fade,
                                          transition: { delay: Math.min(i * 0.02, 0.2) },
                                      })}
                                className={cn(
                                    "rounded-3xl border bg-neutral-900/40 p-4 backdrop-blur-xl transition-colors sm:p-5",
                                    isPlaying
                                        ? "border-emerald-500/50 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_12px_40px_-12px_rgba(16,185,129,0.4)]"
                                        : "border-white/10",
                                    isSelected && !isPlaying && "border-brand/40",
                                )}
                            >
                                <div className="flex flex-col gap-4">
                                    {/* Top row: select + meta */}
                                    <div className="flex items-start gap-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleSelect(s.id)}
                                            aria-label={
                                                isSelected
                                                    ? `Deselect ${s.songName}`
                                                    : `Select ${s.songName}`
                                            }
                                            aria-pressed={isSelected}
                                            className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-lg text-neutral-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                        >
                                            {isSelected ? (
                                                <CheckSquare className="h-5 w-5 text-brand" aria-hidden />
                                            ) : (
                                                <Square className="h-5 w-5" aria-hidden />
                                            )}
                                        </button>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="truncate font-outfit text-lg font-black tracking-tighter text-white">
                                                    {s.songName || "Untitled"}
                                                </h3>
                                                {(s.priority ?? 0) > 0 && (
                                                    <Crown
                                                        className="h-4 w-4 shrink-0 text-amber-300"
                                                        aria-label="Priority submission"
                                                    />
                                                )}
                                            </div>
                                            <p className="truncate text-sm font-light text-neutral-300">
                                                {s.artistName || "Unknown artist"}
                                            </p>

                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <Badge className={STATUS_META[s.status].className}>
                                                    {STATUS_META[s.status].label}
                                                </Badge>
                                                {tier && (
                                                    <Badge className={tier.className}>{tier.label}</Badge>
                                                )}
                                                <Badge className="bg-white/5 text-neutral-400 border-white/15">
                                                    R{s.roundId}
                                                </Badge>
                                                {s.discordName && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
                                                        <Users className="h-3 w-3" aria-hidden />
                                                        {s.discordName}
                                                    </span>
                                                )}
                                                <span className="text-xs text-neutral-500">
                                                    {formatDuration(s.durationSec)}
                                                </span>
                                            </div>

                                            {s.note && (
                                                <p className="mt-2 line-clamp-2 text-xs font-light italic text-neutral-400">
                                                    “{s.note}”
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Audio / link */}
                                    {s.fileUrl ? (
                                        <audio
                                            controls
                                            preload="none"
                                            src={s.fileUrl}
                                            onPlay={() => setActiveAudioId(s.id)}
                                            aria-label={`Audio for ${s.songName} by ${s.artistName}`}
                                            className={cn(
                                                "h-10 w-full rounded-lg",
                                                activeAudioId === s.id && "ring-1 ring-brand/50",
                                            )}
                                        >
                                            Your browser does not support audio playback.
                                        </audio>
                                    ) : s.link ? (
                                        <a
                                            href={s.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex min-h-[44px] w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                        >
                                            <ExternalLink className="h-4 w-4" aria-hidden />
                                            Open link
                                        </a>
                                    ) : (
                                        <p className="text-xs text-neutral-600">No audio or link.</p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex flex-wrap gap-2">
                                        {ROW_ACTIONS.map(({ status, label, icon: Icon }) => {
                                            const active = s.status === status;
                                            return (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => setStatus(s.id, status)}
                                                    aria-pressed={active}
                                                    className={cn(
                                                        "inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors",
                                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                                                        active
                                                            ? STATUS_META[status].className
                                                            : "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10",
                                                    )}
                                                >
                                                    <Icon className="h-3.5 w-3.5" aria-hidden />
                                                    {label}
                                                </button>
                                            );
                                        })}

                                        {href && (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(href);
                                                        toast.success("Link copied.");
                                                    } catch {
                                                        toast.error("Clipboard blocked.");
                                                    }
                                                }}
                                                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-neutral-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                                            >
                                                <Copy className="h-3.5 w-3.5" aria-hidden />
                                                Copy link
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => deleteOne(s)}
                                            aria-label={`Delete ${s.songName}`}
                                            className="ml-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.li>
                        );
                    })}
                </ul>
            </section>

            {/* Hard reset modal */}
            <AnimatePresence>
                {resetOpen && (
                    <motion.div
                        {...(reduceMotion
                            ? {}
                            : {
                                  initial: { opacity: 0 },
                                  animate: { opacity: 1 },
                                  exit: { opacity: 0 },
                              })}
                        className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="reset-title"
                        onClick={(e) => {
                            if (e.target === e.currentTarget && !resetting) {
                                setResetOpen(false);
                                setResetText("");
                            }
                        }}
                    >
                        <motion.div
                            {...(reduceMotion
                                ? {}
                                : {
                                      initial: { opacity: 0, scale: 0.95, y: 10 },
                                      animate: { opacity: 1, scale: 1, y: 0 },
                                      exit: { opacity: 0, scale: 0.95, y: 10 },
                                  })}
                            className="w-full max-w-md rounded-3xl border border-rose-500/40 bg-neutral-900/90 p-6 backdrop-blur-xl"
                        >
                            <div className="mb-4 flex items-center gap-3">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-500/20 text-rose-300">
                                    <AlertTriangle className="h-6 w-6" aria-hidden />
                                </span>
                                <h2
                                    id="reset-title"
                                    className="font-outfit text-xl font-black tracking-tighter"
                                >
                                    Hard reset everything
                                </h2>
                            </div>
                            <p className="text-sm font-light text-neutral-300">
                                This deletes{" "}
                                <strong className="font-bold text-white">
                                    all {submissions.length} submission
                                    {submissions.length === 1 ? "" : "s"}
                                </strong>{" "}
                                and resets the session to Round 1 (open, offline). This
                                cannot be undone.
                            </p>

                            <label
                                htmlFor="reset-confirm"
                                className="mt-5 block text-[11px] font-bold uppercase tracking-wide text-neutral-500"
                            >
                                Type{" "}
                                <span className="text-rose-300">RESET</span> to confirm
                            </label>
                            <input
                                id="reset-confirm"
                                type="text"
                                autoComplete="off"
                                value={resetText}
                                onChange={(e) => setResetText(e.target.value)}
                                placeholder="RESET"
                                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-white/10 bg-neutral-950/60 px-3 text-sm uppercase tracking-widest text-white placeholder:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                            />

                            <div className="mt-6 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setResetOpen(false);
                                        setResetText("");
                                    }}
                                    disabled={resetting}
                                    className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={hardReset}
                                    disabled={resetText.trim().toUpperCase() !== "RESET" || resetting}
                                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/20 px-4 py-2.5 text-sm font-black text-rose-200 hover:bg-rose-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <RotateCcw className="h-4 w-4" aria-hidden />
                                    {resetting ? "Resetting…" : "Hard reset"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

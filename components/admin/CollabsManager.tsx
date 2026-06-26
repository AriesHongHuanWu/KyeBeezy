"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    collection,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot,
    query,
    orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    Handshake,
    Search,
    Filter,
    Copy,
    Trash2,
    X,
    ExternalLink,
    Mail,
    Inbox,
    Eye,
    CheckCircle2,
    XCircle,
    Archive,
    Loader2,
    Clock,
    DollarSign,
    MessageSquare,
    Link2,
    FileAudio,
    User as UserIcon,
    Save,
    AlertTriangle,
    Tag,
    Hash,
} from "lucide-react";
import { COLLAB_TYPES } from "@/lib/site";
import type { Collab, CollabStatus } from "@/lib/types";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Status metadata — colours tuned to the dark admin shell.
// ---------------------------------------------------------------------------
const STATUS_META: Record<
    CollabStatus,
    { label: string; icon: typeof Eye; chip: string; dot: string; ring: string }
> = {
    new: {
        label: "New",
        icon: Inbox,
        chip: "bg-purple-500/10 text-purple-300 border-purple-500/30",
        dot: "bg-purple-400",
        ring: "focus-visible:ring-purple-500",
    },
    reviewing: {
        label: "Reviewing",
        icon: Eye,
        chip: "bg-sky-500/10 text-sky-300 border-sky-500/30",
        dot: "bg-sky-400",
        ring: "focus-visible:ring-sky-500",
    },
    accepted: {
        label: "Accepted",
        icon: CheckCircle2,
        chip: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
        dot: "bg-emerald-400",
        ring: "focus-visible:ring-emerald-500",
    },
    declined: {
        label: "Declined",
        icon: XCircle,
        chip: "bg-rose-500/10 text-rose-300 border-rose-500/30",
        dot: "bg-rose-400",
        ring: "focus-visible:ring-rose-500",
    },
    archived: {
        label: "Archived",
        icon: Archive,
        chip: "bg-neutral-500/10 text-neutral-300 border-white/10",
        dot: "bg-neutral-400",
        ring: "focus-visible:ring-neutral-500",
    },
};

const STATUS_ORDER: CollabStatus[] = ["new", "reviewing", "accepted", "declined", "archived"];

// Map a COLLAB_TYPES id to a human label (fall back to the raw value).
function typeLabel(typeId: string): string {
    return COLLAB_TYPES.find((t) => t.id === typeId)?.label ?? typeId;
}

// Heuristic: does a URL look like a directly-playable audio file?
function looksLikeAudio(url?: string, fileName?: string): boolean {
    const probe = `${url ?? ""} ${fileName ?? ""}`.toLowerCase();
    return /\.(mp3|wav|ogg|oga|m4a|aac|flac|webm)(\?|#|$)/.test(probe);
}

function toDate(c: Collab): Date | null {
    try {
        return c.createdAt ? c.createdAt.toDate() : null;
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------
// Local helpers (self-contained — nothing imported from app/admin/page.tsx).
// ---------------------------------------------------------------------------
function PanelHeading({
    title,
    subtitle,
    action,
}: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div>
                <h2 className="text-2xl sm:text-3xl font-black font-outfit tracking-tighter text-white mb-1 flex items-center gap-2.5">
                    <Handshake className="w-7 h-7 text-purple-400 shrink-0" aria-hidden="true" />
                    {title}
                </h2>
                {subtitle && <p className="text-neutral-500 text-sm sm:text-base">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

function StatusBadge({ status }: { status: CollabStatus }) {
    const meta = STATUS_META[status];
    const Icon = meta.icon;
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                meta.chip,
            )}
        >
            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
            {meta.label}
        </span>
    );
}

// ---------------------------------------------------------------------------
// Delete confirmation modal
// ---------------------------------------------------------------------------
function DeleteModal({
    collab,
    busy,
    onCancel,
    onConfirm,
}: {
    collab: Collab;
    busy: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    const reduced = usePrefersReducedMotion();
    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="collab-delete-title"
        >
            <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/30 bg-[#171717] p-6 shadow-2xl"
            >
                <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-rose-500/20 blur-[60px]" />
                <div className="flex items-start gap-3">
                    <span className="mt-0.5 rounded-xl bg-rose-500/15 p-2 text-rose-400">
                        <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                        <h3 id="collab-delete-title" className="text-lg font-bold text-white">
                            Delete inquiry?
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-neutral-400">
                            This permanently removes{" "}
                            <span className="font-semibold text-white">{collab.name || collab.email}</span>
                            &rsquo;s collaboration inquiry. This action cannot be undone.
                        </p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={busy}
                        className="min-h-[44px] rounded-lg px-4 py-2 font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-rose-600 px-5 py-2 font-bold text-white shadow-lg shadow-rose-900/30 transition-colors hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:opacity-60"
                    >
                        {busy ? (
                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                        )}
                        Delete
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Detail drawer
// ---------------------------------------------------------------------------
function DetailDrawer({
    collab,
    onClose,
    onStatusChange,
    onRequestDelete,
}: {
    collab: Collab;
    onClose: () => void;
    onStatusChange: (status: CollabStatus) => Promise<void>;
    onRequestDelete: () => void;
}) {
    const reduced = usePrefersReducedMotion();
    const [note, setNote] = useState(collab.adminNote ?? "");
    const [savingNote, setSavingNote] = useState(false);
    const [statusBusy, setStatusBusy] = useState(false);

    // Keep the editable note in sync if the underlying doc updates live.
    useEffect(() => {
        setNote(collab.adminNote ?? "");
    }, [collab.id, collab.adminNote]);

    // Close on Escape.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const date = toDate(collab);
    const noteDirty = note.trim() !== (collab.adminNote ?? "").trim();
    const isAudio = looksLikeAudio(collab.fileUrl, collab.fileName);

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(collab.email);
            toast.success("Email copied to clipboard");
        } catch {
            toast.error("Couldn't copy email");
        }
    };

    const saveNote = async () => {
        setSavingNote(true);
        try {
            await updateDoc(doc(db, "collabs", collab.id), { adminNote: note.trim() });
            toast.success("Note saved");
        } catch {
            toast.error("Failed to save note");
        } finally {
            setSavingNote(false);
        }
    };

    const changeStatus = async (status: CollabStatus) => {
        if (status === collab.status) return;
        setStatusBusy(true);
        try {
            await onStatusChange(status);
        } finally {
            setStatusBusy(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[110] flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-labelledby="collab-detail-title"
        >
            {/* Backdrop */}
            <motion.button
                type="button"
                aria-label="Close details"
                onClick={onClose}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduced ? undefined : { opacity: 0 }}
                className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.aside
                initial={reduced ? false : { x: "100%" }}
                animate={{ x: 0 }}
                exit={reduced ? undefined : { x: "100%" }}
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 34 }}
                className="relative flex h-full w-full max-w-lg flex-col border-l border-white/10 bg-[#121212] shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-white/5 p-5 sm:p-6">
                    <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <StatusBadge status={collab.status} />
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-neutral-300">
                                <Tag className="w-3 h-3" aria-hidden="true" />
                                {typeLabel(collab.type)}
                            </span>
                        </div>
                        <h3
                            id="collab-detail-title"
                            className="truncate text-xl font-black font-outfit tracking-tight text-white"
                        >
                            {collab.name || "Unnamed inquiry"}
                        </h3>
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-500">
                            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            {date
                                ? `${format(date, "PPp")} · ${formatDistanceToNow(date, { addSuffix: true })}`
                                : "Date unknown"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close details"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                {/* Body */}
                <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-5 sm:p-6">
                    {/* Contact */}
                    <section className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Contact</h4>
                        <div className="space-y-2.5 rounded-2xl border border-white/5 bg-neutral-900/40 p-4">
                            <DetailRow icon={UserIcon} label="Name" value={collab.name || "—"} />
                            <div className="flex items-start gap-3">
                                <Mail className="mt-0.5 w-4 h-4 shrink-0 text-neutral-500" aria-hidden="true" />
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs text-neutral-500">Email</div>
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`mailto:${collab.email}`}
                                            className="min-w-0 truncate font-medium text-purple-300 hover:text-purple-200 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
                                        >
                                            {collab.email}
                                        </a>
                                        <button
                                            type="button"
                                            onClick={copyEmail}
                                            aria-label="Copy email address"
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                                        >
                                            <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {collab.discordName && (
                                <DetailRow icon={Hash} label="Discord" value={collab.discordName} />
                            )}
                            {collab.budget && (
                                <DetailRow icon={DollarSign} label="Budget" value={collab.budget} />
                            )}
                        </div>
                    </section>

                    {/* Message */}
                    <section className="space-y-3">
                        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500">
                            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                            Message
                        </h4>
                        <p className="whitespace-pre-wrap break-words rounded-2xl border border-white/5 bg-neutral-900/40 p-4 text-sm leading-relaxed text-neutral-200">
                            {collab.message || <span className="text-neutral-500">No message provided.</span>}
                        </p>
                    </section>

                    {/* Attachments / link */}
                    {(collab.link || collab.fileUrl) && (
                        <section className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                Portfolio &amp; files
                            </h4>
                            <div className="space-y-3">
                                {collab.link && (
                                    <a
                                        href={collab.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex min-h-[44px] items-center justify-between gap-3 rounded-2xl border border-white/5 bg-neutral-900/40 p-4 transition-colors hover:border-purple-500/40 hover:bg-neutral-900/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                                    >
                                        <span className="flex min-w-0 items-center gap-3">
                                            <Link2 className="w-4 h-4 shrink-0 text-purple-400" aria-hidden="true" />
                                            <span className="min-w-0">
                                                <span className="block text-xs text-neutral-500">Portfolio link</span>
                                                <span className="block truncate text-sm font-medium text-purple-300">
                                                    {collab.link}
                                                </span>
                                            </span>
                                        </span>
                                        <ExternalLink
                                            className="w-4 h-4 shrink-0 text-neutral-500"
                                            aria-hidden="true"
                                        />
                                    </a>
                                )}

                                {collab.fileUrl && (
                                    <div className="rounded-2xl border border-white/5 bg-neutral-900/40 p-4">
                                        <div className="mb-2 flex items-center gap-2 text-sm text-neutral-300">
                                            <FileAudio className="w-4 h-4 shrink-0 text-purple-400" aria-hidden="true" />
                                            <span className="min-w-0 truncate font-medium">
                                                {collab.fileName || "Attached file"}
                                            </span>
                                        </div>
                                        {isAudio && (
                                            <audio
                                                controls
                                                preload="none"
                                                src={collab.fileUrl}
                                                className="w-full"
                                            >
                                                Your browser does not support the audio element.
                                            </audio>
                                        )}
                                        <a
                                            href={collab.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-purple-300 hover:text-purple-200 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded"
                                        >
                                            Open file in new tab
                                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Status changer */}
                    <section className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Status</h4>
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Change inquiry status">
                            {STATUS_ORDER.map((s) => {
                                const meta = STATUS_META[s];
                                const Icon = meta.icon;
                                const active = collab.status === s;
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => changeStatus(s)}
                                        disabled={statusBusy}
                                        aria-pressed={active}
                                        className={cn(
                                            "inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 disabled:opacity-60",
                                            meta.ring,
                                            active
                                                ? cn(meta.chip, "ring-1 ring-inset ring-white/10")
                                                : "border-white/10 text-neutral-400 hover:bg-white/5 hover:text-white",
                                        )}
                                    >
                                        <Icon className="w-4 h-4" aria-hidden="true" />
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* Admin note */}
                    <section className="space-y-3">
                        <label
                            htmlFor="collab-admin-note"
                            className="block text-xs font-bold uppercase tracking-wider text-neutral-500"
                        >
                            Admin note
                        </label>
                        <textarea
                            id="collab-admin-note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            placeholder="Private notes about this inquiry…"
                            className="w-full resize-y rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                        />
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={saveNote}
                                disabled={savingNote || !noteDirty}
                                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {savingNote ? (
                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                ) : (
                                    <Save className="w-4 h-4" aria-hidden="true" />
                                )}
                                Save note
                            </button>
                        </div>
                    </section>
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between gap-3 border-t border-white/5 p-5 sm:p-6">
                    <a
                        href={`mailto:${collab.email}`}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-200 transition-colors hover:bg-purple-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                    >
                        <Mail className="w-4 h-4" aria-hidden="true" />
                        Reply by email
                    </a>
                    <button
                        type="button"
                        onClick={onRequestDelete}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                        Delete
                    </button>
                </div>
            </motion.aside>
        </div>
    );
}

function DetailRow({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof UserIcon;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <Icon className="mt-0.5 w-4 h-4 shrink-0 text-neutral-500" aria-hidden="true" />
            <div className="min-w-0">
                <div className="text-xs text-neutral-500">{label}</div>
                <div className="break-words text-sm font-medium text-white">{value}</div>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function CollabsManager() {
    const [collabs, setCollabs] = useState<Collab[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [statusFilter, setStatusFilter] = useState<CollabStatus | "all">("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [search, setSearch] = useState("");

    const [openId, setOpenId] = useState<string | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleteBusy, setDeleteBusy] = useState(false);

    const reduced = usePrefersReducedMotion();

    // --- Live data ---
    useEffect(() => {
        const q = query(collection(db, "collabs"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(
            q,
            (snap) => {
                setCollabs(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Collab));
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("collabs snapshot error", err);
                setError("Couldn't load collaboration inquiries.");
                setLoading(false);
            },
        );
        return () => unsub();
    }, []);

    // --- Derived ---
    const counts = useMemo(() => {
        const base: Record<CollabStatus, number> = {
            new: 0,
            reviewing: 0,
            accepted: 0,
            declined: 0,
            archived: 0,
        };
        for (const c of collabs) {
            if (c.status in base) base[c.status] += 1;
        }
        return base;
    }, [collabs]);

    const typeOptions = useMemo(() => {
        const present = new Set(collabs.map((c) => c.type));
        // Known types first (in config order), then any unknown ones found in data.
        const known = COLLAB_TYPES.filter((t) => present.has(t.id)).map((t) => ({
            id: t.id,
            label: t.label,
        }));
        const knownIds = new Set(COLLAB_TYPES.map((t) => t.id));
        const extra = [...present]
            .filter((id) => !knownIds.has(id))
            .map((id) => ({ id, label: id }));
        return [...known, ...extra];
    }, [collabs]);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        return collabs.filter((c) => {
            if (statusFilter !== "all" && c.status !== statusFilter) return false;
            if (typeFilter !== "all" && c.type !== typeFilter) return false;
            if (term) {
                const hay = `${c.name} ${c.email} ${c.message}`.toLowerCase();
                if (!hay.includes(term)) return false;
            }
            return true;
        });
    }, [collabs, statusFilter, typeFilter, search]);

    const openCollab = useMemo(
        () => collabs.find((c) => c.id === openId) ?? null,
        [collabs, openId],
    );
    const pendingDelete = useMemo(
        () => collabs.find((c) => c.id === pendingDeleteId) ?? null,
        [collabs, pendingDeleteId],
    );

    // --- Mutations ---
    const changeStatus = useCallback(async (id: string, status: CollabStatus) => {
        try {
            await updateDoc(doc(db, "collabs", id), { status });
            toast.success(`Marked as ${STATUS_META[status].label.toLowerCase()}`);
        } catch {
            toast.error("Failed to update status");
        }
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!pendingDeleteId) return;
        setDeleteBusy(true);
        try {
            await deleteDoc(doc(db, "collabs", pendingDeleteId));
            toast.success("Inquiry deleted");
            if (openId === pendingDeleteId) setOpenId(null);
            setPendingDeleteId(null);
        } catch {
            toast.error("Failed to delete inquiry");
        } finally {
            setDeleteBusy(false);
        }
    }, [pendingDeleteId, openId]);

    const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all" || search.trim() !== "";

    return (
        <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <PanelHeading
                title="Collab Inquiries"
                subtitle="Triage collaboration, booking & feature requests."
                action={
                    <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 bg-neutral-900/40 px-3 py-1.5 text-sm text-neutral-400">
                        <Inbox className="w-4 h-4 text-purple-400" aria-hidden="true" />
                        <span className="font-bold text-white">{collabs.length}</span> total
                    </span>
                }
            />

            {/* KPI strip */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {STATUS_ORDER.map((s) => {
                    const meta = STATUS_META[s];
                    const Icon = meta.icon;
                    const active = statusFilter === s;
                    return (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setStatusFilter(active ? "all" : s)}
                            aria-pressed={active}
                            className={cn(
                                "group relative flex min-h-[44px] flex-col items-start gap-1 overflow-hidden rounded-2xl border bg-neutral-900/40 p-4 text-left transition-all focus:outline-none focus-visible:ring-2",
                                meta.ring,
                                active
                                    ? "border-purple-500/40 bg-neutral-900/70 ring-1 ring-inset ring-purple-500/20"
                                    : "border-white/5 hover:border-white/15 hover:bg-neutral-900/60",
                            )}
                        >
                            <span className="flex w-full items-center justify-between">
                                <span className={cn("h-2 w-2 rounded-full", meta.dot)} aria-hidden="true" />
                                <Icon
                                    className="w-4 h-4 text-neutral-600 transition-colors group-hover:text-neutral-400"
                                    aria-hidden="true"
                                />
                            </span>
                            <span className="text-2xl font-black font-outfit tracking-tight text-white">
                                {counts[s]}
                            </span>
                            <span className="text-xs font-medium text-neutral-500">{meta.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Toolbar */}
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/5 bg-neutral-900/40 p-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-neutral-500"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email or message…"
                        aria-label="Search inquiries"
                        className="min-h-[44px] w-full rounded-xl border border-white/10 bg-black/40 py-2 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:border-purple-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <label className="relative flex items-center">
                        <span className="sr-only">Filter by status</span>
                        <Filter
                            className="pointer-events-none absolute left-3 w-4 h-4 text-neutral-500"
                            aria-hidden="true"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as CollabStatus | "all")}
                            className="min-h-[44px] w-full appearance-none rounded-xl border border-white/10 bg-black/40 py-2 pl-10 pr-9 text-sm font-medium text-white focus:border-purple-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 sm:w-auto"
                        >
                            <option value="all">All statuses</option>
                            {STATUS_ORDER.map((s) => (
                                <option key={s} value={s}>
                                    {STATUS_META[s].label} ({counts[s]})
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="relative flex items-center">
                        <span className="sr-only">Filter by type</span>
                        <Tag
                            className="pointer-events-none absolute left-3 w-4 h-4 text-neutral-500"
                            aria-hidden="true"
                        />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="min-h-[44px] w-full appearance-none rounded-xl border border-white/10 bg-black/40 py-2 pl-10 pr-9 text-sm font-medium text-white focus:border-purple-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 sm:w-auto"
                        >
                            <option value="all">All types</option>
                            {typeOptions.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={() => {
                                setStatusFilter("all");
                                setTypeFilter("all");
                                setSearch("");
                            }}
                            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                        >
                            <X className="w-4 h-4" aria-hidden="true" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="rounded-2xl border border-white/5 bg-neutral-900/40 overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-neutral-500">
                        <Loader2 className="w-7 h-7 animate-spin text-purple-400" aria-hidden="true" />
                        <p className="text-sm">Loading inquiries…</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
                        <AlertTriangle className="w-8 h-8 text-rose-400" aria-hidden="true" />
                        <p className="text-sm text-neutral-400">{error}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
                        <span className="rounded-2xl bg-white/5 p-4 text-neutral-500">
                            <Inbox className="w-8 h-8" aria-hidden="true" />
                        </span>
                        <p className="text-base font-semibold text-white">
                            {collabs.length === 0 ? "No inquiries yet" : "No matching inquiries"}
                        </p>
                        <p className="max-w-xs text-sm text-neutral-500">
                            {collabs.length === 0
                                ? "New collaboration requests will appear here in real time."
                                : "Try adjusting your filters or search."}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-white/5">
                        {filtered.map((c) => {
                            const date = toDate(c);
                            const isAudio = looksLikeAudio(c.fileUrl, c.fileName);
                            return (
                                <li key={c.id}>
                                    <button
                                        type="button"
                                        onClick={() => setOpenId(c.id)}
                                        aria-haspopup="dialog"
                                        className="group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-white/[0.03] focus:outline-none focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-500 sm:px-6"
                                    >
                                        <span
                                            className={cn(
                                                "mt-1.5 hidden h-2.5 w-2.5 shrink-0 rounded-full sm:block",
                                                STATUS_META[c.status].dot,
                                            )}
                                            aria-hidden="true"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <span className="truncate font-bold text-white">
                                                    {c.name || c.email || "Unnamed"}
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-neutral-400">
                                                    {typeLabel(c.type)}
                                                </span>
                                                {c.budget && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300/80">
                                                        <DollarSign className="w-3 h-3" aria-hidden="true" />
                                                        {c.budget}
                                                    </span>
                                                )}
                                                {c.link && (
                                                    <Link2
                                                        className="w-3.5 h-3.5 text-neutral-500"
                                                        aria-label="Has portfolio link"
                                                    />
                                                )}
                                                {isAudio && (
                                                    <FileAudio
                                                        className="w-3.5 h-3.5 text-neutral-500"
                                                        aria-label="Has audio attachment"
                                                    />
                                                )}
                                            </span>
                                            <span className="mt-0.5 block truncate text-sm text-neutral-500">
                                                {c.message || c.email}
                                            </span>
                                        </span>
                                        <span className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                                            <StatusBadge status={c.status} />
                                            {date && (
                                                <span className="text-xs text-neutral-600">
                                                    {formatDistanceToNow(date, { addSuffix: true })}
                                                </span>
                                            )}
                                        </span>
                                        {/* Mobile-only status dot */}
                                        <span
                                            className={cn(
                                                "h-2.5 w-2.5 shrink-0 rounded-full sm:hidden",
                                                STATUS_META[c.status].dot,
                                            )}
                                            aria-label={STATUS_META[c.status].label}
                                        />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {!loading && !error && filtered.length > 0 && (
                <p className="mt-3 px-1 text-xs text-neutral-600">
                    Showing {filtered.length} of {collabs.length} inquir{collabs.length === 1 ? "y" : "ies"}.
                </p>
            )}

            {/* Drawer */}
            <AnimatePresence>
                {openCollab && (
                    <DetailDrawer
                        key={openCollab.id}
                        collab={openCollab}
                        onClose={() => setOpenId(null)}
                        onStatusChange={(status) => changeStatus(openCollab.id, status)}
                        onRequestDelete={() => setPendingDeleteId(openCollab.id)}
                    />
                )}
            </AnimatePresence>

            {/* Delete confirm */}
            <AnimatePresence>
                {pendingDelete && (
                    <DeleteModal
                        collab={pendingDelete}
                        busy={deleteBusy}
                        onCancel={() => setPendingDeleteId(null)}
                        onConfirm={confirmDelete}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

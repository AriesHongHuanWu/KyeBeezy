"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar as CalendarIcon,
    CalendarDays,
    List,
    ChevronLeft,
    ChevronRight,
    Plus,
    Pencil,
    Trash2,
    Copy,
    Bell,
    Download,
    ClipboardCopy,
    X,
    Clock,
    MapPin,
    LinkIcon,
    Repeat,
    Radio,
    Save,
} from "lucide-react";
import {
    format,
    parse,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    subMonths,
    addDays,
    addWeeks,
    isSameMonth,
    isBefore,
    isAfter,
    isValid,
    compareAsc,
} from "date-fns";
import { cn } from "@/lib/utils";
import { GlassPanel } from "@/components/ui/glass";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import {
    EVENT_TYPE_META,
    type CalendarEvent,
    type EventType,
    type EventRecurrence,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const EVENT_TYPES: EventType[] = ["stream", "release", "event", "collab", "drop"];

const RECURRENCE_OPTIONS: { value: EventRecurrence; label: string }[] = [
    { value: "none", label: "Does not repeat" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Every 2 weeks" },
    { value: "monthly", label: "Monthly" },
];

const DATE_FMT = "yyyy-MM-dd";

/** A single rendered instance of an event (may be a recurrence occurrence). */
interface EventOccurrence {
    /** The original Firestore doc. */
    base: CalendarEvent;
    /** yyyy-MM-dd for THIS occurrence. */
    date: string;
    /** Date object for THIS occurrence. */
    dateObj: Date;
    /** True when this is a generated recurrence (not the source date). */
    isRecurring: boolean;
}

/** Parse a yyyy-MM-dd string into a local Date (avoids UTC drift). */
function parseDay(d: string): Date {
    if (!d || typeof d !== "string") return new Date(NaN);
    return parse(d, DATE_FMT, new Date());
}

/** Combine a yyyy-MM-dd + HH:mm into a Date. Falls back to midnight. */
function combineDateTime(date: string, time?: string): Date {
    const base = parseDay(date);
    if (time && /^\d{1,2}:\d{2}$/.test(time)) {
        const [h, m] = time.split(":").map(Number);
        base.setHours(h, m, 0, 0);
    } else {
        base.setHours(0, 0, 0, 0);
    }
    return base;
}

/**
 * Expand a recurring event into occurrences that fall within [rangeStart, rangeEnd].
 * Does NOT mutate Firestore — display-only expansion.
 */
function expandEvent(
    ev: CalendarEvent,
    rangeStart: Date,
    rangeEnd: Date,
): EventOccurrence[] {
    const rec = ev.recurrence ?? "none";
    const firstDate = parseDay(ev.date);
    if (!isValid(firstDate)) return []; // skip legacy/corrupt docs with bad dates
    firstDate.setHours(0, 0, 0, 0);

    // Inclusive recurrence stop date.
    let until: Date | null = null;
    if (ev.recurrenceUntil) {
        try {
            until = parseDay(ev.recurrenceUntil);
            until.setHours(23, 59, 59, 999);
        } catch {
            until = null;
        }
    }

    const out: EventOccurrence[] = [];

    const pushIfInRange = (d: Date, isRecurring: boolean) => {
        if (isBefore(d, rangeStart) || isAfter(d, rangeEnd)) return;
        out.push({
            base: ev,
            date: format(d, DATE_FMT),
            dateObj: d,
            isRecurring,
        });
    };

    if (rec === "none") {
        pushIfInRange(firstDate, false);
        return out;
    }

    // Step generator with a hard safety cap.
    const MAX_ITER = 2000;
    let cursor = new Date(firstDate);
    let i = 0;
    while (i < MAX_ITER) {
        if (until && isAfter(cursor, until)) break;
        if (isAfter(cursor, rangeEnd)) break;
        if (!isBefore(cursor, rangeStart)) {
            pushIfInRange(cursor, i > 0);
        }
        // Advance.
        if (rec === "daily") cursor = addDays(cursor, 1);
        else if (rec === "weekly") cursor = addWeeks(cursor, 1);
        else if (rec === "biweekly") cursor = addWeeks(cursor, 2);
        else if (rec === "monthly") cursor = addMonths(cursor, 1);
        else break;
        i++;
    }
    return out;
}

/** ICS-escape a text field per RFC 5545. */
function icsEscape(text: string): string {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\r?\n/g, "\\n");
}

/** Format a Date for an ICS DTSTART/DTEND (floating local time). */
function icsDate(d: Date): string {
    return format(d, "yyyyMMdd'T'HHmmss");
}

function downloadBlob(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* Form state                                                          */
/* ------------------------------------------------------------------ */

interface EventFormState {
    title: string;
    type: EventType;
    date: string;
    time: string;
    endTime: string;
    description: string;
    url: string;
    location: string;
    recurrence: EventRecurrence;
    recurrenceUntil: string;
}

function emptyForm(date?: string): EventFormState {
    return {
        title: "",
        type: "stream",
        date: date ?? format(new Date(), DATE_FMT),
        time: "20:00",
        endTime: "",
        description: "",
        url: "",
        location: "",
        recurrence: "none",
        recurrenceUntil: "",
    };
}

function formFromEvent(ev: CalendarEvent): EventFormState {
    return {
        title: ev.title ?? "",
        type: ev.type ?? "stream",
        date: ev.date ?? format(new Date(), DATE_FMT),
        time: ev.time ?? "",
        endTime: ev.endTime ?? "",
        description: ev.description ?? "",
        url: ev.url ?? "",
        location: ev.location ?? "",
        recurrence: ev.recurrence ?? "none",
        recurrenceUntil: ev.recurrenceUntil ?? "",
    };
}

/* ------------------------------------------------------------------ */
/* Shared field styles                                                 */
/* ------------------------------------------------------------------ */

const fieldBase =
    "w-full rounded-xl bg-black/40 border border-white/10 px-3.5 py-2.5 text-sm text-white " +
    "placeholder:text-neutral-500 outline-none transition-colors " +
    "focus-visible:border-brand/60 focus-visible:ring-2 focus-visible:ring-brand/30";

const labelBase =
    "block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5";

const iconBtnBase =
    "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 " +
    "bg-white/5 text-neutral-300 transition-colors hover:bg-white/10 hover:text-white " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50";

/* ------------------------------------------------------------------ */
/* Subscriber badge                                                    */
/* ------------------------------------------------------------------ */

function SubscriberBadge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span
            className="inline-flex items-center gap-1 rounded-full bg-brand/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-2"
            title={`${count} subscriber${count === 1 ? "" : "s"}`}
            aria-label={`${count} subscribers`}
        >
            <Bell className="h-2.5 w-2.5" aria-hidden="true" />
            {count}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

type ViewMode = "month" | "agenda";

export default function ScheduleManagerPro() {
    const reduced = usePrefersReducedMotion();

    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewMode>("month");
    const [cursorMonth, setCursorMonth] = useState<Date>(() => startOfMonth(new Date()));

    // Per-event subscriber counts (eventId -> count).
    const [subCounts, setSubCounts] = useState<Record<string, number>>({});

    // Modal state.
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<EventFormState>(() => emptyForm());
    const [saving, setSaving] = useState(false);

    // Delete confirm.
    const [confirmDelete, setConfirmDelete] = useState<CalendarEvent | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Next stream setting.
    const [nextStream, setNextStream] = useState<string>("");
    const [savingNext, setSavingNext] = useState(false);

    const firstFieldRef = useRef<HTMLInputElement | null>(null);

    /* ---------- Firestore: events ---------- */
    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, "events"),
            (snap) => {
                const next = snap.docs.map(
                    (d) => ({ id: d.id, ...d.data() }) as CalendarEvent,
                );
                setEvents(next);
                setLoading(false);
            },
            (err) => {
                console.error("events snapshot error", err);
                toast.error("Failed to load events");
                setLoading(false);
            },
        );
        return () => unsub();
    }, []);

    /* ---------- Firestore: settings/schedule.nextStream ---------- */
    useEffect(() => {
        const unsub = onSnapshot(
            doc(db, "settings", "schedule"),
            (snap) => {
                const data = snap.data();
                if (data && typeof data.nextStream === "string") {
                    setNextStream(data.nextStream);
                }
            },
            (err) => console.error("schedule settings error", err),
        );
        return () => unsub();
    }, []);

    /* ---------- Firestore: per-event subscriber counts ---------- */
    // Subscribe to each event's subscribers subcollection. Re-runs when the set
    // of event ids changes.
    const eventIdsKey = useMemo(
        () => events.map((e) => e.id).sort().join("|"),
        [events],
    );
    useEffect(() => {
        if (!eventIdsKey) {
            setSubCounts({});
            return;
        }
        const ids = eventIdsKey.split("|").filter(Boolean);
        const unsubs = ids.map((id) =>
            onSnapshot(
                collection(db, "events", id, "subscribers"),
                (snap) => {
                    setSubCounts((prev) => ({ ...prev, [id]: snap.size }));
                },
                () => {
                    /* subcollection may be empty / restricted — ignore */
                },
            ),
        );
        return () => unsubs.forEach((u) => u());
    }, [eventIdsKey]);

    /* ---------- Visible range for the month grid ---------- */
    const gridDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(cursorMonth), { weekStartsOn: 0 });
        const end = endOfWeek(endOfMonth(cursorMonth), { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    }, [cursorMonth]);

    const gridRange = useMemo(() => {
        return { start: gridDays[0], end: gridDays[gridDays.length - 1] };
    }, [gridDays]);

    /* ---------- Occurrences in the visible grid, by day ---------- */
    const occurrencesByDay = useMemo(() => {
        const map = new Map<string, EventOccurrence[]>();
        for (const ev of events) {
            const occs = expandEvent(ev, gridRange.start, gridRange.end);
            for (const o of occs) {
                const arr = map.get(o.date) ?? [];
                arr.push(o);
                map.set(o.date, arr);
            }
        }
        // Sort each day's events by time.
        for (const arr of map.values()) {
            arr.sort((a, b) => (a.base.time ?? "").localeCompare(b.base.time ?? ""));
        }
        return map;
    }, [events, gridRange]);

    /* ---------- Agenda: upcoming occurrences (next ~120 days) ---------- */
    const upcoming = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const horizon = addDays(now, 120);
        const all: EventOccurrence[] = [];
        for (const ev of events) {
            all.push(...expandEvent(ev, now, horizon));
        }
        all.sort((a, b) => {
            const da = combineDateTime(a.date, a.base.time);
            const fb = combineDateTime(b.date, b.base.time);
            return compareAsc(da, fb);
        });
        return all;
    }, [events]);

    /* ---------- Modal open/close ---------- */
    const openCreate = useCallback((date?: string) => {
        setEditingId(null);
        setForm(emptyForm(date));
        setModalOpen(true);
    }, []);

    const openEdit = useCallback((ev: CalendarEvent) => {
        setEditingId(ev.id);
        setForm(formFromEvent(ev));
        setModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setEditingId(null);
    }, []);

    // Focus the first field when the modal opens; close on Escape.
    useEffect(() => {
        if (!modalOpen) return;
        const t = setTimeout(() => firstFieldRef.current?.focus(), 60);
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            clearTimeout(t);
            window.removeEventListener("keydown", onKey);
        };
    }, [modalOpen, closeModal]);

    /* ---------- Save (create or edit) ---------- */
    const handleSave = useCallback(async () => {
        if (!form.title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (!form.date) {
            toast.error("Date is required");
            return;
        }
        setSaving(true);

        // Build payload, omitting empty optional fields.
        const payload: Record<string, unknown> = {
            title: form.title.trim(),
            type: form.type,
            date: form.date,
            time: form.time || "",
            recurrence: form.recurrence,
        };
        payload.endTime = form.endTime || "";
        payload.description = form.description.trim();
        payload.url = form.url.trim();
        payload.location = form.location.trim();
        payload.recurrenceUntil =
            form.recurrence !== "none" ? form.recurrenceUntil || "" : "";

        try {
            if (editingId) {
                await updateDoc(doc(db, "events", editingId), payload);
                toast.success("Event updated");
            } else {
                await addDoc(collection(db, "events"), {
                    ...payload,
                    createdAt: serverTimestamp(),
                });
                toast.success("Event added");
            }
            closeModal();
        } catch (e) {
            console.error(e);
            toast.error(editingId ? "Failed to update" : "Failed to add");
        } finally {
            setSaving(false);
        }
    }, [form, editingId, closeModal]);

    /* ---------- Duplicate ---------- */
    const handleDuplicate = useCallback(async (ev: CalendarEvent) => {
        const t = toast.loading("Duplicating…");
        try {
            await addDoc(collection(db, "events"), {
                title: `${ev.title} (copy)`,
                type: ev.type,
                date: ev.date,
                time: ev.time ?? "",
                endTime: ev.endTime ?? "",
                description: ev.description ?? "",
                url: ev.url ?? "",
                location: ev.location ?? "",
                recurrence: ev.recurrence ?? "none",
                recurrenceUntil: ev.recurrenceUntil ?? "",
                createdAt: serverTimestamp(),
            });
            toast.success("Event duplicated", { id: t });
        } catch (e) {
            console.error(e);
            toast.error("Failed to duplicate", { id: t });
        }
    }, []);

    /* ---------- Delete ---------- */
    const handleDelete = useCallback(async () => {
        if (!confirmDelete) return;
        setDeleting(true);
        try {
            await deleteDoc(doc(db, "events", confirmDelete.id));
            toast.success("Event deleted");
            setConfirmDelete(null);
            if (editingId === confirmDelete.id) closeModal();
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete");
        } finally {
            setDeleting(false);
        }
    }, [confirmDelete, editingId, closeModal]);

    /* ---------- Next stream save ---------- */
    const handleSaveNextStream = useCallback(async () => {
        setSavingNext(true);
        try {
            await setDoc(
                doc(db, "settings", "schedule"),
                { nextStream: nextStream || "" },
                { merge: true },
            );
            toast.success("Next stream saved");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save next stream");
        } finally {
            setSavingNext(false);
        }
    }, [nextStream]);

    /* ---------- Export .ics ---------- */
    const handleExportIcs = useCallback(() => {
        if (upcoming.length === 0) {
            toast.error("No upcoming events to export");
            return;
        }
        const lines: string[] = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//Kye Beezy//Schedule Manager Pro//EN",
            "CALSCALE:GREGORIAN",
            "METHOD:PUBLISH",
        ];
        const stamp = icsDate(new Date());
        for (const occ of upcoming) {
            const ev = occ.base;
            const start = combineDateTime(occ.date, ev.time);
            // End: use endTime if present, otherwise +1h.
            let end: Date;
            if (ev.endTime && /^\d{1,2}:\d{2}$/.test(ev.endTime)) {
                end = combineDateTime(occ.date, ev.endTime);
                if (isBefore(end, start)) end = combineDateTime(occ.date, ev.time);
            } else {
                end = new Date(start.getTime() + 60 * 60 * 1000);
            }
            const uid = `${ev.id}-${occ.date}@kyebeezy`;
            const descParts: string[] = [];
            if (ev.description) descParts.push(ev.description);
            if (ev.url) descParts.push(ev.url);
            lines.push(
                "BEGIN:VEVENT",
                `UID:${uid}`,
                `DTSTAMP:${stamp}`,
                `DTSTART:${icsDate(start)}`,
                `DTEND:${icsDate(end)}`,
                `SUMMARY:${icsEscape(`[${EVENT_TYPE_META[ev.type].label}] ${ev.title}`)}`,
            );
            if (descParts.length) lines.push(`DESCRIPTION:${icsEscape(descParts.join("\n"))}`);
            if (ev.location) lines.push(`LOCATION:${icsEscape(ev.location)}`);
            if (ev.url) lines.push(`URL:${icsEscape(ev.url)}`);
            lines.push("END:VEVENT");
        }
        lines.push("END:VCALENDAR");
        // RFC 5545 uses CRLF line endings.
        const content = lines.join("\r\n");
        downloadBlob(
            content,
            `kye-beezy-schedule-${format(new Date(), DATE_FMT)}.ics`,
            "text/calendar;charset=utf-8",
        );
        toast.success(`Exported ${upcoming.length} events`);
    }, [upcoming]);

    /* ---------- Copy agenda as text ---------- */
    const handleCopyAgenda = useCallback(async () => {
        if (upcoming.length === 0) {
            toast.error("No upcoming events");
            return;
        }
        const lines = upcoming.map((occ) => {
            const ev = occ.base;
            const d = format(parseDay(occ.date), "EEE, MMM d");
            const t = ev.time ? ` @ ${ev.time}${ev.endTime ? `–${ev.endTime}` : ""}` : "";
            const loc = ev.location ? ` (${ev.location})` : "";
            return `• ${d}${t} — [${EVENT_TYPE_META[ev.type].label}] ${ev.title}${loc}`;
        });
        const text = `Kye Beezy — Upcoming Schedule\n\n${lines.join("\n")}`;
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Agenda copied to clipboard");
        } catch {
            toast.error("Clipboard blocked — see console");
            console.log(text);
        }
    }, [upcoming]);

    /* ---------- Render ---------- */
    const monthLabel = format(cursorMonth, "MMMM yyyy");
    const todayStr = format(new Date(), DATE_FMT);

    return (
        <motion.div
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
        >
            {/* ---------- Header ---------- */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-brand-2">
                        <CalendarDays className="h-5 w-5" aria-hidden="true" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">
                            Broadcast Planner
                        </span>
                    </div>
                    <h2 className="mt-1 font-outfit text-3xl font-black tracking-tighter text-white sm:text-4xl">
                        Schedule
                    </h2>
                    <p className="mt-1 max-w-md text-sm font-light text-neutral-400">
                        Plan streams, drops & releases for the Bonnet Gang. Recurring
                        events expand automatically.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleCopyAgenda}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                        <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Copy agenda</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleExportIcs}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                        <Download className="h-4 w-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Export .ics</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => openCreate()}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-gradient px-4 text-sm font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.35)] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        New event
                    </button>
                </div>
            </div>

            {/* ---------- Next stream setter ---------- */}
            <GlassPanel className="rounded-2xl border-white/10 bg-neutral-900/40 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex-1">
                        <label htmlFor="next-stream" className={labelBase}>
                            <span className="inline-flex items-center gap-1.5">
                                <Radio className="h-3 w-3 text-brand-2" aria-hidden="true" />
                                Next stream (countdown source)
                            </span>
                        </label>
                        <input
                            id="next-stream"
                            type="datetime-local"
                            value={nextStream}
                            onChange={(e) => setNextStream(e.target.value)}
                            className={cn(fieldBase, "max-w-xs [color-scheme:dark]")}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSaveNextStream}
                        disabled={savingNext}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand/40 bg-brand/15 px-4 text-sm font-bold text-brand-2 transition-colors hover:bg-brand/25 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {savingNext ? "Saving…" : "Save next stream"}
                    </button>
                </div>
            </GlassPanel>

            {/* ---------- Toolbar: view toggle + month nav + legend ---------- */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* View toggle */}
                <div
                    className="inline-flex rounded-xl border border-white/10 bg-black/30 p-1"
                    role="group"
                    aria-label="Calendar view"
                >
                    <button
                        type="button"
                        onClick={() => setView("month")}
                        aria-pressed={view === "month"}
                        className={cn(
                            "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
                            view === "month"
                                ? "bg-brand-gradient text-white"
                                : "text-neutral-400 hover:text-white",
                        )}
                    >
                        <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                        Month
                    </button>
                    <button
                        type="button"
                        onClick={() => setView("agenda")}
                        aria-pressed={view === "agenda"}
                        className={cn(
                            "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
                            view === "agenda"
                                ? "bg-brand-gradient text-white"
                                : "text-neutral-400 hover:text-white",
                        )}
                    >
                        <List className="h-4 w-4" aria-hidden="true" />
                        Agenda
                    </button>
                </div>

                {/* Month nav (only meaningful in month view, but harmless in agenda) */}
                {view === "month" && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCursorMonth((m) => subMonths(m, 1))}
                            className={iconBtnBase}
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <span className="min-w-40 text-center font-outfit text-lg font-black tracking-tight text-white">
                            {monthLabel}
                        </span>
                        <button
                            type="button"
                            onClick={() => setCursorMonth((m) => addMonths(m, 1))}
                            className={iconBtnBase}
                            aria-label="Next month"
                        >
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setCursorMonth(startOfMonth(new Date()))}
                            className="inline-flex min-h-11 items-center rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                        >
                            Today
                        </button>
                    </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    {EVENT_TYPES.map((t) => (
                        <span
                            key={t}
                            className="inline-flex items-center gap-1.5 text-xs text-neutral-400"
                        >
                            <span
                                className={cn("h-2.5 w-2.5 rounded-full", EVENT_TYPE_META[t].dot)}
                                aria-hidden="true"
                            />
                            {EVENT_TYPE_META[t].label}
                        </span>
                    ))}
                </div>
            </div>

            {/* ---------- Body ---------- */}
            {loading ? (
                <GlassPanel className="grid place-items-center rounded-2xl bg-neutral-900/40 p-16 text-neutral-400">
                    Loading schedule…
                </GlassPanel>
            ) : view === "month" ? (
                <MonthGrid
                    days={gridDays}
                    cursorMonth={cursorMonth}
                    todayStr={todayStr}
                    occurrencesByDay={occurrencesByDay}
                    subCounts={subCounts}
                    onAddDay={(d) => openCreate(d)}
                    onEdit={openEdit}
                />
            ) : (
                <AgendaView
                    upcoming={upcoming}
                    subCounts={subCounts}
                    todayStr={todayStr}
                    onEdit={openEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={(ev) => setConfirmDelete(ev)}
                    reduced={reduced}
                />
            )}

            {/* ---------- Create / edit modal ---------- */}
            <AnimatePresence>
                {modalOpen && (
                    <EventModal
                        form={form}
                        setForm={setForm}
                        editingId={editingId}
                        saving={saving}
                        firstFieldRef={firstFieldRef}
                        onClose={closeModal}
                        onSave={handleSave}
                        onDuplicate={
                            editingId
                                ? () => {
                                      const ev = events.find((e) => e.id === editingId);
                                      if (ev) handleDuplicate(ev);
                                  }
                                : undefined
                        }
                        onDelete={
                            editingId
                                ? () => {
                                      const ev = events.find((e) => e.id === editingId);
                                      if (ev) setConfirmDelete(ev);
                                  }
                                : undefined
                        }
                        reduced={reduced}
                    />
                )}
            </AnimatePresence>

            {/* ---------- Delete confirm ---------- */}
            <AnimatePresence>
                {confirmDelete && (
                    <ConfirmDialog
                        title="Delete event?"
                        message={`“${confirmDelete.title}” will be permanently removed.${
                            confirmDelete.recurrence && confirmDelete.recurrence !== "none"
                                ? " This removes the whole recurring series."
                                : ""
                        }`}
                        confirmLabel={deleting ? "Deleting…" : "Delete"}
                        busy={deleting}
                        onCancel={() => setConfirmDelete(null)}
                        onConfirm={handleDelete}
                        reduced={reduced}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/* Month grid                                                          */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function MonthGrid({
    days,
    cursorMonth,
    todayStr,
    occurrencesByDay,
    subCounts,
    onAddDay,
    onEdit,
}: {
    days: Date[];
    cursorMonth: Date;
    todayStr: string;
    occurrencesByDay: Map<string, EventOccurrence[]>;
    subCounts: Record<string, number>;
    onAddDay: (date: string) => void;
    onEdit: (ev: CalendarEvent) => void;
}) {
    return (
        <GlassPanel className="overflow-hidden rounded-2xl bg-neutral-900/40 p-2 sm:p-3">
            {/* Weekday header */}
            <div className="grid grid-cols-7">
                {WEEKDAYS.map((w) => (
                    <div
                        key={w}
                        className="px-1 pb-2 text-center text-[10px] font-bold uppercase tracking-wider text-neutral-500 sm:text-[11px]"
                    >
                        <span className="sm:hidden">{w[0]}</span>
                        <span className="hidden sm:inline">{w}</span>
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {days.map((day) => {
                    const dateStr = format(day, DATE_FMT);
                    const inMonth = isSameMonth(day, cursorMonth);
                    const isToday = dateStr === todayStr;
                    const occs = occurrencesByDay.get(dateStr) ?? [];
                    return (
                        <div
                            key={dateStr}
                            className={cn(
                                "group relative flex min-h-[88px] flex-col rounded-xl border p-1.5 transition-colors sm:min-h-[120px]",
                                inMonth
                                    ? "border-white/10 bg-white/[0.02]"
                                    : "border-transparent bg-transparent opacity-50",
                                isToday && "border-brand/50 bg-brand/10",
                            )}
                        >
                            {/* Day number + add button */}
                            <div className="mb-1 flex items-center justify-between">
                                <span
                                    className={cn(
                                        "grid h-6 w-6 place-items-center rounded-full text-xs font-bold",
                                        isToday
                                            ? "bg-brand-gradient text-white"
                                            : "text-neutral-400",
                                    )}
                                >
                                    {format(day, "d")}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onAddDay(dateStr)}
                                    aria-label={`Add event on ${format(day, "MMMM d")}`}
                                    className="grid h-6 w-6 place-items-center rounded-md text-neutral-500 opacity-0 transition-opacity hover:bg-white/10 hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 group-hover:opacity-100"
                                >
                                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            </div>

                            {/* Events */}
                            <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                                {occs.slice(0, 3).map((occ, i) => {
                                    const meta = EVENT_TYPE_META[occ.base.type];
                                    const count = subCounts[occ.base.id] ?? 0;
                                    return (
                                        <button
                                            key={`${occ.base.id}-${i}`}
                                            type="button"
                                            onClick={() => onEdit(occ.base)}
                                            title={`${occ.base.time ? occ.base.time + " " : ""}${occ.base.title}`}
                                            className={cn(
                                                "flex items-center gap-1 rounded-md bg-gradient-to-r px-1.5 py-1 text-left text-[10px] font-semibold text-white transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:text-[11px]",
                                                meta.color,
                                            )}
                                        >
                                            {occ.isRecurring && (
                                                <Repeat
                                                    className="h-2.5 w-2.5 shrink-0 opacity-80"
                                                    aria-label="recurring"
                                                />
                                            )}
                                            {occ.base.time && (
                                                <span className="hidden shrink-0 opacity-80 sm:inline">
                                                    {occ.base.time}
                                                </span>
                                            )}
                                            <span className="truncate">{occ.base.title}</span>
                                            {count > 0 && (
                                                <span
                                                    className="ml-auto inline-flex shrink-0 items-center gap-0.5 rounded-full bg-black/30 px-1 text-[9px]"
                                                    aria-label={`${count} subscribers`}
                                                >
                                                    <Bell className="h-2 w-2" aria-hidden="true" />
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                                {occs.length > 3 && (
                                    <span className="px-1 text-[10px] font-medium text-neutral-400">
                                        +{occs.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </GlassPanel>
    );
}

/* ------------------------------------------------------------------ */
/* Agenda view                                                         */
/* ------------------------------------------------------------------ */

function AgendaView({
    upcoming,
    subCounts,
    todayStr,
    onEdit,
    onDuplicate,
    onDelete,
    reduced,
}: {
    upcoming: EventOccurrence[];
    subCounts: Record<string, number>;
    todayStr: string;
    onEdit: (ev: CalendarEvent) => void;
    onDuplicate: (ev: CalendarEvent) => void;
    onDelete: (ev: CalendarEvent) => void;
    reduced: boolean;
}) {
    if (upcoming.length === 0) {
        return (
            <GlassPanel className="grid place-items-center rounded-2xl bg-neutral-900/40 p-16 text-center">
                <div>
                    <CalendarDays
                        className="mx-auto mb-3 h-10 w-10 text-neutral-600"
                        aria-hidden="true"
                    />
                    <p className="text-sm text-neutral-400">No upcoming events.</p>
                </div>
            </GlassPanel>
        );
    }

    // Group by day for nice section headers.
    const groups: { date: string; items: EventOccurrence[] }[] = [];
    for (const occ of upcoming) {
        const last = groups[groups.length - 1];
        if (last && last.date === occ.date) last.items.push(occ);
        else groups.push({ date: occ.date, items: [occ] });
    }

    return (
        <div className="space-y-5">
            {groups.map((group) => {
                const dayDate = parseDay(group.date);
                const isToday = group.date === todayStr;
                return (
                    <div key={group.date}>
                        <div className="mb-2 flex items-baseline gap-2">
                            <h3 className="font-outfit text-sm font-black uppercase tracking-wide text-white">
                                {format(dayDate, "EEEE, MMMM d")}
                            </h3>
                            {isToday && (
                                <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-2">
                                    Today
                                </span>
                            )}
                        </div>
                        <div className="space-y-2">
                            {group.items.map((occ, i) => (
                                <AgendaRow
                                    key={`${occ.base.id}-${i}`}
                                    occ={occ}
                                    count={subCounts[occ.base.id] ?? 0}
                                    onEdit={onEdit}
                                    onDuplicate={onDuplicate}
                                    onDelete={onDelete}
                                    reduced={reduced}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function AgendaRow({
    occ,
    count,
    onEdit,
    onDuplicate,
    onDelete,
    reduced,
}: {
    occ: EventOccurrence;
    count: number;
    onEdit: (ev: CalendarEvent) => void;
    onDuplicate: (ev: CalendarEvent) => void;
    onDelete: (ev: CalendarEvent) => void;
    reduced: boolean;
}) {
    const ev = occ.base;
    const meta = EVENT_TYPE_META[ev.type];
    return (
        <motion.div
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <GlassPanel
                hover
                className="flex flex-col gap-3 rounded-2xl bg-neutral-900/40 p-4 sm:flex-row sm:items-center"
            >
                {/* Accent bar + type */}
                <div className="flex items-center gap-3 sm:w-44 sm:shrink-0">
                    <span
                        className={cn(
                            "h-10 w-1.5 shrink-0 rounded-full bg-gradient-to-b",
                            meta.color,
                        )}
                        aria-hidden="true"
                    />
                    <div>
                        <span
                            className={cn(
                                "inline-block rounded-full bg-gradient-to-r px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white",
                                meta.color,
                            )}
                        >
                            {meta.label}
                        </span>
                        {ev.time && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                                <Clock className="h-3 w-3" aria-hidden="true" />
                                {ev.time}
                                {ev.endTime ? `–${ev.endTime}` : ""}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main */}
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="truncate font-semibold text-white">{ev.title}</h4>
                        {occ.isRecurring && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-neutral-300">
                                <Repeat className="h-2.5 w-2.5" aria-hidden="true" />
                                {ev.recurrence}
                            </span>
                        )}
                        <SubscriberBadge count={count} />
                    </div>
                    {ev.description && (
                        <p className="mt-0.5 line-clamp-2 text-sm font-light text-neutral-400">
                            {ev.description}
                        </p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                        {ev.location && (
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3 w-3" aria-hidden="true" />
                                {ev.location}
                            </span>
                        )}
                        {ev.url && (
                            <a
                                href={ev.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-brand-2 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                            >
                                <LinkIcon className="h-3 w-3" aria-hidden="true" />
                                Link
                            </a>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 sm:shrink-0">
                    <button
                        type="button"
                        onClick={() => onEdit(ev)}
                        aria-label={`Edit ${ev.title}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDuplicate(ev)}
                        aria-label={`Duplicate ${ev.title}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                        <Copy className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(ev)}
                        aria-label={`Delete ${ev.title}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 transition-colors hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                    >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            </GlassPanel>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/* Event modal (create + edit)                                         */
/* ------------------------------------------------------------------ */

function EventModal({
    form,
    setForm,
    editingId,
    saving,
    firstFieldRef,
    onClose,
    onSave,
    onDuplicate,
    onDelete,
    reduced,
}: {
    form: EventFormState;
    setForm: React.Dispatch<React.SetStateAction<EventFormState>>;
    editingId: string | null;
    saving: boolean;
    firstFieldRef: React.RefObject<HTMLInputElement | null>;
    onClose: () => void;
    onSave: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    reduced: boolean;
}) {
    const set = <K extends keyof EventFormState>(key: K, value: EventFormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    return (
        <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
        >
            <motion.div
                initial={reduced ? false : { opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, y: 30, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="custom-scrollbar max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/10 bg-neutral-900/95 p-5 shadow-[0_-8px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:rounded-3xl sm:p-6"
            >
                {/* Header */}
                <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                        <h3
                            id="event-modal-title"
                            className="font-outfit text-2xl font-black tracking-tighter text-white"
                        >
                            {editingId ? "Edit event" : "New event"}
                        </h3>
                        <p className="text-sm font-light text-neutral-400">
                            {editingId
                                ? "Update the details below."
                                : "Fill in the details for the Bonnet Gang."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-neutral-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSave();
                    }}
                    className="space-y-4"
                >
                    {/* Title */}
                    <div>
                        <label htmlFor="ev-title" className={labelBase}>
                            Title *
                        </label>
                        <input
                            id="ev-title"
                            ref={firstFieldRef}
                            value={form.title}
                            onChange={(e) => set("title", e.target.value)}
                            placeholder="e.g. Beat-making stream"
                            className={fieldBase}
                            required
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <span className={labelBase}>Type</span>
                        <div className="flex flex-wrap gap-2">
                            {EVENT_TYPES.map((t) => {
                                const meta = EVENT_TYPE_META[t];
                                const active = form.type === t;
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => set("type", t)}
                                        aria-pressed={active}
                                        className={cn(
                                            "inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
                                            active
                                                ? cn(
                                                      "border-transparent bg-gradient-to-r text-white",
                                                      meta.color,
                                                  )
                                                : "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10",
                                        )}
                                    >
                                        <span
                                            className={cn("h-2 w-2 rounded-full", meta.dot)}
                                            aria-hidden="true"
                                        />
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date + times */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                            <label htmlFor="ev-date" className={labelBase}>
                                Date *
                            </label>
                            <input
                                id="ev-date"
                                type="date"
                                value={form.date}
                                onChange={(e) => set("date", e.target.value)}
                                className={cn(fieldBase, "[color-scheme:dark]")}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="ev-time" className={labelBase}>
                                Start time
                            </label>
                            <input
                                id="ev-time"
                                type="time"
                                value={form.time}
                                onChange={(e) => set("time", e.target.value)}
                                className={cn(fieldBase, "[color-scheme:dark]")}
                            />
                        </div>
                        <div>
                            <label htmlFor="ev-endtime" className={labelBase}>
                                End time
                            </label>
                            <input
                                id="ev-endtime"
                                type="time"
                                value={form.endTime}
                                onChange={(e) => set("endTime", e.target.value)}
                                className={cn(fieldBase, "[color-scheme:dark]")}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="ev-desc" className={labelBase}>
                            Description
                        </label>
                        <textarea
                            id="ev-desc"
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            placeholder="What's going down?"
                            rows={3}
                            className={cn(fieldBase, "resize-y")}
                        />
                    </div>

                    {/* URL + location */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="ev-url" className={labelBase}>
                                Link / URL
                            </label>
                            <input
                                id="ev-url"
                                type="url"
                                inputMode="url"
                                value={form.url}
                                onChange={(e) => set("url", e.target.value)}
                                placeholder="https://twitch.tv/…"
                                className={fieldBase}
                            />
                        </div>
                        <div>
                            <label htmlFor="ev-location" className={labelBase}>
                                Location
                            </label>
                            <input
                                id="ev-location"
                                value={form.location}
                                onChange={(e) => set("location", e.target.value)}
                                placeholder="Online / venue"
                                className={fieldBase}
                            />
                        </div>
                    </div>

                    {/* Recurrence */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="ev-recurrence" className={labelBase}>
                                <span className="inline-flex items-center gap-1.5">
                                    <Repeat className="h-3 w-3" aria-hidden="true" />
                                    Repeats
                                </span>
                            </label>
                            <select
                                id="ev-recurrence"
                                value={form.recurrence}
                                onChange={(e) =>
                                    set("recurrence", e.target.value as EventRecurrence)
                                }
                                className={cn(fieldBase, "[color-scheme:dark]")}
                            >
                                {RECURRENCE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {form.recurrence !== "none" && (
                            <div>
                                <label htmlFor="ev-until" className={labelBase}>
                                    Repeat until
                                </label>
                                <input
                                    id="ev-until"
                                    type="date"
                                    value={form.recurrenceUntil}
                                    min={form.date}
                                    onChange={(e) => set("recurrenceUntil", e.target.value)}
                                    className={cn(fieldBase, "[color-scheme:dark]")}
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            {editingId && onDuplicate && (
                                <button
                                    type="button"
                                    onClick={onDuplicate}
                                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                                >
                                    <Copy className="h-4 w-4" aria-hidden="true" />
                                    Duplicate
                                </button>
                            )}
                            {editingId && onDelete && (
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                                >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                    Delete
                                </button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex min-h-11 items-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-gradient px-5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(168,85,247,0.35)] transition-transform hover:scale-[1.03] disabled:opacity-50 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                            >
                                <Save className="h-4 w-4" aria-hidden="true" />
                                {saving
                                    ? "Saving…"
                                    : editingId
                                      ? "Save changes"
                                      : "Create event"}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

/* ------------------------------------------------------------------ */
/* Confirm dialog                                                      */
/* ------------------------------------------------------------------ */

function ConfirmDialog({
    title,
    message,
    confirmLabel,
    busy,
    onCancel,
    onConfirm,
    reduced,
}: {
    title: string;
    message: string;
    confirmLabel: string;
    busy: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    reduced: boolean;
}) {
    return (
        <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onCancel();
            }}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
        >
            <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="w-full max-w-sm rounded-3xl border border-white/10 bg-neutral-900/95 p-6 shadow-[0_8px_48px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            >
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-red-500/15 text-red-400">
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3
                    id="confirm-title"
                    className="font-outfit text-xl font-black tracking-tight text-white"
                >
                    {title}
                </h3>
                <p className="mt-1.5 text-sm font-light text-neutral-400">{message}</p>
                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="inline-flex min-h-11 items-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        {confirmLabel}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Clock,
    Radio,
    MapPin,
    ExternalLink,
    ArrowRight,
    Bell,
    BellRing,
    CalendarX2,
    Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
    collection,
    query,
    orderBy,
    where,
    onSnapshot,
    doc,
    setDoc,
} from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { format, isToday, parseISO } from "date-fns";

import { db, messaging } from "@/lib/firebase";
import { SOCIALS } from "@/lib/site";
import { EVENT_TYPE_META, type CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { GlassPanel } from "@/components/ui/glass";
import { Tilt3D } from "@/components/ui/tilt3d";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const VAPID_KEY =
    "BCZyd7vxN07SCJjLE9XQZQcr64q0zPGOflsye2QHxMSKTXvd56nB90x3PWyLI3uBqJRH8tlF3yG9tWDqaleo8Bk";
const SUBS_KEY = "kye_event_subs";

/** Local-storage helpers for the per-card reminder state. */
function readSubs(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(SUBS_KEY);
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    } catch {
        return [];
    }
}

function writeSubs(ids: string[]): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(SUBS_KEY, JSON.stringify(ids));
    } catch {
        /* storage may be unavailable (private mode) — fail silently */
    }
}

/** Parse "HH:mm" against a base date, returning a Date or null. */
function timeToDate(base: Date, time: string | undefined): Date | null {
    if (!time) return null;
    const [h, m] = time.split(":").map((n) => Number(n));
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    return d;
}

/** Pretty 12h label for an "HH:mm" string. */
function formatTime(time: string | undefined): string {
    if (!time) return "";
    const parsed = timeToDate(new Date(), time);
    return parsed ? format(parsed, "h:mm a") : time;
}

/**
 * An event is LIVE if it's today and "now" sits inside its time window.
 * Window = [start, endTime] when endTime exists, otherwise a 4-hour default.
 */
function isLiveNow(event: CalendarEvent): boolean {
    let dateObj: Date;
    try {
        dateObj = parseISO(event.date);
    } catch {
        return false;
    }
    if (Number.isNaN(dateObj.getTime()) || !isToday(dateObj)) return false;

    const start = timeToDate(new Date(), event.time);
    if (!start) return false;

    const end =
        timeToDate(new Date(), event.endTime) ??
        new Date(start.getTime() + 4 * 60 * 60 * 1000);

    const now = new Date();
    return now >= start && now <= end;
}

export default function Schedule() {
    const reduced = usePrefersReducedMotion();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        let unsubscribe: (() => void) | undefined;

        try {
            const q = query(
                collection(db, "events"),
                where("date", ">=", todayStr),
                orderBy("date", "asc"),
            );

            unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const fetched = snapshot.docs.map((d) => ({
                        id: d.id,
                        ...(d.data() as Omit<CalendarEvent, "id">),
                    })) as CalendarEvent[];
                    setEvents(fetched);
                    setLoading(false);
                },
                (error) => {
                    console.error("Schedule fetch error:", error);
                    setLoading(false);
                },
            );
        } catch (error) {
            console.error(error);
            setLoading(false);
        }

        return () => {
            unsubscribe?.();
        };
    }, []);

    return (
        <section
            id="schedule"
            className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden py-24 text-foreground"
        >
            {/* Soft brand glow only — the empty LEFT column lets the fixed
                background video (his face) show through for an editorial feel. */}
            <div
                aria-hidden
                className="pointer-events-none absolute -right-32 top-1/4 -z-10 size-[28rem] rounded-full bg-brand/12 blur-[130px]"
            />

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 w-full">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    {/* LEFT: intentional negative space — reveals the artist's face
                        in the fixed background video. Hidden on mobile (single column). */}
                    <div aria-hidden className="hidden lg:block" />

                    {/* RIGHT: the content column */}
                    <div className="max-w-xl lg:ml-auto">
                        <SectionHeading eyebrow="Upcoming" title="THE" accent="AGENDA" align="left">
                            Streams, drops and releases — locked in. Set a reminder and
                            never miss the Bonnet Gang moving.
                        </SectionHeading>

                        {/* Discord-updates link, top of the column */}
                        <Reveal direction="up" delay={0.05} className="mt-7">
                            <a
                                href={SOCIALS.discord}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "group inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 py-3 sm:w-auto",
                                    "border border-brand/30 bg-brand/5 text-sm font-bold uppercase tracking-wider text-foreground",
                                    "backdrop-blur-md transition-colors hover:border-brand/60 hover:bg-brand/10",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                )}
                            >
                                <span>Join Discord for updates</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </a>
                        </Reveal>

                        {/* Loading */}
                        {loading && (
                            <GlassPanel
                                className="mt-8 flex flex-col items-center justify-center gap-4 px-6 py-16 text-muted-foreground"
                                role="status"
                                aria-live="polite"
                            >
                                <Loader2
                                    className={cn(
                                        "size-8 text-brand",
                                        !reduced && "animate-spin",
                                    )}
                                    aria-hidden
                                />
                                <span className="text-sm font-medium tracking-wide">
                                    Loading the agenda…
                                </span>
                            </GlassPanel>
                        )}

                        {/* Empty */}
                        {!loading && events.length === 0 && (
                            <Reveal direction="up" delay={0.1} className="mt-8">
                                <GlassPanel className="px-7 py-14 text-center sm:px-8">
                                    <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                                        <CalendarX2 className="size-8" aria-hidden />
                                    </div>
                                    <h3 className="font-outfit text-2xl font-black tracking-tighter text-foreground">
                                        Nothing on the calendar
                                    </h3>
                                    <p className="mx-auto mt-3 max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                                        The agenda&rsquo;s clear right now. Follow on Discord or
                                        Twitch to catch surprise streams the second they go live.
                                    </p>
                                    <a
                                        href={SOCIALS.discord}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            "mt-6 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-6 py-3 sm:w-auto",
                                            "btn-brand text-sm font-bold",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                        )}
                                    >
                                        Join the Bonnet Gang
                                        <ArrowRight className="size-4" />
                                    </a>
                                </GlassPanel>
                            </Reveal>
                        )}

                        {/* Compact vertical list of upcoming events — single column */}
                        {!loading && events.length > 0 && (
                            <div className="mt-8 flex flex-col gap-4">
                                {events.map((event, i) => (
                                    <ScheduleCard
                                        key={event.id}
                                        event={event}
                                        index={i}
                                        reduced={reduced}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------

function ScheduleCard({
    event,
    index,
    reduced,
}: {
    event: CalendarEvent;
    index: number;
    reduced: boolean;
}) {
    const meta = EVENT_TYPE_META[event.type] ?? EVENT_TYPE_META.event;
    const live = isLiveNow(event);

    let dateObj: Date | null = null;
    try {
        const parsed = parseISO(event.date);
        dateObj = Number.isNaN(parsed.getTime()) ? null : parsed;
    } catch {
        dateObj = null;
    }

    const [subscribed, setSubscribed] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setSubscribed(readSubs().includes(event.id));
    }, [event.id]);

    const toggleSub = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (busy) return;

            const current = readSubs();

            // Unsubscribe — local only (token already stored server-side).
            if (current.includes(event.id)) {
                const next = current.filter((id) => id !== event.id);
                writeSubs(next);
                setSubscribed(false);
                return;
            }

            // Subscribe — request push permission, store token under the event.
            setBusy(true);
            try {
                if (
                    typeof window !== "undefined" &&
                    "Notification" in window &&
                    messaging
                ) {
                    const permission = await Notification.requestPermission();
                    if (permission === "granted") {
                        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
                        if (token) {
                            await setDoc(doc(db, "events", event.id, "subscribers", token), {
                                token,
                                subscribedAt: new Date(),
                            });
                        }
                    }
                }
                const next = [...current, event.id];
                writeSubs(next);
                setSubscribed(true);
            } catch (err) {
                console.error("FCM subscribe error:", err);
            } finally {
                setBusy(false);
            }
        },
        [busy, event.id],
    );

    return (
        <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
                duration: 0.6,
                delay: Math.min(index * 0.06, 0.4),
                ease: [0.22, 1, 0.36, 1],
            }}
        >
            <Tilt3D max={6} scale={1.015}>
            <GlassPanel
                hover
                className={cn(
                    "group relative overflow-hidden p-4 sm:p-5",
                    live && "border-brand/50 bg-brand/[0.06]",
                )}
            >
                {/* Type strip — left edge accent */}
                <div
                    className={cn(
                        "pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b",
                        meta.color,
                    )}
                    aria-hidden
                />

                <div className="relative z-10 flex items-start gap-4 pl-2">
                    {/* Date badge */}
                    <div
                        className={cn(
                            "flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl border text-center transition-colors",
                            live
                                ? "border-transparent bg-brand text-white"
                                : "border-white/10 bg-white/[0.06] text-foreground group-hover:border-brand/30",
                        )}
                    >
                        {dateObj ? (
                            <>
                                <span className="text-[10px] font-bold uppercase leading-none tracking-wider opacity-80">
                                    {format(dateObj, "MMM")}
                                </span>
                                <span className="font-outfit text-2xl font-black leading-none">
                                    {format(dateObj, "d")}
                                </span>
                            </>
                        ) : (
                            <Calendar className="size-5" aria-hidden />
                        )}
                    </div>

                    {/* Center: type, title, meta */}
                    <div className="min-w-0 flex-1">
                        {/* Type label */}
                        <div className="mb-1.5 flex items-center gap-2">
                            <span className={cn("size-2 rounded-full", meta.dot)} aria-hidden />
                            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                {meta.label}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-outfit text-lg font-black leading-tight tracking-tight text-foreground">
                            {event.title}
                        </h3>

                        {/* Description */}
                        {event.description && (
                            <p className="mt-1 line-clamp-2 text-sm font-light leading-relaxed text-muted-foreground">
                                {event.description}
                            </p>
                        )}

                        {/* Meta: time + location */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                                {live ? (
                                    <Radio className="size-3.5 text-brand" aria-hidden />
                                ) : (
                                    <Clock className="size-3.5" aria-hidden />
                                )}
                                <span className="uppercase tracking-wide">
                                    {formatTime(event.time)}
                                    {event.endTime && ` – ${formatTime(event.endTime)}`}
                                </span>
                            </span>
                            {event.location && (
                                <span className="inline-flex min-w-0 items-center gap-1.5">
                                    <MapPin className="size-3.5 shrink-0" aria-hidden />
                                    <span className="truncate">{event.location}</span>
                                </span>
                            )}
                        </div>

                        {/* Detail / Watch link */}
                        {event.url && (
                            <a
                                href={event.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className={cn(
                                    "mt-3 inline-flex min-h-[36px] items-center gap-1.5 text-sm font-bold text-brand",
                                    "transition-colors hover:text-foreground",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md",
                                )}
                            >
                                {live ? "Watch now" : "Details"}
                                <ExternalLink className="size-3.5" aria-hidden />
                            </a>
                        )}

                        <AnimatePresence initial={false}>
                            {subscribed && !live && (
                                <motion.p
                                    key="reminder"
                                    initial={reduced ? false : { opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={reduced ? undefined : { opacity: 0, height: 0 }}
                                    className="overflow-hidden text-[10px] font-bold uppercase tracking-widest text-brand"
                                >
                                    <span className="mt-2 inline-flex items-center gap-1.5">
                                        <BellRing className="size-3" aria-hidden /> Reminder set
                                    </span>
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right: live pulse OR bell-subscribe */}
                    <div className="shrink-0">
                        {live ? (
                            <span
                                className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-red-500/40"
                                aria-label="Live now"
                            >
                                <span className="relative flex size-2">
                                    {!reduced && (
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-75" />
                                    )}
                                    <span className="relative inline-flex size-2 rounded-full bg-white" />
                                </span>
                                Live
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={toggleSub}
                                disabled={busy}
                                aria-pressed={subscribed}
                                aria-label={
                                    subscribed
                                        ? `Remove reminder for ${event.title}`
                                        : `Set a reminder for ${event.title}`
                                }
                                className={cn(
                                    "inline-flex size-11 items-center justify-center rounded-full transition-all",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                    "disabled:cursor-not-allowed disabled:opacity-60",
                                    subscribed
                                        ? "bg-brand text-white shadow-lg shadow-brand/40"
                                        : "bg-white/[0.06] text-muted-foreground hover:bg-brand/15 hover:text-foreground",
                                )}
                            >
                                {busy ? (
                                    <Loader2 className="size-4 animate-spin" aria-hidden />
                                ) : subscribed ? (
                                    <BellRing className="size-4" aria-hidden />
                                ) : (
                                    <Bell className="size-4" aria-hidden />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </GlassPanel>
            </Tilt3D>
        </motion.div>
    );
}

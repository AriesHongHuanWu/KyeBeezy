"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { db, storage } from "@/lib/firebase";
import {
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    doc,
    setDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useTransform,
    useSpring,
    type Variants,
} from "framer-motion";
import { toast } from "sonner";
import {
    ArrowRight,
    Check,
    Lock,
    WifiOff,
    Music2,
    User,
    Link as LinkIcon,
    Radio,
    Crown,
    UploadCloud,
    FileAudio,
    X,
    Youtube,
    Music4,
    Cloud,
    Apple,
    AudioWaveform,
    Loader2,
    MessageSquare,
    Trophy,
    Zap,
} from "lucide-react";
import { GlassPanel } from "@/components/ui/glass";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
import { TIERS, DISCORD_INVITE } from "@/lib/site";
import type { Submission } from "@/lib/types";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_FILE_BYTES = 25 * 1024 * 1024; // ~25 MB
const ACCEPTED_AUDIO = ".mp3,.wav,.m4a,audio/*";

type Status = "idle" | "submitted" | "round_locked" | "event_offline";
type InputMode = "link" | "upload";
type TierId = Submission["tier"]; // "squad" | "supporter" | "vip" | undefined

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.1 },
    },
};

const itemVariants: Variants = {
    hidden: { y: 18, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 26 } },
};

// ---------------------------------------------------------------------------
// Client-only platform detection (NEVER calls /api)
// ---------------------------------------------------------------------------

type Platform = {
    id: string;
    name: string;
    Icon: React.ComponentType<{ className?: string }>;
};

function detectPlatform(url: string): Platform | null {
    if (!url) return null;
    let host = "";
    try {
        host = new URL(url.trim()).hostname.toLowerCase().replace(/^www\./, "");
    } catch {
        return null;
    }
    if (host.includes("youtube.") || host === "youtu.be" || host.endsWith(".youtu.be")) {
        return { id: "youtube", name: "YouTube", Icon: Youtube };
    }
    if (host.includes("soundcloud.")) {
        return { id: "soundcloud", name: "SoundCloud", Icon: Cloud };
    }
    if (host.includes("spotify.")) {
        return { id: "spotify", name: "Spotify", Icon: Music4 };
    }
    if (host.includes("bandlab.")) {
        return { id: "bandlab", name: "BandLab", Icon: AudioWaveform };
    }
    if (host.includes("music.apple.") || host.includes("apple.")) {
        return { id: "apple", name: "Apple Music", Icon: Apple };
    }
    return null;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BonnetSubmit() {
    const reduced = usePrefersReducedMotion();

    // --- Form state ---
    const [songName, setSongName] = useState("");
    const [artistName, setArtistName] = useState("");
    const [note, setNote] = useState("");
    const [discordName, setDiscordName] = useState("");
    const [tierId, setTierId] = useState<TierId>("squad");

    const [inputMode, setInputMode] = useState<InputMode>("link");
    const [link, setLink] = useState("");

    // --- Upload state ---
    const [file, setFile] = useState<File | null>(null);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [uploadPct, setUploadPct] = useState(0);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragActive, setDragActive] = useState(false);

    // --- Submission / round state ---
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<Status>("idle");
    const [roundId, setRoundId] = useState<number>(1);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [showSplash, setShowSplash] = useState(false);

    const prevRoundRef = useRef<number>(1);
    const isFirstLoad = useRef(true);

    const platform = useMemo(() => detectPlatform(link), [link]);

    // --- 3D tilt (optional, disabled under reduced motion) ---
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 150, damping: 22 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 22 });
    const rotateX = useTransform(mouseY, [-0.5, 0.5], [6, -6]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], [-6, 6]);

    const handleTilt = (e: React.MouseEvent) => {
        if (reduced) return;
        const { width, height, left, top } = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        x.set((e.clientX - (left + width / 2)) / width);
        y.set((e.clientY - (top + height / 2)) / height);
    };
    const resetTilt = () => {
        x.set(0);
        y.set(0);
    };

    // -----------------------------------------------------------------------
    // ROUND SYSTEM — onSnapshot(settings/submission)
    // -----------------------------------------------------------------------
    useEffect(() => {
        const settingsRef = doc(db, "settings", "submission");
        const unsubscribe = onSnapshot(
            settingsRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    const currentRound: number =
                        typeof data.currentRoundId === "number" ? data.currentRoundId : 1;
                    const isOpen: boolean = data.isOpen !== false;
                    const isEventActive: boolean = data.isEventActive !== false;
                    const remoteSessionVersion: string =
                        typeof data.sessionVersion === "string" ? data.sessionVersion : "v1";

                    // ROUND-changed splash (only when round increases, not first load)
                    if (!isFirstLoad.current && currentRound > prevRoundRef.current) {
                        setShowSplash(true);
                        window.setTimeout(() => setShowSplash(false), 3500);
                    }
                    prevRoundRef.current = currentRound;
                    if (isFirstLoad.current) isFirstLoad.current = false;

                    setRoundId(currentRound);

                    // Reset lastSubmittedRound when the remote sessionVersion changes
                    const localSessionVersion = localStorage.getItem("sessionVersion");
                    if (localSessionVersion !== remoteSessionVersion) {
                        localStorage.removeItem("lastSubmittedRound");
                        localStorage.setItem("sessionVersion", remoteSessionVersion);
                    }

                    if (!isEventActive) {
                        setStatus("event_offline");
                    } else if (!isOpen) {
                        setStatus("round_locked");
                    } else {
                        const lastSubmittedRound = localStorage.getItem("lastSubmittedRound");
                        if (lastSubmittedRound && parseInt(lastSubmittedRound, 10) === currentRound) {
                            setStatus("submitted");
                        } else {
                            setStatus("idle");
                        }
                    }
                } else {
                    // Settings doc missing -> seed defaults
                    setDoc(settingsRef, {
                        currentRoundId: 1,
                        isOpen: true,
                        isEventActive: true,
                        sessionVersion: "v1",
                    });
                    setRoundId(1);
                    setStatus("idle");
                }
                setCheckingStatus(false);
            },
            (error) => {
                console.error(error);
                setCheckingStatus(false);
            },
        );
        return () => unsubscribe();
    }, []);

    // Revoke any object URL on unmount / change to avoid leaks.
    useEffect(() => {
        return () => {
            if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        };
    }, [filePreviewUrl]);

    // -----------------------------------------------------------------------
    // File handling
    // -----------------------------------------------------------------------
    const acceptFile = useCallback(
        (picked: File | null) => {
            if (!picked) return;
            const isAudio =
                picked.type.startsWith("audio/") ||
                /\.(mp3|wav|m4a)$/i.test(picked.name);
            if (!isAudio) {
                toast.error("Please choose an audio file (mp3, wav, m4a).");
                return;
            }
            if (picked.size > MAX_FILE_BYTES) {
                toast.error("That file is over 25MB. Trim it down or paste a link instead.");
                return;
            }
            setFilePreviewUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return URL.createObjectURL(picked);
            });
            setFile(picked);
            setUploadPct(0);
        },
        [],
    );

    const clearFile = () => {
        setFilePreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
        setFile(null);
        setUploadPct(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        acceptFile(e.dataTransfer.files?.[0] ?? null);
    };

    // Probe duration from the selected file (best-effort).
    const probeDuration = (objectUrl: string): Promise<number | undefined> =>
        new Promise((resolve) => {
            const a = document.createElement("audio");
            a.preload = "metadata";
            a.onloadedmetadata = () => {
                const d = a.duration;
                resolve(Number.isFinite(d) ? Math.round(d) : undefined);
            };
            a.onerror = () => resolve(undefined);
            a.src = objectUrl;
        });

    // -----------------------------------------------------------------------
    // Submit
    // -----------------------------------------------------------------------
    const uploadToStorage = (target: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const safeName = target.name.replace(/[^\w.\-]+/g, "_");
            const storageRef = ref(
                storage,
                `submissions/${roundId}/${Date.now()}_${safeName}`,
            );
            const uploadTask = uploadBytesResumable(storageRef, target);
            setUploading(true);
            uploadTask.on(
                "state_changed",
                (snap) => {
                    const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                    setUploadPct(pct);
                },
                (err) => {
                    setUploading(false);
                    reject(err);
                },
                async () => {
                    try {
                        const url = await getDownloadURL(uploadTask.snapshot.ref);
                        setUploading(false);
                        resolve(url);
                    } catch (err) {
                        setUploading(false);
                        reject(err);
                    }
                },
            );
        });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading || uploading) return;

        // Validation
        if (!songName.trim() || !artistName.trim()) {
            toast.error("Add a track title and artist name.");
            return;
        }
        if (inputMode === "link") {
            if (!link.trim() || !/^https?:\/\//i.test(link.trim())) {
                toast.error("Paste a valid track link (starting with http).");
                return;
            }
        } else if (!file) {
            toast.error("Upload an audio file, or switch to link mode.");
            return;
        }

        setLoading(true);
        try {
            // Resolve the chosen tier's priority.
            const tier = TIERS.find((t) => t.id === tierId);
            const priority = tier?.submitPriority ?? 0;

            // Build the Submission payload (omit undefined fields for Firestore).
            const payload: Record<string, unknown> = {
                songName: songName.trim(),
                artistName: artistName.trim(),
                tier: tierId,
                priority,
                roundId,
                submittedAt: serverTimestamp(),
                status: "pending",
            };
            if (note.trim()) payload.note = note.trim();
            if (discordName.trim()) payload.discordName = discordName.trim();

            if (inputMode === "link") {
                payload.link = link.trim();
            } else if (file) {
                // Upload audio -> Storage, then capture URL + metadata.
                const fileUrl = await uploadToStorage(file);
                payload.fileUrl = fileUrl;
                payload.fileName = file.name;
                if (filePreviewUrl) {
                    const durationSec = await probeDuration(filePreviewUrl);
                    if (durationSec !== undefined) payload.durationSec = durationSec;
                }
            }

            await addDoc(collection(db, "submissions"), payload);

            localStorage.setItem("lastSubmittedRound", roundId.toString());
            setStatus("submitted");
            toast.success("You're in the queue — get ready to hear it LIVE!");

            // Reset the form for next round.
            setSongName("");
            setArtistName("");
            setNote("");
            setLink("");
            clearFile();
        } catch (error) {
            console.error(error);
            toast.error("Submission failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const selectedTier = TIERS.find((t) => t.id === tierId);
    const isMember = (selectedTier?.submitPriority ?? 0) > 0;

    // -----------------------------------------------------------------------
    // Render
    // -----------------------------------------------------------------------
    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground font-sans">
            <SiteNav />

            {/* Full-bleed brand aurora background */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div
                    className={cn(
                        "absolute -top-1/4 left-1/2 h-[80vh] w-[80vh] -translate-x-1/2 rounded-full bg-brand-aurora opacity-25 blur-[140px]",
                        !reduced && "animate-aurora",
                    )}
                />
                <div
                    className={cn(
                        "absolute bottom-[-20%] right-[-10%] h-[60vh] w-[60vh] rounded-full bg-brand-2/20 blur-[140px]",
                        !reduced && "animate-blob",
                    )}
                />
                <div
                    className={cn(
                        "absolute bottom-[-10%] left-[-10%] h-[55vh] w-[55vh] rounded-full bg-brand-3/20 blur-[140px]",
                        !reduced && "animate-blob animation-delay-4000",
                    )}
                />
                <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.04))] dark:bg-[radial-gradient(transparent,rgba(0,0,0,0.4))]" />
            </div>

            {/* --- ROUND-changed splash --- */}
            <AnimatePresence>
                {showSplash && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/90 backdrop-blur-2xl px-6"
                        role="status"
                        aria-live="polite"
                    >
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.4, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="relative text-center"
                        >
                            <div className="absolute inset-0 -z-10 rounded-full bg-brand/20 blur-[100px]" />
                            <p className="mb-3 text-sm font-bold uppercase tracking-[0.4em] text-brand">
                                Queue refreshed
                            </p>
                            <h1 className="font-outfit text-6xl font-black leading-[0.95] tracking-tighter text-foreground sm:text-8xl">
                                ROUND <span className="text-gradient-brand">{roundId}</span>
                            </h1>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                className="mx-auto mt-5 h-1.5 max-w-xs rounded-full bg-brand-gradient"
                            />
                            <p className="mt-5 text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
                                Drop your heat
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Main content --- */}
            <main className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
                {/* Hero / heading */}
                <div className="mb-10 text-center sm:mb-14">
                    <Reveal direction="none">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brand backdrop-blur-md">
                            {status === "event_offline" ? (
                                <>
                                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                                    Offline
                                </>
                            ) : (
                                <>
                                    <span
                                        className={cn(
                                            "size-1.5 rounded-full bg-brand",
                                            !reduced && "animate-pulse",
                                        )}
                                    />
                                    Live • Round {roundId}
                                </>
                            )}
                        </div>
                    </Reveal>

                    <SectionHeading
                        align="center"
                        title={<>DROP THE</>}
                        accent="HEAT"
                    >
                        Get heard <span className="font-semibold text-foreground">LIVE on stream</span> + a
                        shot at promotion. Drop your track into Kye&apos;s queue — Bonnet Gang members jump
                        the line.
                    </SectionHeading>
                </div>

                {/* Loading skeleton while we resolve round status */}
                {checkingStatus ? (
                    <GlassPanel className="mx-auto flex max-w-xl items-center justify-center gap-3 p-12 text-muted-foreground">
                        <Loader2 className="size-5 animate-spin text-brand" aria-hidden="true" />
                        <span className="text-sm font-medium">Checking the queue…</span>
                    </GlassPanel>
                ) : (
                    <motion.div
                        onMouseMove={handleTilt}
                        onMouseLeave={resetTilt}
                        style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 1200 }}
                        className="mx-auto max-w-xl [transform-style:preserve-3d]"
                    >
                        <AnimatePresence mode="wait">
                            {/* STATE: OFFLINE */}
                            {status === "event_offline" && (
                                <StatusCard
                                    key="offline"
                                    icon={<WifiOff className="size-9 text-muted-foreground" aria-hidden="true" />}
                                    tone="muted"
                                    title="Stream is offline"
                                    body={
                                        <>
                                            The queue opens when Kye goes live. Get an alert the second it
                                            does.
                                        </>
                                    }
                                    action={
                                        <a
                                            href={DISCORD_INVITE}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-brand inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                        >
                                            <Radio className="size-4" aria-hidden="true" /> Get live alerts
                                        </a>
                                    }
                                    reduced={reduced}
                                />
                            )}

                            {/* STATE: LOCKED */}
                            {status === "round_locked" && (
                                <StatusCard
                                    key="locked"
                                    icon={<Lock className="size-9 text-brand" aria-hidden="true" />}
                                    tone="brand"
                                    title="Round locked"
                                    body={
                                        <>
                                            Submissions are paused while Kye spins the current round. The next
                                            round opens soon — stay close.
                                        </>
                                    }
                                    action={
                                        <Link
                                            href="/join"
                                            className="btn-brand inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                        >
                                            <Crown className="size-4" aria-hidden="true" /> Skip the line next
                                            round
                                        </Link>
                                    }
                                    reduced={reduced}
                                />
                            )}

                            {/* STATE: SUBMITTED */}
                            {status === "submitted" && (
                                <motion.div
                                    key="submitted"
                                    initial={{ opacity: 0, scale: 0.94 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
                                >
                                    <GlassPanel className="relative overflow-hidden p-8 text-center sm:p-10">
                                        <div className="relative z-10">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200, damping: 12 }}
                                                className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border border-brand/30 bg-brand/15"
                                            >
                                                <Check className="size-10 text-brand" aria-hidden="true" />
                                            </motion.div>
                                            <h2 className="font-outfit text-3xl font-black tracking-tighter text-foreground">
                                                You&apos;re in the queue
                                            </h2>
                                            <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
                                                Locked in for{" "}
                                                <span className="font-semibold text-foreground">
                                                    Round {roundId}
                                                </span>
                                                . Keep the stream open — your track could be next, with a shot
                                                at a feature.
                                            </p>
                                            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                                                <a
                                                    href={DISCORD_INVITE}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="btn-brand inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                                >
                                                    <MessageSquare className="size-4" aria-hidden="true" /> Join
                                                    the Bonnet Gang
                                                </a>
                                                <Link
                                                    href="/"
                                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-card/40 px-6 text-sm font-bold text-foreground backdrop-blur-md transition-colors hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                                >
                                                    Back home
                                                </Link>
                                            </div>
                                        </div>
                                    </GlassPanel>
                                </motion.div>
                            )}

                            {/* STATE: IDLE — the form */}
                            {status === "idle" && (
                                <motion.div
                                    key="form"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                    exit={{ opacity: 0, y: -16 }}
                                >
                                    <GlassPanel className="p-5 sm:p-8">
                                        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                                            {/* Track title */}
                                            <motion.div variants={itemVariants} className="space-y-1.5">
                                                <label
                                                    htmlFor="songName"
                                                    className="ml-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                                                >
                                                    Track title
                                                </label>
                                                <div className="group relative">
                                                    <Music2
                                                        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand"
                                                        aria-hidden="true"
                                                    />
                                                    <input
                                                        id="songName"
                                                        name="songName"
                                                        type="text"
                                                        autoComplete="off"
                                                        value={songName}
                                                        onChange={(e) => setSongName(e.target.value)}
                                                        placeholder="e.g. Purple Satin"
                                                        className="w-full rounded-xl border border-border bg-card/40 py-3.5 pl-12 pr-4 font-medium text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-brand/50 focus:bg-card/60 focus:outline-none focus:ring-1 focus:ring-brand/50"
                                                    />
                                                </div>
                                            </motion.div>

                                            {/* Artist */}
                                            <motion.div variants={itemVariants} className="space-y-1.5">
                                                <label
                                                    htmlFor="artistName"
                                                    className="ml-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                                                >
                                                    Artist name
                                                </label>
                                                <div className="group relative">
                                                    <User
                                                        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand"
                                                        aria-hidden="true"
                                                    />
                                                    <input
                                                        id="artistName"
                                                        name="artistName"
                                                        type="text"
                                                        autoComplete="off"
                                                        value={artistName}
                                                        onChange={(e) => setArtistName(e.target.value)}
                                                        placeholder="Your artist tag"
                                                        className="w-full rounded-xl border border-border bg-card/40 py-3.5 pl-12 pr-4 font-medium text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-brand/50 focus:bg-card/60 focus:outline-none focus:ring-1 focus:ring-brand/50"
                                                    />
                                                </div>
                                            </motion.div>

                                            {/* Input mode toggle: link / upload */}
                                            <motion.div variants={itemVariants} className="space-y-2">
                                                <span className="ml-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    Your track
                                                </span>
                                                <div
                                                    role="tablist"
                                                    aria-label="Choose how to submit your track"
                                                    className="grid grid-cols-2 gap-1.5 rounded-xl border border-border bg-card/40 p-1.5"
                                                >
                                                    <ModeTab
                                                        active={inputMode === "link"}
                                                        onClick={() => setInputMode("link")}
                                                        icon={<LinkIcon className="size-4" aria-hidden="true" />}
                                                        label="Paste a link"
                                                    />
                                                    <ModeTab
                                                        active={inputMode === "upload"}
                                                        onClick={() => setInputMode("upload")}
                                                        icon={<UploadCloud className="size-4" aria-hidden="true" />}
                                                        label="Upload audio"
                                                    />
                                                </div>

                                                <AnimatePresence mode="wait" initial={false}>
                                                    {inputMode === "link" ? (
                                                        <motion.div
                                                            key="link-mode"
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="space-y-2 pt-1">
                                                                <label htmlFor="link" className="sr-only">
                                                                    Track link
                                                                </label>
                                                                <div className="group relative">
                                                                    <LinkIcon
                                                                        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand"
                                                                        aria-hidden="true"
                                                                    />
                                                                    <input
                                                                        id="link"
                                                                        name="link"
                                                                        type="url"
                                                                        inputMode="url"
                                                                        value={link}
                                                                        onChange={(e) => setLink(e.target.value)}
                                                                        placeholder="YouTube, SoundCloud, Spotify, BandLab…"
                                                                        className="w-full rounded-xl border border-border bg-card/40 py-3.5 pl-12 pr-4 font-medium text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-brand/50 focus:bg-card/60 focus:outline-none focus:ring-1 focus:ring-brand/50"
                                                                    />
                                                                </div>

                                                                {/* CLIENT-ONLY platform chip */}
                                                                <AnimatePresence>
                                                                    {platform && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: -4 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            exit={{ opacity: 0, y: -4 }}
                                                                            className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand"
                                                                        >
                                                                            <platform.Icon className="size-4" aria-hidden="true" />
                                                                            {platform.name} link detected
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="upload-mode"
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="pt-1">
                                                                <input
                                                                    ref={fileInputRef}
                                                                    id="audioFile"
                                                                    type="file"
                                                                    accept={ACCEPTED_AUDIO}
                                                                    className="sr-only"
                                                                    onChange={(e) =>
                                                                        acceptFile(e.target.files?.[0] ?? null)
                                                                    }
                                                                />
                                                                {!file ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => fileInputRef.current?.click()}
                                                                        onDragOver={(e) => {
                                                                            e.preventDefault();
                                                                            setDragActive(true);
                                                                        }}
                                                                        onDragLeave={() => setDragActive(false)}
                                                                        onDrop={onDrop}
                                                                        className={cn(
                                                                            "flex min-h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card/30 px-4 py-6 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                                                            dragActive && "border-brand/60 bg-brand/10",
                                                                        )}
                                                                        aria-label="Upload an audio file"
                                                                    >
                                                                        <UploadCloud
                                                                            className="size-7 text-brand"
                                                                            aria-hidden="true"
                                                                        />
                                                                        <span className="text-sm font-semibold text-foreground">
                                                                            Tap to upload, or drop a file
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            mp3, wav, m4a · up to 25MB
                                                                        </span>
                                                                    </button>
                                                                ) : (
                                                                    <div className="rounded-xl border border-border bg-card/40 p-3">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/15">
                                                                                <FileAudio
                                                                                    className="size-5 text-brand"
                                                                                    aria-hidden="true"
                                                                                />
                                                                            </span>
                                                                            <div className="min-w-0 flex-1">
                                                                                <p className="truncate text-sm font-semibold text-foreground">
                                                                                    {file.name}
                                                                                </p>
                                                                                <p className="text-xs text-muted-foreground">
                                                                                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                                                                                </p>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={clearFile}
                                                                                disabled={uploading}
                                                                                aria-label="Remove file"
                                                                                className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
                                                                            >
                                                                                <X className="size-4" aria-hidden="true" />
                                                                            </button>
                                                                        </div>

                                                                        {/* Inline audio preview */}
                                                                        {filePreviewUrl && (
                                                                            <audio
                                                                                controls
                                                                                src={filePreviewUrl}
                                                                                className="mt-3 w-full"
                                                                                aria-label={`Preview of ${file.name}`}
                                                                            >
                                                                                Your browser does not support audio playback.
                                                                            </audio>
                                                                        )}

                                                                        {/* Upload progress */}
                                                                        {(uploading || uploadPct > 0) && (
                                                                            <div className="mt-3">
                                                                                <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                                                                                    <span>
                                                                                        {uploadPct >= 100
                                                                                            ? "Upload complete"
                                                                                            : "Uploading…"}
                                                                                    </span>
                                                                                    <span>{uploadPct}%</span>
                                                                                </div>
                                                                                <div
                                                                                    className="h-1.5 w-full overflow-hidden rounded-full bg-card"
                                                                                    role="progressbar"
                                                                                    aria-valuenow={uploadPct}
                                                                                    aria-valuemin={0}
                                                                                    aria-valuemax={100}
                                                                                    aria-label="Upload progress"
                                                                                >
                                                                                    <div
                                                                                        className="h-full rounded-full bg-brand-gradient transition-[width] duration-200"
                                                                                        style={{ width: `${uploadPct}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>

                                            {/* Tier selector */}
                                            <motion.div variants={itemVariants} className="space-y-2">
                                                <span className="ml-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    Your tier
                                                </span>
                                                <div
                                                    role="radiogroup"
                                                    aria-label="Membership tier"
                                                    className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                                                >
                                                    {TIERS.map((t) => (
                                                        <TierOption
                                                            key={t.id}
                                                            active={tierId === t.id}
                                                            name={t.name}
                                                            tagline={t.tagline}
                                                            priority={t.submitPriority}
                                                            badge={t.badge}
                                                            onClick={() => setTierId(t.id)}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="ml-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                                                    <Crown
                                                        className="mt-0.5 size-3.5 shrink-0 text-brand"
                                                        aria-hidden="true"
                                                    />
                                                    <span>
                                                        Members jump the queue and get heard first.{" "}
                                                        <Link
                                                            href="/join"
                                                            className="font-semibold text-brand underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                                        >
                                                            Join the Bonnet Gang →
                                                        </Link>
                                                    </span>
                                                </p>
                                            </motion.div>

                                            {/* Discord username (shown / encouraged for members) */}
                                            <motion.div variants={itemVariants} className="space-y-1.5">
                                                <label
                                                    htmlFor="discordName"
                                                    className="ml-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                                                >
                                                    Discord username{" "}
                                                    <span className="font-medium normal-case tracking-normal text-muted-foreground/70">
                                                        {isMember ? "(verify your priority)" : "(optional)"}
                                                    </span>
                                                </label>
                                                <div className="group relative">
                                                    <MessageSquare
                                                        className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand"
                                                        aria-hidden="true"
                                                    />
                                                    <input
                                                        id="discordName"
                                                        name="discordName"
                                                        type="text"
                                                        autoComplete="off"
                                                        value={discordName}
                                                        onChange={(e) => setDiscordName(e.target.value)}
                                                        placeholder="yourname"
                                                        className="w-full rounded-xl border border-border bg-card/40 py-3.5 pl-12 pr-4 font-medium text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-brand/50 focus:bg-card/60 focus:outline-none focus:ring-1 focus:ring-brand/50"
                                                    />
                                                </div>
                                            </motion.div>

                                            {/* Note */}
                                            <motion.div variants={itemVariants} className="space-y-1.5">
                                                <label
                                                    htmlFor="note"
                                                    className="ml-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground"
                                                >
                                                    Note for Kye{" "}
                                                    <span className="font-medium normal-case tracking-normal text-muted-foreground/70">
                                                        (optional)
                                                    </span>
                                                </label>
                                                <textarea
                                                    id="note"
                                                    name="note"
                                                    value={note}
                                                    onChange={(e) => setNote(e.target.value)}
                                                    rows={2}
                                                    maxLength={280}
                                                    placeholder="Anything you want Kye to know about the track…"
                                                    className="w-full resize-none rounded-xl border border-border bg-card/40 px-4 py-3 font-medium text-foreground placeholder:text-muted-foreground/60 transition-all focus:border-brand/50 focus:bg-card/60 focus:outline-none focus:ring-1 focus:ring-brand/50"
                                                />
                                            </motion.div>

                                            {/* Submit */}
                                            <motion.button
                                                variants={itemVariants}
                                                type="submit"
                                                disabled={loading || uploading}
                                                className="btn-brand group mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-bold tracking-wide disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                            >
                                                {loading || uploading ? (
                                                    <>
                                                        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                                                        {uploading ? `Uploading ${uploadPct}%` : "Sending…"}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Zap className="size-5" aria-hidden="true" />
                                                        Send it to the queue
                                                        <ArrowRight
                                                            className="size-5 transition-transform group-hover:translate-x-1"
                                                            aria-hidden="true"
                                                        />
                                                    </>
                                                )}
                                            </motion.button>

                                            <motion.p
                                                variants={itemVariants}
                                                className="text-center text-xs text-muted-foreground"
                                            >
                                                One submission per round. Get heard LIVE + a shot at promotion.
                                            </motion.p>
                                        </form>
                                    </GlassPanel>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Reassurance strip */}
                <Reveal direction="up" delay={0.1} className="mx-auto mt-10 max-w-xl">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <FeaturePill
                            icon={<Radio className="size-4 text-brand" aria-hidden="true" />}
                            label="Heard live on stream"
                        />
                        <FeaturePill
                            icon={<Crown className="size-4 text-brand" aria-hidden="true" />}
                            label="Members skip the line"
                        />
                        <FeaturePill
                            icon={<Trophy className="size-4 text-brand" aria-hidden="true" />}
                            label="Shot at promotion"
                        />
                    </div>
                </Reveal>
            </main>

            <SiteFooter />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ModeTab({
    active,
    onClick,
    icon,
    label,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={cn(
                "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                    ? "bg-brand-gradient text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
            )}
        >
            {icon}
            {label}
        </button>
    );
}

function TierOption({
    active,
    name,
    tagline,
    priority,
    badge,
    onClick,
}: {
    active: boolean;
    name: string;
    tagline: string;
    priority: number;
    badge?: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${name}. ${tagline}`}
            onClick={onClick}
            className={cn(
                "relative flex min-h-16 flex-col items-start justify-center gap-0.5 rounded-xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                    ? "border-brand/60 bg-brand/10 shadow-[0_0_0_1px_var(--brand)]"
                    : "border-border bg-card/40 hover:border-brand/40",
            )}
        >
            <div className="flex w-full items-center justify-between gap-2">
                <span className="text-sm font-bold text-foreground">{name}</span>
                {active && <Check className="size-4 shrink-0 text-brand" aria-hidden="true" />}
            </div>
            <span className="text-[11px] leading-tight text-muted-foreground">{tagline}</span>
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-brand">
                {priority > 0 ? (
                    <>
                        <Crown className="size-3" aria-hidden="true" /> +{priority} priority
                    </>
                ) : (
                    "Standard queue"
                )}
            </span>
            {badge && (
                <span className="absolute -top-2 right-2 rounded-full bg-brand-gradient px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                    {badge}
                </span>
            )}
        </button>
    );
}

function StatusCard({
    icon,
    title,
    body,
    action,
    tone,
    reduced,
}: {
    icon: React.ReactNode;
    title: string;
    body: React.ReactNode;
    action: React.ReactNode;
    tone: "brand" | "muted";
    reduced: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
        >
            <GlassPanel className="p-8 text-center sm:p-10">
                <div
                    className={cn(
                        "mx-auto mb-6 flex size-20 items-center justify-center rounded-full border",
                        tone === "brand"
                            ? "border-brand/30 bg-brand/10"
                            : "border-border bg-card/50",
                        !reduced && tone === "brand" && "animate-glow",
                    )}
                >
                    {icon}
                </div>
                <h2 className="font-outfit text-2xl font-black tracking-tighter text-foreground sm:text-3xl">
                    {title}
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-muted-foreground">{body}</p>
                <div className="mt-7 flex justify-center">{action}</div>
            </GlassPanel>
        </motion.div>
    );
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card/30 px-3 py-2.5 text-center text-xs font-semibold text-foreground backdrop-blur-md">
            {icon}
            <span>{label}</span>
        </div>
    );
}

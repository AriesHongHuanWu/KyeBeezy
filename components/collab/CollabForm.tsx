"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import {
    User,
    Mail,
    Wallet,
    Link as LinkIcon,
    MessageSquare,
    Hash,
    UploadCloud,
    FileAudio,
    X,
    Loader2,
    Check,
    Send,
    Sparkles,
} from "lucide-react";
import { db, storage } from "@/lib/firebase";
import type { Collab } from "@/lib/types";
import { COLLAB_TYPES } from "@/lib/site";
import { GlassPanel } from "@/components/ui/glass";
import { Reveal } from "@/components/ui/reveal";
import { CollabTypeGrid } from "@/components/collab/CollabTypeGrid";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

interface FormState {
    name: string;
    email: string;
    budget: string;
    link: string;
    message: string;
    discordName: string;
}

const EMPTY_FORM: FormState = {
    name: "",
    email: "",
    budget: "",
    link: "",
    message: "",
    discordName: "",
};

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB cap for EPK / audio.
const ACCEPT = "audio/*,application/pdf,.zip";

function isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

type FieldErrors = Partial<Record<"name" | "email" | "type" | "message" | "link", string>>;

/** Shared input chrome so every field looks consistent. */
const inputClass = cn(
    "w-full rounded-xl border border-white/10 bg-black/30 py-3.5 pl-11 pr-4 text-foreground",
    "placeholder:text-muted-foreground/60 font-light",
    "transition-colors focus:border-brand/50 focus:bg-black/50 focus:outline-none focus-visible:ring-1 focus-visible:ring-brand/60",
);

export function CollabForm() {
    const reduced = usePrefersReducedMotion();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [type, setType] = useState<string | null>(null);
    const [errors, setErrors] = useState<FieldErrors>({});

    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

    const handleFile = (picked: File | null) => {
        if (!picked) {
            setFile(null);
            return;
        }
        if (picked.size > MAX_FILE_BYTES) {
            toast.error("File is too large. Max 25MB.");
            return;
        }
        setFile(picked);
    };

    const clearFile = () => {
        setFile(null);
        setUploadProgress(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const validate = (): FieldErrors => {
        const next: FieldErrors = {};
        if (!form.name.trim()) next.name = "Your name is required.";
        if (!form.email.trim()) next.email = "An email is required.";
        else if (!isValidEmail(form.email)) next.email = "Enter a valid email address.";
        if (!type) next.type = "Pick what kind of collab this is.";
        if (!form.message.trim()) next.message = "Tell us a bit about your idea.";
        else if (form.message.trim().length < 10) next.message = "A little more detail, please.";
        if (form.link.trim() && !/^https?:\/\//i.test(form.link.trim()))
            next.link = "Links should start with http:// or https://";
        return next;
    };

    /** Uploads the optional file with resumable progress, resolving to its details. */
    const uploadFile = (picked: File): Promise<{ fileUrl: string; fileName: string }> =>
        new Promise((resolve, reject) => {
            const storageRef = ref(storage, `collabs/${Date.now()}_${picked.name}`);
            const task = uploadBytesResumable(storageRef, picked);
            setUploadProgress(0);
            task.on(
                "state_changed",
                (snapshot) => {
                    const pct = snapshot.totalBytes
                        ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
                        : 0;
                    setUploadProgress(pct);
                },
                (err) => reject(err),
                async () => {
                    try {
                        const fileUrl = await getDownloadURL(task.snapshot.ref);
                        resolve({ fileUrl, fileName: picked.name });
                    } catch (err) {
                        reject(err);
                    }
                },
            );
        });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        const found = validate();
        setErrors(found);
        if (Object.keys(found).length > 0) {
            toast.error("Please fix the highlighted fields.");
            return;
        }

        setSubmitting(true);
        try {
            let uploaded: { fileUrl: string; fileName: string } | null = null;
            if (file) {
                uploaded = await uploadFile(file);
            }

            // Build a Collab-shaped document (id is assigned by Firestore).
            const payload: Omit<Collab, "id"> = {
                name: form.name.trim(),
                email: form.email.trim(),
                type: type as string,
                message: form.message.trim(),
                createdAt: serverTimestamp() as unknown as Collab["createdAt"],
                status: "new",
                ...(form.link.trim() ? { link: form.link.trim() } : {}),
                ...(form.budget.trim() ? { budget: form.budget.trim() } : {}),
                ...(form.discordName.trim() ? { discordName: form.discordName.trim() } : {}),
                ...(uploaded ? { fileUrl: uploaded.fileUrl, fileName: uploaded.fileName } : {}),
            };

            await addDoc(collection(db, "collabs"), payload);

            toast.success("Pitch received — we'll be in touch.");
            setSuccess(true);
            setForm(EMPTY_FORM);
            setType(null);
            clearFile();
            setErrors({});
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
            setUploadProgress(null);
        }
    };

    const resetForAnother = () => setSuccess(false);

    const selectedLabel = type ? COLLAB_TYPES.find((t) => t.id === type)?.label : null;

    return (
        <section id="collab-form" className="scroll-mt-28 px-5 pb-24 sm:px-8">
            <div className="mx-auto max-w-3xl">
                <Reveal direction="up">
                    <GlassPanel className="relative overflow-hidden p-6 sm:p-9">
                        <AnimatePresence mode="wait">
                            {success ? (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ type: "spring", stiffness: 240, damping: 24 }}
                                    className="flex flex-col items-center py-10 text-center"
                                >
                                    <motion.span
                                        initial={reduced ? undefined : { scale: 0 }}
                                        animate={reduced ? undefined : { scale: 1 }}
                                        transition={{ type: "spring", stiffness: 220, damping: 12 }}
                                        className="grid size-20 place-items-center rounded-full bg-brand-gradient text-white shadow-[0_0_50px_rgba(168,85,247,0.45)]"
                                    >
                                        <Check className="size-10" strokeWidth={3} />
                                    </motion.span>
                                    <h3 className="mt-6 font-outfit text-3xl font-black tracking-tighter text-foreground">
                                        Pitch received
                                    </h3>
                                    <p className="mt-3 max-w-md text-base font-light text-muted-foreground">
                                        We&apos;ll be in touch. Keep an eye on your inbox — and welcome to the
                                        Bonnet Gang energy.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={resetForAnother}
                                        className="btn-brand mt-8 inline-flex min-h-[44px] items-center gap-2 rounded-full px-6 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                    >
                                        <Sparkles className="size-4" aria-hidden="true" />
                                        Send another pitch
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    noValidate
                                    className="flex flex-col gap-7"
                                >
                                    {/* Collab type */}
                                    <fieldset className="flex flex-col gap-3">
                                        <legend className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                                            What kind of collab?
                                        </legend>
                                        <CollabTypeGrid
                                            value={type}
                                            onChange={(id) => {
                                                setType(id);
                                                setErrors((prev) => ({ ...prev, type: undefined }));
                                            }}
                                        />
                                        {errors.type && (
                                            <p role="alert" className="text-sm font-medium text-red-400">
                                                {errors.type}
                                            </p>
                                        )}
                                        {selectedLabel && (
                                            <p className="text-sm font-light text-muted-foreground">
                                                Selected: <span className="font-medium text-brand">{selectedLabel}</span>
                                            </p>
                                        )}
                                    </fieldset>

                                    {/* Name + Email */}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Field
                                            id="collab-name"
                                            label="Your name"
                                            required
                                            error={errors.name}
                                            icon={<User className="size-5" aria-hidden="true" />}
                                        >
                                            <input
                                                id="collab-name"
                                                name="name"
                                                type="text"
                                                autoComplete="name"
                                                value={form.name}
                                                onChange={update("name")}
                                                placeholder="e.g. Jordan Banks"
                                                aria-invalid={Boolean(errors.name)}
                                                aria-describedby={errors.name ? "collab-name-error" : undefined}
                                                className={inputClass}
                                            />
                                        </Field>

                                        <Field
                                            id="collab-email"
                                            label="Email"
                                            required
                                            error={errors.email}
                                            icon={<Mail className="size-5" aria-hidden="true" />}
                                        >
                                            <input
                                                id="collab-email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                value={form.email}
                                                onChange={update("email")}
                                                placeholder="you@email.com"
                                                aria-invalid={Boolean(errors.email)}
                                                aria-describedby={errors.email ? "collab-email-error" : undefined}
                                                className={inputClass}
                                            />
                                        </Field>
                                    </div>

                                    {/* Budget + Link */}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Field
                                            id="collab-budget"
                                            label="Budget"
                                            optional
                                            icon={<Wallet className="size-5" aria-hidden="true" />}
                                        >
                                            <input
                                                id="collab-budget"
                                                name="budget"
                                                type="text"
                                                inputMode="text"
                                                value={form.budget}
                                                onChange={update("budget")}
                                                placeholder="e.g. $500 – $2k"
                                                className={inputClass}
                                            />
                                        </Field>

                                        <Field
                                            id="collab-link"
                                            label="Portfolio link"
                                            optional
                                            error={errors.link}
                                            icon={<LinkIcon className="size-5" aria-hidden="true" />}
                                        >
                                            <input
                                                id="collab-link"
                                                name="link"
                                                type="url"
                                                inputMode="url"
                                                value={form.link}
                                                onChange={update("link")}
                                                placeholder="SoundCloud, EPK, IG…"
                                                aria-invalid={Boolean(errors.link)}
                                                aria-describedby={errors.link ? "collab-link-error" : undefined}
                                                className={inputClass}
                                            />
                                        </Field>
                                    </div>

                                    {/* Message */}
                                    <Field
                                        id="collab-message"
                                        label="Your pitch"
                                        required
                                        error={errors.message}
                                        icon={<MessageSquare className="size-5" aria-hidden="true" />}
                                        align="top"
                                    >
                                        <textarea
                                            id="collab-message"
                                            name="message"
                                            rows={5}
                                            value={form.message}
                                            onChange={update("message")}
                                            placeholder="What's the vision? Timeline, vibe, what you're bringing…"
                                            aria-invalid={Boolean(errors.message)}
                                            aria-describedby={errors.message ? "collab-message-error" : undefined}
                                            className={cn(inputClass, "min-h-[140px] resize-y pt-3.5 leading-relaxed")}
                                        />
                                    </Field>

                                    {/* Discord */}
                                    <Field
                                        id="collab-discord"
                                        label="Discord handle"
                                        optional
                                        icon={<Hash className="size-5" aria-hidden="true" />}
                                    >
                                        <input
                                            id="collab-discord"
                                            name="discordName"
                                            type="text"
                                            value={form.discordName}
                                            onChange={update("discordName")}
                                            placeholder="yourname"
                                            className={inputClass}
                                        />
                                    </Field>

                                    {/* Optional file upload */}
                                    <div className="flex flex-col gap-2">
                                        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                                            EPK / audio
                                            <span className="text-xs font-normal text-muted-foreground">(optional)</span>
                                        </span>

                                        {file ? (
                                            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
                                                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
                                                    <FileAudio className="size-5" aria-hidden="true" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                                                    </p>
                                                    {uploadProgress !== null && (
                                                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                                            <div
                                                                className="h-full rounded-full bg-brand-gradient transition-[width] duration-200"
                                                                style={{ width: `${uploadProgress}%` }}
                                                                role="progressbar"
                                                                aria-valuenow={uploadProgress}
                                                                aria-valuemin={0}
                                                                aria-valuemax={100}
                                                                aria-label="Upload progress"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                {uploadProgress !== null && uploadProgress < 100 ? (
                                                    <span className="shrink-0 text-xs font-semibold tabular-nums text-brand">
                                                        {uploadProgress}%
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={clearFile}
                                                        disabled={submitting}
                                                        aria-label="Remove file"
                                                        className="grid size-11 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
                                                    >
                                                        <X className="size-5" aria-hidden="true" />
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <label
                                                htmlFor="collab-file"
                                                className={cn(
                                                    "group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-7 text-center transition-colors",
                                                    "hover:border-brand/50 hover:bg-brand/[0.06]",
                                                    "focus-within:border-brand/60 focus-within:ring-1 focus-within:ring-brand/60",
                                                )}
                                            >
                                                <span className="grid size-11 place-items-center rounded-full bg-white/5 text-brand transition-colors group-hover:bg-brand/15">
                                                    <UploadCloud className="size-5" aria-hidden="true" />
                                                </span>
                                                <span className="text-sm font-medium text-foreground">
                                                    Drop an EPK or audio file
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    Audio, PDF or ZIP · up to 25MB
                                                </span>
                                                <input
                                                    id="collab-file"
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept={ACCEPT}
                                                    onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                                                    className="sr-only"
                                                />
                                            </label>
                                        )}
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={cn(
                                            "btn-brand group mt-1 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl text-base font-bold",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                            "disabled:cursor-not-allowed disabled:opacity-60",
                                        )}
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                                                {uploadProgress !== null && uploadProgress < 100
                                                    ? `Uploading ${uploadProgress}%`
                                                    : "Sending…"}
                                            </>
                                        ) : (
                                            <>
                                                Send the pitch
                                                <Send
                                                    className={cn(
                                                        "size-5",
                                                        !reduced && "transition-transform group-hover:translate-x-0.5",
                                                    )}
                                                    aria-hidden="true"
                                                />
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-xs font-light text-muted-foreground">
                                        We read every pitch. Real ones get a reply.
                                    </p>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </GlassPanel>
                </Reveal>
            </div>
        </section>
    );
}

/** Labeled field wrapper with a leading icon, accessible error text and required/optional hint. */
function Field({
    id,
    label,
    icon,
    children,
    error,
    required,
    optional,
    align = "center",
}: {
    id: string;
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    error?: string;
    required?: boolean;
    optional?: boolean;
    align?: "center" | "top";
}) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-foreground">
                {label}
                {required && (
                    <span className="text-brand" aria-hidden="true">
                        *
                    </span>
                )}
                {optional && <span className="text-xs font-normal text-muted-foreground">(optional)</span>}
            </label>
            <div className="relative">
                <span
                    className={cn(
                        "pointer-events-none absolute left-3.5 text-muted-foreground",
                        align === "top" ? "top-3.5" : "top-1/2 -translate-y-1/2",
                    )}
                >
                    {icon}
                </span>
                {children}
            </div>
            {error && (
                <p id={`${id}-error`} role="alert" className="text-sm font-medium text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}

export default CollabForm;

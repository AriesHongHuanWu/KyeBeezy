"use client";

import { motion } from "framer-motion";
import {
    Mail,
    ArrowUp,
    Send,
    Check,
    AlertCircle,
    Handshake,
    Crown,
    ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { SOCIALS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { GlassPanel } from "@/components/ui/glass";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const WEBHOOK_URL =
    "https://discord.com/api/webhooks/1451573702440521892/aP1PT73fnyQskZW3X6UkaS6B4saLctdwU9AhVaM_7oKTWGnA_yH9F5pPM_xpqW92vGyf";

type FormStatus = "idle" | "submitting" | "success" | "error";

// Shared input/textarea styling — glass field with a visible focus-visible ring.
const fieldClass = cn(
    "w-full rounded-2xl px-5 py-3.5 text-base text-foreground",
    "bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10",
    "placeholder:text-muted-foreground/50 transition-all",
    "focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/30",
    "focus-visible:outline-none focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-brand/30",
);

const labelClass =
    "block text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-2";

export default function ContactSection() {
    const reduced = usePrefersReducedMotion();

    const [formStatus, setFormStatus] = useState<FormStatus>("idle");
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus("submitting");

        const payload = {
            embeds: [
                {
                    title: "📬 New Contact Form Submission",
                    color: 10181046, // Purple-ish
                    fields: [
                        { name: "Name", value: formData.name, inline: true },
                        { name: "Email", value: formData.email, inline: true },
                        { name: "Message", value: formData.message },
                    ],
                    timestamp: new Date().toISOString(),
                },
            ],
        };

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setFormStatus("success");
                setFormData({ name: "", email: "", message: "" });
                setTimeout(() => setFormStatus("idle"), 5000);
            } else {
                setFormStatus("error");
                setTimeout(() => setFormStatus("idle"), 3000);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setFormStatus("error");
            setTimeout(() => setFormStatus("idle"), 3000);
        }
    };

    const statusMessage =
        formStatus === "submitting"
            ? "Sending your message…"
            : formStatus === "success"
              ? "Message sent — talk soon."
              : formStatus === "error"
                ? "Something went wrong. Try again or email me directly."
                : "";

    return (
        <section
            id="contact"
            className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden py-24 text-foreground"
        >
            {/* Soft brand glows only — the background video (his face) stays visible
                in the empty LEFT half for an editorial, page-by-page feel. */}
            <div
                aria-hidden
                className="pointer-events-none absolute -right-32 top-1/4 -z-10 size-[28rem] rounded-full bg-brand/12 blur-[130px]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute bottom-0 right-1/4 -z-10 size-[24rem] rounded-full bg-brand-2/12 blur-[140px]"
            />

            {/* Directional scrim: darkens the content (right) half; the left
                half stays open to reveal the face. */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden lg:block bg-gradient-to-l from-background via-background/55 to-transparent [mask-image:linear-gradient(to_bottom,transparent,black_16%,black_84%,transparent)]" />

            <div className="container mx-auto max-w-6xl px-4 sm:px-6 w-full">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    {/* LEFT: intentional negative space — reveals the artist's face
                        in the fixed background video. Hidden on mobile (single column). */}
                    <div aria-hidden className="hidden lg:block" />

                    {/* RIGHT: the content column — heading at top, then email,
                        callouts, and the glass contact form below. */}
                    <div className="max-w-xl lg:ml-auto">
                        <SectionHeading eyebrow="Connect" title="LET'S" accent="WORK" align="left">
                            Got a record, a beat, or a vision? Pull up. I read every
                            message — let&apos;s make something the Bonnet Gang can&apos;t
                            stop replaying.
                        </SectionHeading>

                        {/* Email card */}
                        <Reveal direction="up" delay={0.1} className="mt-8">
                            <a
                                href={SOCIALS.email}
                                className={cn(
                                    "group flex items-center gap-4 rounded-2xl p-4 w-full min-h-[44px]",
                                    "bg-white/5 dark:bg-black/20 backdrop-blur-md border border-black/5 dark:border-white/10",
                                    "transition-all hover:border-brand/50 hover:bg-brand/5",
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                )}
                            >
                                <span className="grid place-items-center p-3 rounded-xl bg-brand/15 text-brand transition-transform group-hover:scale-110">
                                    <Mail className="size-6" aria-hidden />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Email me
                                    </span>
                                    <span className="block text-base sm:text-lg font-medium text-foreground break-all">
                                        {SOCIALS.emailPlain}
                                    </span>
                                </span>
                            </a>
                        </Reveal>

                        {/* Prominent collab / join callout */}
                        <Reveal direction="up" delay={0.18} className="mt-4">
                            <GlassPanel className="overflow-hidden p-6 sm:p-7" hover>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
                                    Make it official
                                </p>
                                <p className="mt-3 text-base sm:text-lg text-muted-foreground font-light">
                                    Got a serious collab, booking, or brand deal? Skip the
                                    inbox and use the form built for it.
                                </p>

                                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                                    <Link
                                        href="/collab"
                                        className={cn(
                                            "btn-brand group inline-flex items-center justify-center gap-2",
                                            "rounded-full px-6 py-3 min-h-[44px] text-sm font-bold",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                        )}
                                    >
                                        <Handshake className="size-4" aria-hidden />
                                        Use the Collab form
                                        <ArrowUpRight
                                            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                            aria-hidden
                                        />
                                    </Link>

                                    <Link
                                        href="/join"
                                        className={cn(
                                            "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 min-h-[44px] text-sm font-bold",
                                            "border border-brand/40 text-foreground bg-brand/5",
                                            "transition-colors hover:bg-brand/15 hover:border-brand/60",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                        )}
                                    >
                                        <Crown className="size-4 text-brand" aria-hidden />
                                        Join the Bonnet Gang
                                    </Link>
                                </div>
                            </GlassPanel>
                        </Reveal>

                        {/* Glass contact form */}
                        <Reveal direction="up" delay={0.24} className="mt-4">
                            <GlassPanel className="p-6 sm:p-8 rounded-[2rem]">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="contact-name" className={labelClass}>
                                            Name
                                        </label>
                                        <input
                                            id="contact-name"
                                            type="text"
                                            name="name"
                                            autoComplete="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            disabled={formStatus === "submitting"}
                                            className={fieldClass}
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="contact-email" className={labelClass}>
                                            Email
                                        </label>
                                        <input
                                            id="contact-email"
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled={formStatus === "submitting"}
                                            className={fieldClass}
                                            placeholder="hello@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="contact-message" className={labelClass}>
                                        Message
                                    </label>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        disabled={formStatus === "submitting"}
                                        rows={5}
                                        className={cn(fieldClass, "resize-none")}
                                        placeholder="Tell me about your project, your sound, your idea…"
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={
                                        formStatus === "submitting" ||
                                        formStatus === "success"
                                    }
                                    whileHover={
                                        reduced || formStatus !== "idle"
                                            ? undefined
                                            : { scale: 1.01 }
                                    }
                                    whileTap={reduced ? undefined : { scale: 0.99 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                                    className={cn(
                                        "w-full min-h-[44px] py-4 rounded-2xl font-bold text-base sm:text-lg",
                                        "flex items-center justify-center gap-2 transition-colors duration-300",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                                        "disabled:cursor-not-allowed",
                                        formStatus === "success"
                                            ? "bg-emerald-500 text-white"
                                            : formStatus === "error"
                                              ? "bg-red-500 text-white"
                                              : "btn-brand hover:opacity-95",
                                    )}
                                >
                                    {formStatus === "idle" && (
                                        <>
                                            Send message
                                            <Send className="size-5" aria-hidden />
                                        </>
                                    )}
                                    {formStatus === "submitting" && (
                                        <>
                                            <span
                                                className="size-5 rounded-full border-2 border-white/40 border-t-white animate-spin"
                                                aria-hidden
                                            />
                                            Sending…
                                        </>
                                    )}
                                    {formStatus === "success" && (
                                        <>
                                            Message sent
                                            <Check className="size-5" aria-hidden />
                                        </>
                                    )}
                                    {formStatus === "error" && (
                                        <>
                                            Try again
                                            <AlertCircle className="size-5" aria-hidden />
                                        </>
                                    )}
                                </motion.button>

                                {/* Live status region for assistive tech. */}
                                <p
                                    aria-live="polite"
                                    role="status"
                                    className={cn(
                                        "min-h-[1.25rem] text-sm font-medium text-center",
                                        formStatus === "success" && "text-emerald-500",
                                        formStatus === "error" && "text-red-500",
                                        (formStatus === "idle" ||
                                            formStatus === "submitting") &&
                                            "text-muted-foreground",
                                    )}
                                >
                                    {statusMessage}
                                    </p>
                                </form>
                            </GlassPanel>
                        </Reveal>
                    </div>
                </div>

                {/* Back to top — no site footer (global SiteFooter handles that). */}
                <div className="mt-16 flex justify-center">
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className={cn(
                            "group inline-flex items-center gap-2 rounded-full px-6 py-3 min-h-[44px]",
                            "bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10",
                            "transition-colors hover:bg-brand/15 hover:border-brand/40",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        )}
                    >
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-brand">
                            Back to top
                        </span>
                        <ArrowUp
                            className="size-4 text-muted-foreground transition-all group-hover:text-brand group-hover:-translate-y-1"
                            aria-hidden
                        />
                    </button>
                </div>
            </div>
        </section>
    );
}

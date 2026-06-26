"use client";

import Link from "next/link";
import { FOOTER_GROUPS, SITE, SOCIALS } from "@/lib/site";
import { Twitch, Youtube, Music, MessageCircle, ArrowUpRight } from "lucide-react";

export default function SiteFooter() {
    const year = new Date().getFullYear();
    const isExternal = (href: string) => href.startsWith("http");

    return (
        <footer className="relative z-10 border-t border-border bg-background/60 backdrop-blur-xl">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-16">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="text-3xl font-black font-outfit">
                            {SITE.name.toUpperCase()}<span className="text-brand">.</span>
                        </Link>
                        <p className="mt-4 max-w-xs text-muted-foreground font-light">{SITE.description}</p>
                        <div className="mt-6 flex items-center gap-3">
                            <Social href={SOCIALS.twitch} label="Twitch"><Twitch className="size-5" /></Social>
                            <Social href={SOCIALS.youtube} label="YouTube"><Youtube className="size-5" /></Social>
                            <Social href={SOCIALS.bandlab} label="BandLab"><Music className="size-5" /></Social>
                            <Social href={SOCIALS.discord} label="Discord"><MessageCircle className="size-5" /></Social>
                        </div>
                    </div>

                    {FOOTER_GROUPS.map((group) => (
                        <div key={group.title}>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                                {group.title}
                            </h3>
                            <ul className="space-y-2.5">
                                {group.links.map((l) => (
                                    <li key={l.name}>
                                        <Link
                                            href={l.href || "/"}
                                            target={isExternal(l.href || "") ? "_blank" : undefined}
                                            rel={isExternal(l.href || "") ? "noreferrer" : undefined}
                                            className="group inline-flex items-center gap-1 text-foreground/80 hover:text-brand transition-colors"
                                        >
                                            {l.name}
                                            {isExternal(l.href || "") && (
                                                <ArrowUpRight className="size-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-14 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                    <p>© {year} {SITE.name}. All rights reserved.</p>
                    <p className="flex items-center gap-2">
                        Built for the culture · <Link href="/submit" className="text-brand hover:underline">Drop a track</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="p-2.5 rounded-xl bg-foreground/5 text-foreground hover:bg-brand hover:text-white transition-colors"
        >
            {children}
        </Link>
    );
}

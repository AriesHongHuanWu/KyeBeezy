"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Link as ScrollLink } from "react-scroll";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NAV_LINKS, SITE, SOCIALS } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
    Home, User, Music, Tv, Trophy, Mic, Crown, Handshake, Menu, X, Twitch, Youtube, MessageCircle,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    Home, User, Music, Tv, Trophy, Mic, Crown, Handshake,
};

export default function SiteNav() {
    const pathname = usePathname();
    const onHome = pathname === "/";
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Lock body scroll while the mobile sheet is open.
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    // Resolve where a nav item points depending on the current route.
    const hrefFor = (to?: string, href?: string) => {
        if (href) return href;
        if (to) return onHome ? `#${to}` : `/#${to}`;
        return "/";
    };

    const renderDesktopItem = (item: (typeof NAV_LINKS)[number]) => {
        const isCta = item.name === "BonnetSubmit";
        const label = item.name === "BonnetSubmit" ? "Submit" : item.name;
        const content = <span className="relative z-10">{label}</span>;
        const base =
            "relative px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand";
        const cta = isCta
            ? "bg-white text-black hover:bg-white/90 font-semibold"
            : "text-foreground/70 hover:text-foreground hover:bg-foreground/5";

        // In-page scroll on homepage
        if (item.to && onHome && !item.emphasis) {
            return (
                <ScrollLink
                    key={item.name}
                    to={item.to}
                    spy
                    smooth
                    offset={-100}
                    duration={500}
                    className={cn(base, cta)}
                    activeClass="!text-foreground !bg-foreground/10 !font-semibold"
                >
                    {content}
                </ScrollLink>
            );
        }
        return (
            <Link key={item.name} href={hrefFor(item.to, item.href)} className={cn(base, cta)}>
                {content}
            </Link>
        );
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="fixed top-4 inset-x-0 z-50 flex justify-center px-3 pointer-events-none"
            >
                <div
                    className={cn(
                        "pointer-events-auto flex items-center gap-1 p-1.5 rounded-full border transition-all duration-300 max-w-[calc(100vw-1.5rem)]",
                        scrolled
                            ? "bg-white/80 dark:bg-black/60 border-black/5 dark:border-white/10 shadow-xl backdrop-blur-2xl"
                            : "bg-white/50 dark:bg-black/30 border-black/5 dark:border-white/10 backdrop-blur-xl",
                    )}
                >
                    <Link
                        href="/"
                        className="flex items-center px-3 font-black font-outfit text-foreground hover:text-brand transition-colors"
                    >
                        {SITE.shortName}<span className="text-brand">.</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-0.5">
                        <div className="h-6 w-px bg-border mx-1.5" />
                        {["Music", "Stream", "Events", "Join", "BonnetSubmit"].map((name) => {
                            const l = NAV_LINKS.find((x) => x.name === name);
                            return l ? renderDesktopItem(l) : null;
                        })}
                    </div>

                    <div className="h-6 w-px bg-border mx-1 hidden sm:block" />
                    <div className="px-1 hidden sm:block">
                        <ThemeToggle />
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setOpen(true)}
                        aria-label="Open menu"
                        className="md:hidden p-2.5 rounded-full text-foreground hover:bg-foreground/10 transition-colors"
                    >
                        <Menu className="size-5" />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile full-screen sheet */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] md:hidden bg-background/95 backdrop-blur-2xl flex flex-col"
                    >
                        <div className="flex items-center justify-between p-5">
                            <span className="font-black font-outfit text-2xl">
                                {SITE.shortName}<span className="text-brand">.</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <ThemeToggle />
                                <button
                                    onClick={() => setOpen(false)}
                                    aria-label="Close menu"
                                    className="p-2.5 rounded-full hover:bg-foreground/10 transition-colors"
                                >
                                    <X className="size-6" />
                                </button>
                            </div>
                        </div>

                        <nav className="flex-1 flex flex-col justify-center gap-1 px-6">
                            {NAV_LINKS.map((item, i) => {
                                const Icon = item.icon ? ICONS[item.icon] : undefined;
                                return (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 * i }}
                                    >
                                        <Link
                                            href={hrefFor(item.to, item.href)}
                                            onClick={() => setOpen(false)}
                                            className={cn(
                                                "flex items-center gap-4 py-3.5 text-2xl font-bold font-outfit transition-colors",
                                                item.emphasis ? "text-gradient-brand" : "text-foreground hover:text-brand",
                                            )}
                                        >
                                            {Icon && <Icon className="size-6 opacity-70" />}
                                            {item.name}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </nav>

                        <div className="p-6 flex items-center gap-3 border-t border-border">
                            <SocialIcon href={SOCIALS.twitch} label="Twitch"><Twitch className="size-5" /></SocialIcon>
                            <SocialIcon href={SOCIALS.youtube} label="YouTube"><Youtube className="size-5" /></SocialIcon>
                            <SocialIcon href={SOCIALS.bandlab} label="BandLab"><Music className="size-5" /></SocialIcon>
                            <SocialIcon href={SOCIALS.discord} label="Discord"><MessageCircle className="size-5" /></SocialIcon>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="p-3 rounded-full bg-foreground/5 text-foreground hover:bg-brand hover:text-white transition-colors"
        >
            {children}
        </Link>
    );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap, ArrowRight } from "lucide-react";

export function UniversityNav() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const links = [
        { href: "/university", label: "Overview" },
        { href: "/university/majors", label: "Majors" },
        { href: "/university/faculty", label: "Faculty" },
        { href: "/university/library", label: "Library" },
        { href: "/university/news", label: "News" },
    ];

    const isApplyPage = pathname === "/university/apply";

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 py-3" : "bg-transparent py-5"}`}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4 md:gap-6">
                        <Link href="/university" className="flex items-center gap-3 group">
                            <img
                                src="/bandlab-logo.png"
                                alt="BandLab"
                                className={`w-10 h-10 object-contain group-hover:scale-110 transition-transform ${isApplyPage ? "hue-rotate-[200deg] brightness-125 hover:brightness-150 saturate-150" : ""}`}
                            />
                            <div>
                                <span className="font-bold text-lg leading-none block text-black dark:text-white">BANDLAB</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium tracking-widest text-neutral-500 uppercase">University</span>
                                    {isApplyPage && (
                                        <span className="text-[10px] font-bold tracking-widest text-blue-500 uppercase border-l border-neutral-700 pl-2">
                                            Student Admission
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>

                        <div className="hidden md:flex items-center gap-2 border-l border-neutral-200 dark:border-white/10 pl-6">
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Sponsored by</span>
                            <img src="/awbest-logo.png" alt="AWBest" className="h-5 w-auto opacity-70 hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${isActive ? "text-white dark:text-black" : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="uni-nav-pill"
                                            className="absolute inset-0 bg-black dark:bg-white rounded-full"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/university/apply" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center gap-2 group">
                            Apply Now
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden p-2 text-black dark:text-white" onClick={() => setMobileOpen(true)}>
                        <Menu size={24} />
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-white dark:bg-black"
                    >
                        <div className="p-6">
                            <div className="flex justify-end mb-8">
                                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex flex-col gap-6">
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="text-3xl font-bold text-black dark:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <Link
                                    href="/university/apply"
                                    onClick={() => setMobileOpen(false)}
                                    className="mt-4 w-full py-4 bg-blue-600 text-white text-center rounded-2xl font-bold text-lg"
                                >
                                    Apply Now
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

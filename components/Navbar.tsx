"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("home");

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 50);

            // Basic scroll spy
            const sections = ["home", "about", "music", "stream", "contact"];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top >= -300 && rect.top <= 300) {
                        setActiveSection(section);
                    }
                }
            }
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const targetId = href.replace("#", "");
        const elem = document.getElementById(targetId);
        if (elem) {
            const offsetTop = elem.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: "smooth"
            });
            setActiveSection(targetId);
        }
        setIsOpen(false);
    };

    const navLinks = [
        { name: "Home", href: "#home", id: "home" },
        { name: "About", href: "#about", id: "about" },
        { name: "Music", href: "#music", id: "music" },
        { name: "Stream", href: "#stream", id: "stream" },
        { name: "Contact", href: "#contact", id: "contact" },
    ];

    return (
        <>
            {/* Desktop Floating Pill - Modern & Centered */}
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-1 p-1.5 rounded-full bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5"
            >
                {/* Brand Icon/Home */}
                <a
                    href="#home"
                    onClick={(e) => handleNavClick(e, "#home")}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background font-black text-xs tracking-tighter hover:scale-110 transition-transform mr-2"
                >
                    KB
                </a>

                {/* Links */}
                {navLinks.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <a
                            key={item.name}
                            href={item.href}
                            onClick={(e) => handleNavClick(e, item.href)}
                            className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-white/20 dark:bg-white/10 rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{item.name}</span>
                        </a>
                    );
                })}

                <div className="w-px h-4 bg-white/20 mx-2" />

                <div className="pr-1">
                    <ThemeToggle />
                </div>
            </motion.nav>

            {/* Mobile Bar - Bottom Fixed or Top? Top is safer for mobile web. */}
            <nav className={`fixed top-0 w-full z-50 md:hidden transition-all duration-300 ${scrolled || isOpen ? "bg-background/80 backdrop-blur-md border-b border-border" : "bg-transparent"}`}>
                <div className="flex justify-between items-center p-4">
                    <a href="#home" className="text-xl font-bold tracking-tighter">
                        KYE BEEZY
                    </a>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-background border-b border-border"
                        >
                            <div className="flex flex-col p-4 gap-4">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        onClick={(e) => handleNavClick(e, link.href)}
                                        className="text-lg font-medium p-2 hover:bg-muted rounded-lg"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
}

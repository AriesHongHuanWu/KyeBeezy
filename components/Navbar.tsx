"use client";

import { motion } from "framer-motion";
import { ThemeToggle } from "./ui/theme-toggle";
import { Link as ScrollLink } from "react-scroll";
import { Home, User, Music, Tv, Mail, ShoppingBag } from "lucide-react";

export default function Navbar() {
    const navItems = [
        { name: "Home", to: "hero", icon: Home },
        { name: "About", to: "about", icon: User },
        { name: "Music", to: "music", icon: Music },
        { name: "Stream", to: "stream", icon: Tv },
        { name: "Shop", to: "dubby", icon: ShoppingBag }, // Dubby Section
        { name: "Contact", to: "contact", icon: Mail },
    ];

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-6 left-0 right-0 z-50 flex justify-center items-center px-4 pointer-events-none"
        >
            <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-full bg-white/70 dark:bg-black/40 backdrop-blur-2xl border border-black/5 dark:border-white/10 shadow-lg dark:shadow-2xl">

                {/* Logo / Brand - Hidden on mobile to save space, visible on desk */}
                <div className="hidden md:flex items-center px-4 font-bold font-outfit text-foreground hover:text-primary transition-colors cursor-pointer">
                    KYE BEEZY
                </div>

                <div className="h-6 w-[1px] bg-border hidden md:block" />

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    {navItems.map((item) => (
                        <ScrollLink
                            key={item.name}
                            to={item.to}
                            spy={true}
                            smooth={true}
                            offset={-100}
                            duration={500}
                            className="relative px-4 py-2 rounded-full text-foreground/70 hover:text-foreground text-sm font-medium transition-all cursor-pointer group hover:bg-white/50 dark:hover:bg-white/10"
                            activeClass="!text-foreground !bg-white dark:!bg-white/20 !font-bold shadow-sm"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <item.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{item.name}</span>
                            </span>
                        </ScrollLink>
                    ))}
                </div>

                <div className="h-6 w-[1px] bg-border mx-1" />

                {/* Theme Toggle */}
                <div className="px-2">
                    <ThemeToggle />
                </div>
            </div>
        </motion.nav>
    );
}

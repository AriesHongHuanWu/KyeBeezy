"use client";

import { motion } from "framer-motion";
import { Mail, ArrowUp } from "lucide-react";

export default function ContactSection() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer id="contact" className="relative py-20 bg-black border-t border-white/10">
            <div className="container mx-auto px-6 z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-white mb-2">Get In Touch</h2>
                        <p className="text-gray-400 max-w-md">
                            For business inquiries, collaborations, or just to say hi, drop a message.
                        </p>
                        <div className="mt-6">
                            <a href="mailto:contact@kyebeezy.com" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors">
                                <Mail className="w-5 h-5" /> contact@kyebeezy.com
                            </a>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {/* Could repeat social links here minimal style */}
                    </div>

                    <button
                        onClick={scrollToTop}
                        className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                    >
                        <ArrowUp className="w-6 h-6 text-white group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>

                <div className="mt-20 pt-8 border-t border-white/5 text-center text-gray-600 text-sm">
                    <p>&copy; {new Date().getFullYear()} Kye Beezy. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

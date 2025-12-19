"use client";

import { motion } from "framer-motion";
import { Mail, ArrowUp, Send, Check, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function ContactSection() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const webhookUrl = "https://discord.com/api/webhooks/1451573702440521892/aP1PT73fnyQskZW3X6UkaS6B4saLctdwU9AhVaM_7oKTWGnA_yH9F5pPM_xpqW92vGyf";

    const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus('submitting');

        const payload = {
            embeds: [
                {
                    title: "📬 New Contact Form Submission",
                    color: 10181046, // Purple-ish
                    fields: [
                        {
                            name: "Name",
                            value: formData.name,
                            inline: true
                        },
                        {
                            name: "Email",
                            value: formData.email,
                            inline: true
                        },
                        {
                            name: "Message",
                            value: formData.message
                        }
                    ],
                    timestamp: new Date().toISOString()
                }
            ]
        };

        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setFormStatus('success');
                setFormData({ name: "", email: "", message: "" });
                setTimeout(() => setFormStatus('idle'), 5000);
            } else {
                setFormStatus('error');
                setTimeout(() => setFormStatus('idle'), 3000);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setFormStatus('error');
            setTimeout(() => setFormStatus('idle'), 3000);
        }
    };

    return (
        <section id="contact" className="relative py-32 overflow-hidden flex flex-col justify-end">
            {/* Transparent Background - Global Shader visible */}
            <div className="container mx-auto px-6 z-10">

                {/* Main Content Area */}
                <div className="grid lg:grid-cols-2 gap-16 items-start">

                    {/* Left: Heading & Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-6xl md:text-8xl font-black font-outfit text-foreground mb-8 tracking-tighter drop-shadow-xl">
                            LET'S <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">WORK</span>
                        </h2>

                        <p className="text-xl text-muted-foreground font-light max-w-lg mb-12">
                            Have an idea? Need a beat? Or just want to collaborate?
                            I'm always open to new projects and opportunities.
                        </p>

                        <div className="flex flex-col gap-6">
                            <a href="mailto:contact@kyebeezy.com" className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10 hover:border-purple-500/50 transition-all w-fit">
                                <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Email Me</p>
                                    <p className="text-foreground font-medium text-lg">contact@kyebeezy.com</p>
                                </div>
                            </a>
                        </div>
                    </motion.div>

                    {/* Right: Modern Glass Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="bg-white/10 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                                        placeholder="hello@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl px-6 py-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none"
                                    placeholder="Tell me about your project..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={formStatus === 'submitting' || formStatus === 'success'}
                                className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-500 ${formStatus === 'success' ? 'bg-green-500 text-white' :
                                        formStatus === 'error' ? 'bg-red-500 text-white' :
                                            'bg-foreground text-background hover:opacity-90 hover:scale-[1.01]'
                                    }`}
                            >
                                {formStatus === 'idle' && (
                                    <>Send Message <Send className="w-5 h-5" /></>
                                )}
                                {formStatus === 'submitting' && (
                                    <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                )}
                                {formStatus === 'success' && (
                                    <>Message Sent <Check className="w-5 h-5" /></>
                                )}
                                {formStatus === 'error' && (
                                    <>Error Sending <AlertCircle className="w-5 h-5" /></>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-32 border-t border-black/5 dark:border-white/10 flex flex-col md:flex-row items-center justify-between pt-8 pb-8 gap-4">
                    <p className="text-sm text-muted-foreground font-medium">
                        &copy; {new Date().getFullYear()} Kye Beezy. All rights reserved.
                    </p>

                    <button
                        onClick={scrollToTop}
                        className="group flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 dark:bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-purple-400 transition-colors">Back to Top</span>
                        <ArrowUp className="w-4 h-4 text-muted-foreground group-hover:text-purple-400 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
}

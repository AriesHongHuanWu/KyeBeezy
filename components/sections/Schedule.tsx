"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Radio } from "lucide-react";

interface ScheduleItem {
    day: string;
    time: string;
    activity: string;
    isLive?: boolean;
}

const scheduleData: ScheduleItem[] = [
    { day: "Monday", time: "7:00 PM EST", activity: "Just Chatting & Vibes", isLive: false },
    { day: "Tuesday", time: "OFF", activity: "Studio / Recording", isLive: false },
    { day: "Wednesday", time: "7:00 PM EST", activity: "Gaming & Community Night", isLive: false },
    { day: "Thursday", time: "7:00 PM EST", activity: "Music Production / Beat Cookup", isLive: true },
    { day: "Friday", time: "8:00 PM EST", activity: "Freestyle Friday", isLive: false },
    { day: "Saturday", time: "TBA", activity: "Special Events", isLive: false },
    { day: "Sunday", time: "OFF", activity: "Rest & Reset", isLive: false },
];

export default function Schedule() {
    return (
        <section id="schedule" className="py-20 relative">
            <div className="container mx-auto px-6 relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-bold tracking-widest uppercase mb-4 text-purple-400">
                        <Clock className="w-4 h-4" /> Weekly Schedule
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-foreground font-outfit tracking-tighter mb-4">
                        CATCH THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">WAVE</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Tune in live for gaming, music production, and vibes. Schedule subject to change—join Discord for updates.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {scheduleData.map((item, index) => (
                        <motion.div
                            key={item.day}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={`group relative p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 ${item.isLive
                                    ? "bg-purple-900/20 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                }`}
                        >
                            {/* Live Indicator */}
                            {item.isLive && (
                                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full shadow-lg shadow-red-500/40 animate-pulse">
                                    <Radio className="w-3 h-3 text-white" />
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Live Now</span>
                                </div>
                            )}

                            <div className="flex flex-col h-full justify-between gap-4">
                                <div>
                                    <h3 className={`text-2xl font-black font-outfit mb-1 ${item.isLive ? "text-purple-300" : "text-foreground"}`}>
                                        {item.day}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm font-bold tracking-wider opacity-60 uppercase mb-4">
                                        <Clock className="w-3 h-3" /> {item.time}
                                    </div>
                                    <p className={`text-lg font-medium leading-tight ${item.isLive ? "text-white" : "text-muted-foreground group-hover:text-foreground transition-colors"}`}>
                                        {item.activity}
                                    </p>
                                </div>

                                {item.time !== "OFF" && (
                                    <div className={`h-1 w-full rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent ${item.isLive ? "via-purple-500" : ""}`} />
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {/* Discord CTA Block */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="col-span-1 md:col-span-2 lg:col-span-1 bg-[#5865F2] rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:scale-[1.02] transition-transform"
                    >
                        <div className="absolute inset-0 bg-[url('https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png')] bg-center bg-cover opacity-10 bg-blend-overlay" />
                        <div className="relative z-10 space-y-4">
                            <Calendar className="w-10 h-10 text-white mx-auto opacity-80" />
                            <h3 className="text-xl font-bold text-white">Full Schedule</h3>
                            <p className="text-white/80 text-sm">Check Discord for specific game titles and impromptu streams.</p>
                        </div>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Twitch } from "lucide-react";

export default function ScheduleSection() {
    const events = [
        { day: "MON", title: "Just Chatting & Vibes", time: "8:00 PM EST", active: true },
        { day: "TUE", title: "Community Games", time: "8:00 PM EST", active: false },
        { day: "WED", title: "Studio Cookup", time: "9:00 PM EST", active: true },
        { day: "THU", title: "Off / Collab", time: "-", active: false },
        { day: "FRI", title: "New Music Friday", time: "9:00 PM EST", active: true },
        { day: "SAT", title: "Viewer Review", time: "10:00 PM EST", active: false },
        { day: "SUN", title: "Chill Stream", time: "Earlier Start", active: false },
    ];

    return (
        <section id="schedule" className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-6 z-10 relative">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-5xl md:text-7xl font-black font-outfit text-foreground mb-4 drop-shadow-xl">
                        LIVE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">SCHEDULE</span>
                    </h2>
                    <p className="text-xl text-muted-foreground flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5" /> All times in EST
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.day}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${event.active
                                    ? "bg-purple-600/10 border-purple-500/30 hover:bg-purple-600/20"
                                    : "bg-white/5 dark:bg-black/20 border-white/10 opacity-60 hover:opacity-100"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="font-black text-2xl font-outfit text-foreground">{event.day}</span>
                                {event.active && (
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-foreground mb-1">{event.title}</h3>
                            <p className="text-sm font-mono text-purple-400 font-bold tracking-wider">{event.time}</p>

                            {event.active && (
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                            )}
                        </motion.div>
                    ))}

                    {/* CTA Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="md:col-span-2 lg:col-span-1 xl:col-span-1 p-6 rounded-3xl bg-purple-600 text-white flex flex-col justify-center items-center text-center gap-4 cursor-pointer hover:scale-105 transition-transform shadow-2xl shadow-purple-600/20"
                    >
                        <Twitch className="w-8 h-8" />
                        <span className="font-bold text-lg">Catch me live!</span>
                        <span className="text-xs bg-black/20 px-3 py-1 rounded-full uppercase tracking-widest font-bold">Popout Player</span>
                    </motion.div>
                </div>

            </div>
        </section>
    );
}

"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Radio, MapPin, ExternalLink, ArrowRight, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, orderBy, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, isToday, parseISO } from "date-fns";
import Link from "next/link";

interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    time: string; // HH:mm
    type: "stream" | "release" | "event";
}

export default function Schedule() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Query for events Today or in Future
        const todayStr = format(new Date(), "yyyy-MM-dd");

        try {
            const q = query(
                collection(db, "events"),
                where("date", ">=", todayStr),
                orderBy("date", "asc")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedEvents = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as CalendarEvent[];

                setEvents(fetchedEvents);
                setLoading(false);
            }, (error) => {
                console.error("Schedule fetch error:", error);
                setLoading(false);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }, []);

    return (
        <section id="schedule" className="py-20 relative">
            <div className="container mx-auto px-6 relative z-10">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12"
                >
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-sm font-bold tracking-widest uppercase text-purple-400">
                            <Clock className="w-4 h-4" /> Upcoming Events
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground font-outfit tracking-tighter">
                            THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AGENDA</span>
                        </h2>
                    </div>
                    <Link href="https://discord.com/invite/JU3MNRGWXq" target="_blank" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors group">
                        <span className="text-sm font-bold uppercase tracking-wider">Join Discord for Updates</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* Empty State */}
                {!loading && events.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center"
                    >
                        <Calendar className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">No Scheduled Events</h3>
                        <p className="text-neutral-400 max-w-md mx-auto">
                            The calendar is currently clear. Follow on Twitch or Discord to catch unplanned streams!
                        </p>
                    </motion.div>
                )}

                {/* Events Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {events.map((item, index) => (
                        <ScheduleCard key={item.id} item={item} index={index} />
                    ))}
                </div>

            </div>
        </section>
    );
}

// --- Sub Component: ScheduleCard (Fixes Hook Rule Violation) ---
function ScheduleCard({ item, index }: { item: CalendarEvent, index: number }) {
    // Helper to check if event is "Live Now"
    const isLiveNow = (event: CalendarEvent) => {
        if (!isToday(parseISO(event.date))) return false;
        const now = new Date();
        const [hours, minutes] = event.time.split(':').map(Number);
        const eventTime = new Date();
        eventTime.setHours(hours, minutes, 0, 0);

        // Assume live for 4 hours
        const fourHoursLater = new Date(eventTime.getTime() + 4 * 60 * 60 * 1000);
        return now >= eventTime && now <= fourHoursLater;
    };

    const isLive = isLiveNow(item);
    const dateObj = parseISO(item.date);

    // Check subscription (client-side only)
    const [subscribed, setSubscribed] = useState(false);

    useEffect(() => {
        const subs = JSON.parse(localStorage.getItem("kye_event_subs") || "[]");
        setSubscribed(subs.includes(item.id));
    }, [item.id]);

    const toggleSub = (e: any) => {
        e.preventDefault();
        const subs = JSON.parse(localStorage.getItem("kye_event_subs") || "[]");
        let newSubs;
        if (subs.includes(item.id)) {
            newSubs = subs.filter((id: string) => id !== item.id);
            setSubscribed(false);
        } else {
            newSubs = [...subs, item.id];
            setSubscribed(true);
        }
        localStorage.setItem("kye_event_subs", JSON.stringify(newSubs));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, rotateX: 5 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`group relative p-6 rounded-3xl border backdrop-blur-xl transition-all duration-300 flex flex-col justify-between h-full min-h-[200px] ${isLive
                ? "bg-purple-900/20 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10"
                }`}
        >
            {/* Live Tag */}
            {isLive && (
                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full shadow-lg shadow-red-500/40 animate-pulse z-10">
                    <Radio className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Live</span>
                </div>
            )}

            {/* Bell Subscription Button */}
            {!isLive && (
                <button
                    onClick={toggleSub}
                    className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-all duration-300 ${subscribed
                        ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/40 scale-110'
                        : 'bg-white/5 text-neutral-500 hover:bg-white/20 hover:text-white'
                        }`}
                >
                    <Bell className={`w-4 h-4 ${subscribed ? 'fill-current animate-wiggle' : ''}`} />
                </button>
            )}

            <div>
                {/* Date Badge */}
                <div className={`inline-flex flex-col items-center justify-center w-14 h-14 rounded-xl mb-6 ${isLive ? 'bg-purple-500 text-white' : 'bg-white/10 text-neutral-300 group-hover:bg-white/20 group-hover:text-white transition-colors'}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider leading-none">{format(dateObj, "MMM")}</span>
                    <span className="text-2xl font-black leading-none">{format(dateObj, "d")}</span>
                </div>

                <h3 className={`text-2xl font-black font-outfit mb-2 leading-tight ${isLive ? "text-white" : "text-foreground"}`}>
                    {item.title}
                </h3>

                <div className="flex items-center gap-2 text-sm font-bold tracking-wider opacity-60 uppercase">
                    <Clock className="w-3 h-3" />
                    {format(parseISO(`2000-01-01T${item.time}`), "h:mm a")}
                </div>
            </div>

            {/* Type Strip */}
            <div className={`h-1.5 w-full rounded-full mt-6 ${item.type === 'stream' ? 'bg-purple-500' :
                item.type === 'release' ? 'bg-green-500' :
                    'bg-blue-500'
                }`} />

            <div className="flex justify-between items-end mt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    {subscribed ? "Reminder Set" : ""}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 text-right">
                    {item.type}
                </p>
            </div>
        </motion.div>
    );
}

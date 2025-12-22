"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { addDoc, collection, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Radio, Bell, AlertTriangle, CheckCircle, Calendar, Users, Globe, Copy, Send } from "lucide-react";
import { SectionHeader } from "@/app/admin/page";
import { format } from "date-fns";
import { messaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";

export default function BroadcastManager() {
    const { register, handleSubmit, reset, watch } = useForm();
    const [isSending, setIsSending] = useState(false);
    const [events, setEvents] = useState<any[]>([]);

    // Fetch upcoming events for target selection
    useEffect(() => {
        const todayStr = format(new Date(), "yyyy-MM-dd");
        const q = query(
            collection(db, "events"),
            where("date", ">=", todayStr),
            orderBy("date", "asc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    const onSend = async (data: any) => {
        setIsSending(true);
        try {
            await addDoc(collection(db, "alerts"), {
                ...data,
                targetAudience: data.targetAudience || 'all',
                eventId: data.eventId || null,
                createdAt: serverTimestamp()
            });
            toast.success("Broadcast Sent!");
            reset();
        } catch (e) {
            toast.error("Failed to send");
        } finally {
            setIsSending(false);
        }
    };

    const targetAudience = watch("targetAudience", "all");
    const [myToken, setMyToken] = useState("");

    const handleGetToken = async () => {
        if (!messaging) return;
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(messaging, {
                    vapidKey: "BCZyd7vxN07SCJjLE9XQZQcr64q0zPGOflsye2QHxMSKTXvd56nB90x3PWyLI3uBqJRH8tlF3yG9tWDqaleo8Bk"
                });
                setMyToken(token);
                toast.success("Token generated!");
            } else {
                toast.error("Permission denied");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error getting token");
        }
    };

    const handleTestNotification = () => {
        new Notification("Test Notification", {
            body: "This is how your notifications will look!",
            icon: "/icon.svg"
        });
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <SectionHeader
                title="Global Broadcast"
                subtitle="Send a live popup message to all active users."
            />

            {/* Testing Tools Panel */}
            <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-6 mb-8">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-400" /> Push Notification Tester
                </h3>
                <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <button onClick={handleGetToken} className="btn-secondary text-xs py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white">
                            1. Get My Device Token
                        </button>
                        {myToken && (
                            <button onClick={() => { navigator.clipboard.writeText(myToken); toast.success("Copied!"); }} className="btn-secondary text-xs py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500 rounded-lg text-purple-200 flex items-center gap-2">
                                <Copy size={12} /> Copy Token
                            </button>
                        )}
                        <button onClick={handleTestNotification} className="btn-secondary text-xs py-2 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white">
                            2. Send Local Test
                        </button>
                    </div>
                    {myToken && (
                        <code className="text-[10px] text-neutral-500 bg-black/50 p-2 rounded break-all font-mono">
                            {myToken}
                        </code>
                    )}
                    <p className="text-[10px] text-neutral-500">
                        *Use "Copy Token" to send a test message to THIS device from the <a href="https://console.firebase.google.com/" target="_blank" className="underline hover:text-white">Firebase Console</a>.
                    </p>
                </div>
            </div>

            <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 max-w-2xl">
                <form onSubmit={handleSubmit(onSend)} className="space-y-6">

                    {/* Targeting Section */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                        <label className="text-xs font-bold text-neutral-500 uppercase block">Target Audience</label>
                        <div className="flex gap-4">
                            <label className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${targetAudience === 'all' ? 'bg-purple-500/20 border-purple-500 text-purple-200' : 'bg-black/20 border-white/10 text-neutral-400'}`}>
                                <input {...register("targetAudience")} type="radio" value="all" className="sr-only" defaultChecked />
                                <Globe size={18} />
                                <span className="font-bold text-sm">Everyone</span>
                            </label>
                            <label className={`flex-1 p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${targetAudience === 'subscribers' ? 'bg-purple-500/20 border-purple-500 text-purple-200' : 'bg-black/20 border-white/10 text-neutral-400'}`}>
                                <input {...register("targetAudience")} type="radio" value="subscribers" className="sr-only" />
                                <Users size={18} />
                                <span className="font-bold text-sm">Event Subscribers</span>
                            </label>
                        </div>

                        {targetAudience === 'subscribers' && (
                            <div className="pt-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">Select Event</label>
                                <select {...register("eventId")} className="input-field" required>
                                    <option value="">-- Choose an Event --</option>
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>
                                            {event.date} - {event.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">Message Type</label>
                        <div className="grid grid-cols-4 gap-4">
                            {['info', 'live', 'warning', 'success'].map(type => (
                                <label key={type} className="cursor-pointer relative">
                                    <input {...register("type")} type="radio" value={type} className="peer sr-only" defaultChecked={type === 'info'} />
                                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-center transition-all peer-checked:bg-white/10 peer-checked:border-white/20 peer-checked:scale-105">
                                        <div className={`mx-auto w-8 h-8 rounded-full mb-2 flex items-center justify-center bg-gradient-to-br ${type === 'live' ? 'from-red-600 to-pink-600' :
                                            type === 'warning' ? 'from-yellow-600 to-orange-600' :
                                                type === 'success' ? 'from-green-600 to-emerald-600' :
                                                    'from-purple-600 to-blue-600'
                                            }`}>
                                            {type === 'live' && <Radio className="w-4 h-4 text-white" />}
                                            {type === 'info' && <Bell className="w-4 h-4 text-white" />}
                                            {type === 'warning' && <AlertTriangle className="w-4 h-4 text-white" />}
                                            {type === 'success' && <CheckCircle className="w-4 h-4 text-white" />}
                                        </div>
                                        <span className="text-xs font-bold uppercase text-neutral-400 peer-checked:text-white block">{type}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">Headline</label>
                        <input {...register("title")} placeholder="e.g. LIVE NOW!" className="input-field text-xl font-bold" required />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">Message</label>
                        <textarea {...register("message")} placeholder="e.g. Playing the new album early. Get in here." rows={3} className="input-field" required />
                    </div>

                    <button
                        disabled={isSending}
                        className="w-full py-4 bg-white text-black font-black text-lg rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                        {isSending ? "SENDING..." : "BLAST MESSAGE"}
                    </button>

                    <p className="text-xs text-center text-neutral-500">
                        This will appear instantly for all users currently on the site.
                    </p>
                </form>
            </div>
        </motion.div>
    )
}

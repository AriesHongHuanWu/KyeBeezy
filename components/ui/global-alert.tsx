"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { db, messaging } from "@/lib/firebase";
import { onMessage } from "firebase/messaging";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Radio, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface AlertMessage {
    id: string;
    title: string;
    message: string;
    type: "info" | "live" | "warning" | "success";
    targetAudience?: "all" | "subscribers";
    eventId?: string;
    createdAt: Timestamp | Date; // Allow Date for local FCM messages
}

export default function GlobalAlert() {
    const [alert, setAlert] = useState<AlertMessage | null>(null);
    const [visible, setVisible] = useState(false);

    // Track seen alerts to prevent re-showing old ones on refresh (optional, but good UX)
    // For this implementation, we'll just show any alert created in the last 60 seconds

    // 1. Listen for Firestore alerts (Admin Broadcasts)
    useEffect(() => {
        const q = query(
            collection(db, "alerts"),
            orderBy("createdAt", "desc"),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const data = snapshot.docs[0].data() as AlertMessage;
                const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt;
                const now = new Date();

                // Only show if created within the last 5 minutes to avoid stale alerts
                if (createdAt && (now.getTime() - createdAt.getTime()) < 5 * 60 * 1000) {

                    // Filter Logic
                    if (data.targetAudience === 'subscribers' && data.eventId) {
                        const subs = JSON.parse(localStorage.getItem("kye_event_subs") || "[]");
                        if (!subs.includes(data.eventId)) {
                            return; // User is not subscribed
                        }
                    }

                    // Check if it's actually different from the current one to avoid react loop
                    setAlert({ ...data, id: snapshot.docs[0].id });
                    setVisible(true);

                    // Auto dismiss after 10 seconds
                    setTimeout(() => setVisible(false), 10000);
                }
            }
        });

        // 2. Listen for Foreground FCM Messages (Push Notifications while app is open)
        if (messaging) {
            onMessage(messaging, (payload) => {
                console.log("Foreground Message:", payload);
                setAlert({
                    id: 'fcm-' + Date.now(),
                    title: payload.notification?.title || "New Notification",
                    message: payload.notification?.body || "",
                    type: "info", // Default to info for FCM
                    createdAt: new Date()
                });
                setVisible(true);
                setTimeout(() => setVisible(false), 10000);
            });
        }

        return () => unsubscribe();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case "live": return <Radio className="w-5 h-5 text-white animate-pulse" />;
            case "warning": return <AlertTriangle className="w-5 h-5 text-white" />;
            case "success": return <CheckCircle className="w-5 h-5 text-white" />;
            default: return <Bell className="w-5 h-5 text-white" />;
        }
    };

    const getColors = (type: string) => {
        switch (type) {
            case "live": return "from-red-600 to-pink-600 border-red-500/50 shadow-red-500/20";
            case "warning": return "from-yellow-600 to-orange-600 border-yellow-500/50 shadow-yellow-500/20";
            case "success": return "from-green-600 to-emerald-600 border-green-500/50 shadow-green-500/20";
            default: return "from-purple-600 to-blue-600 border-purple-500/50 shadow-purple-500/20";
        }
    };

    return (
        <AnimatePresence>
            {visible && alert && (
                <motion.div
                    initial={{ y: -100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -100, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="fixed top-24 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4"
                >
                    <div className={`pointer-events-auto relative w-full max-w-lg bg-black/80 backdrop-blur-xl border rounded-2xl p-1 shadow-2xl overflow-hidden flex items-stretch ${getColors(alert.type)}`}>
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-r ${getColors(alert.type)} opacity-10`} />

                        {/* Type Strip */}
                        <div className={`w-1.5 rounded-l-xl bg-gradient-to-b ${getColors(alert.type)}`} />

                        <div className="flex-1 p-4 flex items-start gap-4">
                            <div className={`p-3 rounded-full bg-gradient-to-br ${getColors(alert.type)} shadow-lg flex-shrink-0`}>
                                {getIcon(alert.type)}
                            </div>

                            <div className="flex-1 min-w-0 pt-1">
                                <h4 className="text-white font-bold text-lg leading-none mb-1 drop-shadow-sm font-outfit uppercase tracking-tight">
                                    {alert.title}
                                </h4>
                                <p className="text-white/80 text-sm leading-tight text-shadow-sm font-medium">
                                    {alert.message}
                                </p>
                            </div>

                            <button
                                onClick={() => setVisible(false)}
                                className="p-2 -mr-2 -mt-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

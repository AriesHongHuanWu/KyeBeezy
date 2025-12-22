"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Radio, Bell, AlertTriangle, CheckCircle } from "lucide-react";
import { SectionHeader } from "@/app/admin/page";

export default function BroadcastManager() {
    const { register, handleSubmit, reset } = useForm();
    const [isSending, setIsSending] = useState(false);

    const onSend = async (data: any) => {
        setIsSending(true);
        try {
            await addDoc(collection(db, "alerts"), {
                ...data,
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

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <SectionHeader
                title="Global Broadcast"
                subtitle="Send a live popup message to all active users."
            />

            <div className="bg-neutral-900/50 border border-white/10 rounded-3xl p-8 max-w-2xl">
                <form onSubmit={handleSubmit(onSend)} className="space-y-6">
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

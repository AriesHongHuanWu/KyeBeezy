"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Plus, Trash2, Copy, RefreshCw, Key } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { toast } from "sonner";

interface AccessKey {
    id: string;
    key: string;
    maxUses: number;
    currentUses: number;
    createdBy: string;
    createdAt: Timestamp; // Using Firestore Timestamp
}

const generateRandomKey = (length = 8) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

export const AccessKeyManager = () => {
    const [keys, setKeys] = useState<AccessKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [newKeyMaxUses, setNewKeyMaxUses] = useState(1);

    // Fetch Keys
    useEffect(() => {
        const q = query(collection(db, "university_access_keys"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedKeys = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as AccessKey));
            setKeys(fetchedKeys);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Create Key
    const handleCreateKey = async () => {
        try {
            const newKey = generateRandomKey();
            await addDoc(collection(db, "university_access_keys"), {
                key: newKey,
                maxUses: newKeyMaxUses,
                currentUses: 0,
                createdBy: "Admin", // Ideally fetch current user name
                createdAt: serverTimestamp()
            });
            toast.success(`Key ${newKey} created!`);
        } catch (error) {
            console.error("Error creating key:", error);
            toast.error("Failed to create key");
        }
    };

    // Delete Key
    const handleDeleteKey = async (id: string) => {
        if (!confirm("Are you sure you want to revoke this key?")) return;
        try {
            await deleteDoc(doc(db, "university_access_keys", id));
            toast.success("Key revoked");
        } catch (error) {
            toast.error("Failed to delete key");
        }
    };

    // Copy to Clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    return (
        <div className="space-y-8 p-6 bg-white dark:bg-black/40 rounded-3xl border border-neutral-200 dark:border-white/5 min-h-[600px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Key className="w-6 h-6 text-yellow-500" /> Access Key Management
                    </h2>
                    <p className="text-neutral-500 dark:text-white/40 text-sm mt-1">
                        Control access to the Faculty Application portal.
                    </p>
                </div>

                {/* Create Key Control */}
                <div className="flex items-center gap-4 bg-neutral-100 dark:bg-white/5 p-2 rounded-xl border border-neutral-200 dark:border-white/10">
                    <div className="flex items-center gap-2 px-3">
                        <span className="text-xs text-neutral-500 dark:text-white/50 uppercase font-bold">Max Uses:</span>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={newKeyMaxUses}
                            onChange={(e) => setNewKeyMaxUses(parseInt(e.target.value) || 1)}
                            className="w-16 bg-white dark:bg-black/50 border border-neutral-300 dark:border-white/10 rounded px-2 py-1 text-black dark:text-white text-center focus:border-yellow-500 outline-none"
                        />
                    </div>
                    <button
                        onClick={handleCreateKey}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Generate Key
                    </button>
                </div>
            </div>

            {/* Keys List */}
            <div className="grid gap-4">
                <AnimatePresence>
                    {keys.length > 0 ? (
                        keys.map((key) => (
                            <motion.div
                                key={key.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-col md:flex-row items-center justify-between p-4 bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-2xl hover:border-blue-500/30 transition-colors group"
                            >
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className={`p-3 rounded-xl ${key.currentUses >= key.maxUses ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-500' : 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-500'}`}>
                                        <Key className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <code className="text-xl font-mono font-bold text-neutral-900 dark:text-white tracking-wider">{key.key}</code>
                                            <button onClick={() => copyToClipboard(key.key)} className="text-neutral-400 hover:text-white transition-colors">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500 dark:text-white/40">
                                            <span>Created: {key.createdAt?.toDate().toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span className={key.currentUses >= key.maxUses ? "text-red-500 font-bold" : "text-green-500"}>
                                                Uses: {key.currentUses} / {key.maxUses}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto justify-end">
                                    {key.currentUses >= key.maxUses && (
                                        <span className="px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 text-xs font-bold uppercase tracking-wider">
                                            Exhausted
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleDeleteKey(key.id)}
                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 text-neutral-400 hover:text-red-500 rounded-lg transition-colors"
                                        title="Revoke Key"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-neutral-400 dark:text-white/20">
                            <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No active access keys found.</p>
                            <p className="text-sm">Generate one to allow faculty applications.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

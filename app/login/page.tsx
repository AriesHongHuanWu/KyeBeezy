"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase"; // Make sure to export googleProvider from your firebase.ts
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
            router.push("/admin");
        } catch (err: any) {
            console.error("Login failed", err);
            setError(err.message || "Failed to log in.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-900/20 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm bg-card/50 border border-border rounded-2xl p-8 backdrop-blur-xl relative z-10 text-center space-y-8 shadow-xl"
            >
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Access</h1>
                    <p className="text-muted-foreground text-sm">Sign in to manage submissions and moderate content.</p>
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full h-12 bg-white text-black hover:bg-gray-200 font-medium rounded-xl transition-all shadow-md"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 mr-2" />
                        )}
                        Sign in with Google
                    </Button>

                    {error && (
                        <div className="text-destructive text-xs bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                            {error}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

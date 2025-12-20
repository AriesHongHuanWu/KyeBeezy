"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SUPER_ADMIN = "arieswu001@gmail.com";

function AdminProtection({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        async function checkAdminStatus() {
            if (loading) return;

            if (!user) {
                if (pathname !== "/admin/login") {
                    router.push("/admin/login");
                }
                setCheckingAuth(false);
                return;
            }

            // Check Hardcoded Super Admin
            if (user.email === SUPER_ADMIN) {
                setIsAuthorized(true);
                setCheckingAuth(false);
                return;
            }

            // Check Firestore for other admins
            try {
                const adminDoc = await getDoc(doc(db, "admins", user.email!));
                if (adminDoc.exists()) {
                    setIsAuthorized(true);
                } else {
                    toast.error("Access Denied: You are not an admin.");
                    router.push("/"); // Redirect to home
                }
            } catch (error) {
                console.error("Auth Check Error", error);
            } finally {
                setCheckingAuth(false);
            }
        }

        checkAdminStatus();
    }, [user, loading, router, pathname]);

    if (loading || checkingAuth) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
                    <p className="animate-pulse text-sm text-neutral-500">Verifying Clearance...</p>
                </div>
            </div>
        );
    }

    // If on login page, show children (login form)
    if (pathname === "/admin/login") {
        if (user && isAuthorized) {
            router.push("/admin"); // Already logged in, go to dashboard
            return null;
        }
        return <>{children}</>;
    }

    // Secure Route Protection
    return isAuthorized ? <>{children}</> : null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AdminProtection>
                {children}
                <Toaster theme="dark" position="top-right" />
            </AdminProtection>
        </AuthProvider>
    );
}

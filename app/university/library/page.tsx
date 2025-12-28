"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LibraryPage() {
    return (
        <div className="container mx-auto px-6 py-24 min-h-screen flex flex-col items-center justify-center text-center">
            <h1 className="text-4xl font-bold text-black dark:text-white mb-4">Resource Library</h1>
            <p className="text-neutral-500 mb-8">Downloadable assets coming soon.</p>
            <Link href="/university" className="flex items-center gap-2 text-blue-600 font-bold hover:underline">
                <ArrowLeft size={16} /> Back to University
            </Link>
        </div>
    )
}

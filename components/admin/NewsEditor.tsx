
"use client";

import { useState, useRef } from "react";
import {
    Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon,
    MoreHorizontal, Sparkles, Wand2, Check, X, Quote, Code, Heading1, Heading2
} from "lucide-react";
import { toast } from "sonner";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface NewsEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function NewsEditor({ value, onChange }: NewsEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [uploading, setUploading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showAiMenu, setShowAiMenu] = useState(false);

    // --- Helper to insert text at cursor ---
    const insertText = (before: string, after = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);

        const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
        onChange(newText);

        // Reset cursor position? Ideally wrapping selection.
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        });
    };

    const handleImageUpload = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const storageRef = ref(storage, `news/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            insertText(`\n![Image](${url})\n`);
            toast.success("Image uploaded!");
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleAI = async (action: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        const context = text; // Send full text for context if needed

        // If no text selected and action needs it, warn
        if (!selectedText && ["fix", "improve", "summarize"].includes(action)) {
            toast.error("Please select text to process.");
            return;
        }

        setAiLoading(true);
        setShowAiMenu(false);

        try {
            const res = await fetch("/api/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: selectedText || text, action, context })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            if (data.result) {
                if (selectedText) {
                    // Replace selected text
                    const newText = text.substring(0, start) + data.result + text.substring(end);
                    onChange(newText);
                } else {
                    // Append or simple insert if nothing selected (e.g. generate from scratch? Not implemented yet)
                    insertText(`\n${data.result}\n`);
                }
                toast.success("AI Magic applied! ✨");
            }
        } catch (error: any) {
            toast.error(error.message || "AI Failed");
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="border border-neutral-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            {/* Toolbar */}
            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-2 flex flex-wrap gap-1 border-b border-neutral-200 dark:border-white/5">
                {/* Basic Formatting */}
                <button type="button" onClick={() => insertText("**", "**")} className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400" title="Bold"><Bold size={16} /></button>
                <button type="button" onClick={() => insertText("*", "*")} className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400" title="Italic"><Italic size={16} /></button>
                <button type="button" onClick={() => insertText("# ")} className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400" title="H1"><Heading1 size={16} /></button>
                <button type="button" onClick={() => insertText("## ")} className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400" title="H2"><Heading2 size={16} /></button>

                <div className="w-px h-6 bg-neutral-300 dark:bg-white/10 mx-1 self-center" />

                {/* Lists & Quotes */}
                <button type="button" onClick={() => insertText("- ")} className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400" title="Bullet List"><List size={16} /></button>
                <button type="button" onClick={() => insertText("1. ")} className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400" title="Numbered List"><ListOrdered size={16} /></button>
                <button type="button" onClick={() => insertText("> ")} className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400" title="Quote"><Quote size={16} /></button>
                <button type="button" onClick={() => insertText("```\n", "\n```")} className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400" title="Code Block"><Code size={16} /></button>
                <button type="button" onClick={() => insertText("[Link Text](url)")} className="p-2 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400" title="Link"><LinkIcon size={16} /></button>

                <div className="w-px h-6 bg-neutral-300 dark:bg-white/10 mx-1 self-center" />

                {/* Image Upload */}
                <div className="relative">
                    <input type="file" onChange={handleImageUpload} className="hidden" id="toolbar-img-upload" />
                    <label htmlFor="toolbar-img-upload" className={`cursor-pointer p-2 rounded hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-600 dark:text-neutral-400 flex items-center justify-center ${uploading ? 'opacity-50' : ''}`} title="Upload Image">
                        <ImageIcon size={16} />
                    </label>
                </div>

                <div className="flex-1" />

                {/* AI Menu */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowAiMenu(!showAiMenu)}
                        className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${aiLoading ? "bg-neutral-100 text-neutral-400" : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:opacity-90 shadow-lg shadow-blue-500/20"}`}
                        disabled={aiLoading}
                    >
                        {aiLoading ? <Wand2 key="loading" className="animate-spin" size={14} /> : <Sparkles key="sparkles" size={14} />}
                        {aiLoading ? "Thinking..." : "AI Magic"}
                    </button>

                    {showAiMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-200 dark:border-white/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 p-1">
                            <button type="button" onClick={() => handleAI("fix")} className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-lg flex items-center gap-2">
                                <Check size={14} className="text-green-500" /> Fix Grammar
                            </button>
                            <button type="button" onClick={() => handleAI("improve")} className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-lg flex items-center gap-2">
                                <Wand2 size={14} className="text-purple-500" /> Improve Writing
                            </button>
                            <button type="button" onClick={() => handleAI("hype")} className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-lg flex items-center gap-2">
                                <Zap size={14} className="text-yellow-500" /> Make it Hype 🔥
                            </button>
                            <div className="h-px bg-neutral-200 dark:bg-white/10 my-1" />
                            <button type="button" onClick={() => handleAI("expand")} className="w-full text-left px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-lg flex items-center gap-2">
                                <MoreHorizontal size={14} /> Expand Selection
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Text Area */}
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Write something amazing... (Markdown supported)"
                className="w-full h-96 p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400"
            />
            {/* Footer */}
            <div className="bg-neutral-50 dark:bg-neutral-800/50 px-4 py-2 flex justify-between items-center border-t border-neutral-200 dark:border-white/5 text-[10px] text-neutral-400">
                <span>Markdown Supported</span>
                <span>{value.length} chars</span>
            </div>
        </div>
    );
}

// Icons imports (Adding Zap for Hype mode)
import { Zap } from "lucide-react";

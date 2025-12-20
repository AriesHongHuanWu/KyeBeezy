"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Confetti = ({ isActive }: { isActive: boolean }) => {
    const [particles, setParticles] = useState<{ id: number; x: number; color: string }[]>([]);

    useEffect(() => {
        if (isActive) {
            const colors = ["#fbbf24", "#f59e0b", "#d97706", "#ffffff", "#ffd700"];
            const newParticles = Array.from({ length: 50 }).map((_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: colors[Math.floor(Math.random() * colors.length)],
            }));
            setParticles(newParticles);
        } else {
            setParticles([]);
        }
    }, [isActive]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
                    animate={{
                        y: "110vh",
                        rotate: 360 * 2,
                        x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`],
                    }}
                    transition={{
                        duration: Math.random() * 2 + 2,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: Math.random() * 2,
                    }}
                    style={{
                        position: "absolute",
                        width: "10px",
                        height: "10px",
                        backgroundColor: p.color,
                        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                    }}
                />
            ))}
        </div>
    );
};

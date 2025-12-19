"use client";

import { motion } from "framer-motion";
import { Copy, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Product {
    id: string;
    title: string;
    description: string;
    image: string;
    link: string;
    tag: string;
    tagColor: string; // Tailwind class for tag bg
    gradient: string; // Tailwind classes for card gradient
    glowColor: string; // Hex for glow effects
    hoverText: string;
    buttonText: string;
    buttonColor: string; // Tailwind text color class
}

const products: Product[] = [
    {
        id: "chefs-choice",
        title: "Chef's Choice Energy Tub",
        description: "Can't decide? Let us surprise you! The staff picks a flavor they think you'll love.",
        image: "/dubby/chef-choice.png",
        link: "https://www.dubby.gg/products/chefs-choice-energy-tub-we-surprise-you?ref=gvqslrbj",
        tag: "MYSTERY FLAVOR",
        tagColor: "bg-purple-500",
        gradient: "from-purple-900/20 to-blue-900/20",
        glowColor: "rgba(168,85,247,0.5)",
        hoverText: "group-hover:text-purple-400",
        buttonText: "GET SURPRISED",
        buttonColor: "text-purple-400"
    },
    {
        id: "hydro-sampler",
        title: "Hydro Sampler Pack",
        description: "6 caffeine-free refreshing drinks. Hydrate with flavor and electrolytes.",
        image: "/dubby/hydro-sampler.png",
        link: "https://www.dubby.gg/products/hydro-sampler-pack-6-caffeine-free-drinks?ref=gvqslrbj",
        tag: "CAFFEINE FREE",
        tagColor: "bg-blue-500",
        gradient: "from-blue-900/20 to-cyan-900/20",
        glowColor: "rgba(59,130,246,0.5)",
        hoverText: "group-hover:text-blue-400",
        buttonText: "HYDRATE NOW",
        buttonColor: "text-blue-400"
    },
    {
        id: "pushin-punch",
        title: "Pushin Punch",
        description: "A refreshing fruit punch kick. The perfect daily driver without the crash.",
        image: "/dubby/PushinPunch_Front.png",
        link: "https://www.dubby.gg/products/pushin-punch-energy-drink-tub?ref=gvqslrbj",
        tag: "BEST SELLER",
        tagColor: "bg-red-500",
        gradient: "from-red-900/20 to-orange-900/20",
        glowColor: "rgba(239,68,68,0.5)",
        hoverText: "group-hover:text-red-400",
        buttonText: "GET PUNCHED",
        buttonColor: "text-red-400"
    },
    {
        id: "japanese-soda",
        title: "Japanese Soda",
        description: "Sweet, bubbly, and unique. Experience the iconic Ramune flavor with a kick.",
        image: "/dubby/Dubby_JapaneseSoda_Front.png",
        link: "https://www.dubby.gg/products/japanese-soda-flavor-energy-drink-tub?ref=gvqslrbj",
        tag: "FAN FAVORITE",
        tagColor: "bg-pink-500",
        gradient: "from-pink-900/20 to-cyan-900/20",
        glowColor: "rgba(236,72,153,0.5)", // Pink-500
        hoverText: "group-hover:text-pink-400",
        buttonText: "TASTE JAPAN",
        buttonColor: "text-pink-400"
    },
    {
        id: "grandmas-lemonade",
        title: "Grandma's Lemonade",
        description: "Classic, tart, and sweet. The ultimate caffeine-free hydration refresher.",
        image: "/dubby/gRandma_lemon.png",
        link: "https://www.dubby.gg/products/grandmas-lemonade-hydro-hydration-drink-tub-caffeine-free?ref=gvqslrbj",
        tag: "CAFFEINE FREE",
        tagColor: "bg-yellow-500",
        gradient: "from-yellow-900/20 to-green-900/20",
        glowColor: "rgba(234,179,8,0.5)", // Yellow-500
        hoverText: "group-hover:text-yellow-400",
        buttonText: "GET LEMONADE",
        buttonColor: "text-yellow-400"
    },
    {
        id: "smores",
        title: "Smores Flavor",
        description: "Toasted marshmallow and chocolate. A campfire treat in a tub.",
        image: "/dubby/Dubby_Smores_Front.png",
        link: "https://www.dubby.gg/products/smores-flavor-energy-drink-tub?ref=gvqslrbj",
        tag: "LIMITED EDITION",
        tagColor: "bg-orange-600",
        gradient: "from-orange-900/20 to-amber-900/20",
        glowColor: "rgba(234,88,12,0.5)", // Orange-600
        hoverText: "group-hover:text-orange-400",
        buttonText: "GET TOASTY",
        buttonColor: "text-orange-400"
    }
];

export default function DubbyPromo() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("BONNET-ENERGY");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-900/10 to-background/0 z-0" />

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-4xl md:text-5xl font-black font-outfit mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-500">
                        POWER UP WITH DUBBY
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Focus better, react faster. No crash, no jitters.
                    </p>

                    {/* Discount Code */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="mt-8 inline-flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl cursor-pointer group"
                        onClick={handleCopy}
                    >
                        <div className="text-left">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">Discount Code</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-mono font-bold text-yellow-400">BONNET-ENERGY</span>
                                <Copy className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                            </div>
                        </div>
                        <div className="pl-4 border-l border-white/10">
                            <span className="text-xl font-bold text-green-400">10% OFF</span>
                        </div>

                        {copied && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded"
                            >
                                COPIED!
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-2">
                    {products.map((product) => (
                        <Link key={product.id} href={product.link} target="_blank">
                            <motion.div
                                whileHover={{ y: -10 }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                className={`h-full bg-gradient-to-br ${product.gradient} border border-white/10 rounded-3xl p-1 overflow-hidden relative group`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-r ${product.gradient.replace('/20', '/10')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className="bg-black/40 backdrop-blur-sm rounded-[22px] p-6 h-full flex flex-col items-center text-center relative z-10 transition-colors group-hover:bg-black/30">
                                    <div className={`absolute top-4 right-4 ${product.tagColor} text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
                                        {product.tag}
                                    </div>

                                    <div className="w-48 h-48 mb-6 relative flex items-center justify-center">
                                        <div
                                            className="absolute inset-0 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"
                                            style={{ backgroundColor: product.tagColor.replace('bg-', '').replace('-500', '') }}
                                        />
                                        <Image
                                            src={product.image}
                                            alt={product.title}
                                            width={200}
                                            height={200}
                                            className="object-contain hover:rotate-6 transition-transform duration-500 relative z-10"
                                            style={{
                                                filter: `drop-shadow(0 0 15px ${product.glowColor})`
                                            }}
                                        />
                                    </div>

                                    <h3 className={`text-2xl font-bold font-outfit mb-2 transition-colors ${product.hoverText}`}>
                                        {product.title}
                                    </h3>
                                    <p className="text-muted-foreground mb-6 text-sm">
                                        {product.description}
                                    </p>

                                    <div className={`mt-auto flex items-center gap-2 font-bold transition-transform group-hover:translate-x-2 ${product.buttonColor}`}>
                                        {product.buttonText} <ExternalLink className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

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
        gradient: "from-purple-500/10 to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20",
        glowColor: "rgba(168,85,247,0.5)",
        hoverText: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
        buttonText: "GET SURPRISED",
        buttonColor: "text-purple-600 dark:text-purple-400"
    },
    {
        id: "hydro-sampler",
        title: "Hydro Sampler Pack",
        description: "6 caffeine-free refreshing drinks. Hydrate with flavor and electrolytes.",
        image: "/dubby/hydro-sampler.png",
        link: "https://www.dubby.gg/products/hydro-sampler-pack-6-caffeine-free-drinks?ref=gvqslrbj",
        tag: "CAFFEINE FREE",
        tagColor: "bg-blue-500",
        gradient: "from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20",
        glowColor: "rgba(59,130,246,0.5)",
        hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
        buttonText: "HYDRATE NOW",
        buttonColor: "text-blue-600 dark:text-blue-400"
    },
    {
        id: "pushin-punch",
        title: "Pushin Punch",
        description: "A refreshing fruit punch kick. The perfect daily driver without the crash.",
        image: "/dubby/PushinPunch_Front.png",
        link: "https://www.dubby.gg/products/pushin-punch-energy-drink-tub?ref=gvqslrbj",
        tag: "BEST SELLER",
        tagColor: "bg-red-500",
        gradient: "from-red-500/10 to-orange-500/10 dark:from-red-900/20 dark:to-orange-900/20",
        glowColor: "rgba(239,68,68,0.5)",
        hoverText: "group-hover:text-red-600 dark:group-hover:text-red-400",
        buttonText: "GET PUNCHED",
        buttonColor: "text-red-600 dark:text-red-400"
    },
    {
        id: "japanese-soda",
        title: "Japanese Soda",
        description: "Sweet, bubbly, and unique. Experience the iconic Ramune flavor with a kick.",
        image: "/dubby/Dubby_JapaneseSoda_Front.png",
        link: "https://www.dubby.gg/products/japanese-soda-flavor-energy-drink-tub?ref=gvqslrbj",
        tag: "FAN FAVORITE",
        tagColor: "bg-pink-500",
        gradient: "from-pink-500/10 to-cyan-500/10 dark:from-pink-900/20 dark:to-cyan-900/20",
        glowColor: "rgba(236,72,153,0.5)", // Pink-500
        hoverText: "group-hover:text-pink-600 dark:group-hover:text-pink-400",
        buttonText: "TASTE JAPAN",
        buttonColor: "text-pink-600 dark:text-pink-400"
    },
    {
        id: "grandmas-lemonade",
        title: "Grandma's Lemonade",
        description: "Classic, tart, and sweet. The ultimate caffeine-free hydration refresher.",
        image: "/dubby/gRandma_lemon.png",
        link: "https://www.dubby.gg/products/grandmas-lemonade-hydro-hydration-drink-tub-caffeine-free?ref=gvqslrbj",
        tag: "CAFFEINE FREE",
        tagColor: "bg-yellow-500",
        gradient: "from-yellow-500/10 to-green-500/10 dark:from-yellow-900/20 dark:to-green-900/20",
        glowColor: "rgba(234,179,8,0.5)", // Yellow-500
        hoverText: "group-hover:text-yellow-600 dark:group-hover:text-yellow-400",
        buttonText: "GET LEMONADE",
        buttonColor: "text-yellow-600 dark:text-yellow-400"
    },
    {
        id: "smores",
        title: "Smores Flavor",
        description: "Toasted marshmallow and chocolate. A campfire treat in a tub.",
        image: "/dubby/Dubby_Smores_Front.png",
        link: "https://www.dubby.gg/products/smores-flavor-energy-drink-tub?ref=gvqslrbj",
        tag: "LIMITED EDITION",
        tagColor: "bg-orange-600",
        gradient: "from-orange-600/10 to-amber-600/10 dark:from-orange-900/20 dark:to-amber-900/20",
        glowColor: "rgba(234,88,12,0.5)", // Orange-600
        hoverText: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
        buttonText: "GET TOASTY",
        buttonColor: "text-orange-600 dark:text-orange-400"
    }
];

export default function DubbyPromo() {
    const [copied, setCopied] = useState(false);

    const [isAltImage, setIsAltImage] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("BONNET-ENERGY");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section id="dubby" className="py-20 relative overflow-hidden transition-colors duration-300">
            {/* Background elements - Subtle in light mode, dark in dark mode */}
            {/* REMOVED opaque bg-background, adjusted gradient to be very subtle overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-purple-100/20 to-transparent dark:from-purple-900/10 dark:to-transparent z-0 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="mb-20 flex flex-col lg:flex-row items-center gap-12 max-w-7xl mx-auto">
                    {/* Text Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 text-center lg:text-left z-10"
                    >
                        <h2 className="text-4xl md:text-6xl font-black font-outfit mb-6 text-foreground leading-tight drop-shadow-xl flex flex-col lg:block items-center lg:items-start gap-4">
                            <span>POWER UP WITH</span>
                            <div className="relative h-16 md:h-24 w-48 md:w-72 lg:inline-block lg:ml-4 align-middle">
                                <Image
                                    src="/dubby/dubby-logo.webp"
                                    alt="Dubby Energy"
                                    fill
                                    className="object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                    priority
                                />
                            </div>
                        </h2>
                        <p className="text-xl md:text-2xl text-muted-foreground/90 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                            Focus better. React faster. <br />
                            <span className="text-foreground font-semibold">No crash. No jitters.</span> Just pure performance.
                        </p>

                        {/* Discount Code */}
                        <motion.div
                            whileHover={{ scale: 1.02, translateY: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="mt-10 inline-flex flex-col sm:flex-row items-center gap-6 bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 p-2 pr-6 rounded-[2rem] cursor-pointer group shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 mx-auto lg:mx-0 max-w-fit"
                            onClick={handleCopy}
                        >
                            <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white px-6 py-4 rounded-[1.5rem] font-bold shadow-lg">
                                10% OFF
                            </div>
                            <div className="text-center sm:text-left py-2">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-1">Discount Code</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-mono font-bold text-foreground tracking-tight">BONNET-ENERGY</span>
                                    <Copy className="w-5 h-5 text-muted-foreground group-hover:text-purple-400 transition-colors" />
                                </div>
                            </div>

                            {copied && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className="absolute -top-12 left-1/2 -translate-x-1/2 lg:left-20 lg:translate-x-0 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                                >
                                    <span>COPIED!</span>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>

                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, rotate: 5 }}
                        whileInView={{ opacity: 1, x: 0, rotate: 3 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex-1 relative w-full max-w-md lg:max-w-xl cursor-pointer"
                        onClick={() => setIsAltImage(!isAltImage)}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="relative aspect-square">
                            {/* Decorative Elements */}
                            <div className={`absolute -inset-4 bg-gradient-to-tr ${isAltImage ? 'from-pink-500 to-yellow-500' : 'from-purple-500 to-cyan-500'} rounded-[2.5rem] blur-2xl opacity-30 animate-pulse transition-colors duration-1000`} />
                            <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500/50 to-cyan-500/50 rounded-[2.5rem] backdrop-blur-sm" />

                            {/* Main Image */}
                            <div className="relative h-full w-full rounded-[2rem] overflow-hidden shadow-2xl isolate transform-gpu group">
                                <motion.div
                                    key={isAltImage ? "alt" : "main"}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 w-full h-full"
                                >
                                    <Image
                                        src={isAltImage ? "/dubby/endorsement-alt.jpg" : "/dubby/endorsement.jpg"}
                                        alt="Kye Beezy with Dubby"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out will-change-transform"
                                        priority
                                    />
                                </motion.div>

                                {/* Floating Badge */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 1, duration: 0.5 }}
                                    className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 pointer-events-none"
                                >
                                    <span className={`w-2 h-2 rounded-full ${isAltImage ? 'bg-pink-500' : 'bg-green-500'} animate-pulse`} />
                                    OFFICIAL PARTNER
                                </motion.div>

                                {/* Hint Text */}
                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white/50 text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click to flip
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-2"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={{
                        hidden: {},
                        show: {
                            transition: {
                                staggerChildren: 0.15
                            }
                        }
                    }}
                >
                    {products.map((product) => (
                        <Link key={product.id} href={product.link} target="_blank">
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, scale: 0.8, y: 50 },
                                    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 60 } }
                                }}
                                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                                className={`h-full bg-gradient-to-br ${product.gradient} border border-white/20 dark:border-white/10 rounded-3xl p-1 overflow-hidden relative group shadow-lg hover:shadow-xl dark:shadow-none transition-shadow duration-500 backdrop-blur-sm`}
                            >
                                {/* Hover Glow */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${product.gradient.replace('/10', '/20').replace('/20', '/10')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                {/* Glass Card Content */}
                                <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-[22px] p-6 h-full flex flex-col items-center text-center relative z-10 transition-colors group-hover:bg-white/60 dark:group-hover:bg-black/30">
                                    <div className={`absolute top-4 right-4 ${product.tagColor} text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm`}>
                                        {product.tag}
                                    </div>

                                    {/* Image Container with "Popout" feel - Reduced overflow clipping issues by making image container larger */}
                                    <div className="w-56 h-56 -mt-4 mb-4 relative flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 ease-out">
                                        <div
                                            className="absolute inset-4 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                                            style={{ backgroundColor: product.tagColor.replace('bg-', '').replace('-500', '') }}
                                        />
                                        <Image
                                            src={product.image}
                                            alt={product.title}
                                            width={240}
                                            height={240}
                                            className="object-contain drop-shadow-2xl relative z-10"
                                            style={{
                                                // More subtle shadow for better blending
                                                filter: `drop-shadow(0 10px 20px ${product.glowColor})`
                                            }}
                                        />
                                    </div>

                                    <h3 className={`text-2xl font-bold font-outfit mb-2 transition-colors ${product.hoverText} text-foreground`}>
                                        {product.title}
                                    </h3>
                                    <p className="text-foreground/80 mb-6 text-sm leading-relaxed">
                                        {product.description}
                                    </p>

                                    <div className={`mt-auto flex items-center gap-2 font-bold transition-transform group-hover:translate-x-1 ${product.buttonColor}`}>
                                        {product.buttonText} <ExternalLink className="w-4 h-4" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </motion.div>
            </div>
        </section >
    );
}

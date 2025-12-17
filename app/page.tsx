import { ShaderAnimation } from "@/components/ui/shader-animation";
import { Youtube, Twitch, Music, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function Home() {
    const socialLinks = [
        {
            name: "Twitch",
            icon: <Twitch className="w-6 h-6" />,
            url: "https://www.twitch.tv/realkyebeezylive",
            color: "hover:bg-purple-600",
        },
        {
            name: "BandLab",
            icon: <Music className="w-6 h-6" />,
            url: "https://www.bandlab.com/kyebeezy",
            color: "hover:bg-red-600",
        },
        {
            name: "YouTube",
            icon: <Youtube className="w-6 h-6" />,
            url: "https://www.youtube.com/@kyebeezy",
            color: "hover:bg-red-600",
        },
        {
            name: "YouTube Live",
            icon: <Youtube className="w-6 h-6" />,
            url: "https://www.youtube.com/@KyeBeezyLiveOnTwitch",
            color: "hover:bg-red-600",
        },
    ];

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden text-white font-sans">
            <ShaderAnimation />

            <div className="z-10 bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 w-full max-w-2xl text-center shadow-2xl animate-fade-in-up">
                {/* Profile / Header Section */}
                <div className="mb-8">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full mb-6 p-1">
                        {/* Placeholder for Profile Image if available, otherwise Gradient Avatar */}
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-4xl font-bold">
                            KB
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                        Kye Beezy
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 font-medium">
                        Streamer • Musician • Content Creator
                    </p>
                </div>

                {/* Links Section */}
                <div className="space-y-4">
                    {socialLinks.map((link) => (
                        <Link
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all duration-300 ${link.color} hover:shadow-lg hover:bg-opacity-20`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform">
                                    {link.icon}
                                </div>
                                <span className="text-lg font-semibold">{link.name}</span>
                            </div>
                            <ExternalLink className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </Link>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 text-sm text-gray-500">
                    © {new Date().getFullYear()} Kye Beezy. All rights reserved.
                </div>
            </div>
        </main>
    );
}

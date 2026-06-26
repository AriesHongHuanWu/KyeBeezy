"use client";

import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import HeroBackground from "@/components/three/HeroBackground";
import Hero from "@/components/sections/Hero";
import AboutSection from "@/components/sections/About";
import MusicSection from "@/components/sections/Music";
import StreamingSection from "@/components/sections/Streaming";
import Schedule from "@/components/sections/Schedule";
import DubbyPromo from "@/components/sections/DubbyPromo";
import SponsorsSection from "@/components/sections/Sponsors";
import ContactSection from "@/components/sections/Contact";

export default function Home() {
    return (
        <main className="relative text-foreground font-sans selection:bg-brand/30">
            {/* Scroll-driven 3D character + brand aurora, fixed behind everything */}
            <HeroBackground />

            <SiteNav />

            {/* All content scrolls over the moving 3D background */}
            <div className="relative z-10 flex flex-col">
                <Hero />
                <AboutSection />
                <MusicSection />
                <StreamingSection />
                <Schedule />
                <DubbyPromo />
                <SponsorsSection />
                <ContactSection />
            </div>

            <SiteFooter />
        </main>
    );
}

"use client";

import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { SectionHeading } from "@/components/ui/section-heading";
import { CollabHero } from "@/components/collab/CollabHero";
import { CollabForm } from "@/components/collab/CollabForm";

export default function CollabPage() {
    return (
        <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
            {/* Brand-aurora wash over the dark canvas (kept subtle so glass + muted text stay legible) */}
            <div
                aria-hidden="true"
                className="bg-brand-aurora pointer-events-none fixed inset-0 -z-20 opacity-[0.12] blur-3xl"
            />
            {/* Subtle grain overlay (inline SVG data URI — no extra request) */}
            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 -z-10 opacity-[0.04] mix-blend-overlay"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
            />

            <SiteNav />

            <main>
                <CollabHero />

                <div className="px-5 pb-10 sm:px-8">
                    <SectionHeading
                        align="center"
                        eyebrow="The pitch desk"
                        title="Tell us what you've"
                        accent="got"
                    >
                        Pick a lane, drop the details, and attach your work. From features and beats to
                        brand deals, bookings and remixes — every serious pitch gets read.
                    </SectionHeading>
                </div>

                <CollabForm />
            </main>

            <SiteFooter />
        </div>
    );
}

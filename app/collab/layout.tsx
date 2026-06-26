import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Collaborate & Book | Kye Beezy",
    description:
        "Pitch a collab, feature, beat, remix, brand partnership or booking with Kye Beezy. Send your idea and portfolio — let's build something.",
    alternates: { canonical: "/collab" },
    openGraph: {
        title: "Collaborate with Kye Beezy",
        description: "Features, production, brand deals, bookings and remixes.",
        url: "https://kyebeezy.com/collab",
        siteName: "Kye Beezy",
        type: "website",
    },
    robots: { index: true, follow: true },
};

export default function CollabLayout({ children }: { children: React.ReactNode }) {
    return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "BonnetSubmit — Drop your track | Kye Beezy",
    description:
        "Submit your music to Kye Beezy's live stream queue. Get heard on stream, get real feedback, and a shot at promotion. Bonnet Gang members skip the line.",
    alternates: { canonical: "/submit" },
    openGraph: {
        title: "BonnetSubmit — Get heard live",
        description: "Drop your track into the live queue. Members jump the line.",
        url: "https://kyebeezy.com/submit",
        siteName: "Kye Beezy",
        type: "website",
    },
    robots: { index: true, follow: true },
};

export default function SubmitLayout({ children }: { children: React.ReactNode }) {
    return children;
}

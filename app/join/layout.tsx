import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Join the Bonnet Gang | Kye Beezy",
    description:
        "Become part of Kye Beezy's Discord. Pick a membership tier for priority in the BonnetSubmit queue, exclusive drops, behind-the-scenes access and more.",
    alternates: { canonical: "/join" },
    openGraph: {
        title: "Join the Bonnet Gang",
        description: "Membership tiers, priority access, and the inner circle on Discord.",
        url: "https://kyebeezy.com/join",
        siteName: "Kye Beezy",
        type: "website",
    },
    robots: { index: true, follow: true },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
    return children;
}

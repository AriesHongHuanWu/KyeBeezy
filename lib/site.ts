// Central site configuration — single source of truth for navigation, socials,
// membership tiers and collaboration types. Edit here to update the whole site.

export const SITE = {
    name: "Kye Beezy",
    shortName: "KYE",
    url: "https://kyebeezy.com",
    tagline: "Artist · Producer · Streamer",
    description:
        "Official home of Kye Beezy. Stream the music, catch the live Twitch vibes, drop your track into BonnetSubmit, and join the Bonnet Gang.",
} as const;

export const SOCIALS = {
    twitch: "https://www.twitch.tv/realkyebeezylive",
    youtube: "https://www.youtube.com/@KyeBeezyLiveOnTwitch",
    bandlab: "https://www.bandlab.com/kyebeezy",
    discord: "https://discord.com/invite/JU3MNRGWXq",
    email: "mailto:KYEBEEZY@GMAIL.COM",
    emailPlain: "KYEBEEZY@GMAIL.COM",
} as const;

export const DISCORD_INVITE = SOCIALS.discord;

// Twitch embed needs the parent domains whitelisted.
export const TWITCH_CHANNEL = "realkyebeezylive";
export const TWITCH_PARENTS = [
    "localhost",
    "kyeweb.pages.dev",
    "kyebeezy.pages.dev",
    "kyebeezy.com",
    "www.kyebeezy.com",
];

export type NavLink = {
    name: string;
    /** route path, e.g. "/join" */
    href?: string;
    /** in-page scroll target id (homepage only), e.g. "music" */
    to?: string;
    icon?: string; // lucide icon name (resolved in the nav component)
    emphasis?: boolean; // render as a highlighted CTA
};

// Primary marketing navigation. `to` items scroll on the homepage; `href` items route.
export const NAV_LINKS: NavLink[] = [
    { name: "Home", to: "hero", href: "/", icon: "Home" },
    { name: "About", to: "about", icon: "User" },
    { name: "Music", to: "music", icon: "Music" },
    { name: "Stream", to: "stream", icon: "Tv" },
    { name: "Events", href: "/events", icon: "Trophy" },
    { name: "BonnetSubmit", href: "/submit", icon: "Mic", emphasis: true },
    { name: "Join", href: "/join", icon: "Crown", emphasis: true },
    { name: "Collab", href: "/collab", icon: "Handshake" },
];

// Footer link groups
export const FOOTER_GROUPS: { title: string; links: NavLink[] }[] = [
    {
        title: "Explore",
        links: [
            { name: "Home", href: "/" },
            { name: "Music", href: "/#music" },
            { name: "Stream", href: "/#stream" },
            { name: "Schedule", href: "/#schedule" },
            { name: "Events", href: "/events" },
        ],
    },
    {
        title: "Get Involved",
        links: [
            { name: "BonnetSubmit", href: "/submit" },
            { name: "Join the Gang", href: "/join" },
            { name: "Collaborate", href: "/collab" },
            { name: "BandLab University", href: "/university" },
        ],
    },
    {
        title: "Connect",
        links: [
            { name: "Twitch", href: SOCIALS.twitch },
            { name: "YouTube", href: SOCIALS.youtube },
            { name: "BandLab", href: SOCIALS.bandlab },
            { name: "Discord", href: SOCIALS.discord },
        ],
    },
];

export type Tier = {
    id: "squad" | "supporter" | "vip";
    name: string;
    /** Display price; Discord Server Subscriptions are configured inside Discord. */
    price: string;
    period: string;
    tagline: string;
    /** Discord role this tier maps to (configure in your Discord server). */
    discordRole: string;
    perks: string[];
    /** BonnetSubmit priority weight — higher jumps the live queue. */
    submitPriority: number;
    highlight?: boolean;
    badge?: string;
    accent: "zinc" | "purple" | "gold";
    cta: string;
};

// Discord Server Subscription tiers. Prices are illustrative — the real
// checkout happens inside Discord. Update names/perks/prices freely.
export const TIERS: Tier[] = [
    {
        id: "squad",
        name: "The Squad",
        price: "Free",
        period: "",
        tagline: "Roll with the movement.",
        discordRole: "@Squad",
        perks: [
            "Access to the community Discord",
            "Live stream alerts & event pings",
            "Submit a track in BonnetSubmit each round",
            "Vibe in the chat during streams",
        ],
        submitPriority: 0,
        accent: "zinc",
        cta: "Join free",
    },
    {
        id: "supporter",
        name: "Inner Circle",
        price: "$4.99",
        period: "/mo",
        tagline: "Skip the line, get heard first.",
        discordRole: "@Inner Circle",
        perks: [
            "Everything in The Squad",
            "Priority placement in the BonnetSubmit queue",
            "Supporter role + colored name in Discord",
            "Behind-the-scenes drops & early track previews",
            "Monthly shout-out on stream",
        ],
        submitPriority: 10,
        highlight: true,
        badge: "Most popular",
        accent: "purple",
        cta: "Become a Supporter",
    },
    {
        id: "vip",
        name: "Bonnet Gang",
        price: "$14.99",
        period: "/mo",
        tagline: "All-access. First in line. Always.",
        discordRole: "@Bonnet Gang",
        perks: [
            "Everything in Inner Circle",
            "Top priority — your track plays first",
            "Guaranteed feedback on every submission",
            "Private VIP channel + monthly hangout",
            "Eligible for collab & feature spotlights",
            "Exclusive Bonnet Gang drops",
        ],
        submitPriority: 100,
        badge: "VIP",
        accent: "gold",
        cta: "Go all-access",
    },
];

export type CollabType = {
    id: string;
    label: string;
    description: string;
    icon: string; // lucide icon name
};

export const COLLAB_TYPES: CollabType[] = [
    { id: "feature", label: "Feature / Verse", description: "Get Kye on your track or vice-versa.", icon: "Mic2" },
    { id: "production", label: "Beat / Production", description: "Custom beats, co-production, sound design.", icon: "Music4" },
    { id: "brand", label: "Brand / Sponsor", description: "Partnerships, promos, sponsored streams.", icon: "Briefcase" },
    { id: "booking", label: "Booking / Event", description: "Live shows, hosting, appearances.", icon: "CalendarDays" },
    { id: "remix", label: "Remix / Flip", description: "Official remixes and creative flips.", icon: "Repeat" },
    { id: "other", label: "Something else", description: "Pitch your idea — we're open.", icon: "Sparkles" },
];

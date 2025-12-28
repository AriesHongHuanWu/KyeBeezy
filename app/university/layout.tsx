import { UniversityNav } from "@/components/university/UniversityNav";
import { ThemeProvider } from "@/components/theme-provider";

export default function UniversityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-blue-500/30">
            <UniversityNav />
            <main className="pt-24 pb-20">
                {children}
            </main>
        </div>
    );
}

import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";
import { getCurrentProfile } from "@/lib/current-user";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "downfor — find people for what you're doing",
  description: "Post what you're doing. See who's down.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentProfile();

  return (
    <html lang="en" className={`${fraunces.variable} ${ibmPlexSans.variable} h-full`}>
      <body className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.10),transparent_30%),linear-gradient(180deg,#fbfbff_0%,#f7f7fb_45%,#ffffff_100%)] text-gray-900 antialiased">
        <AppProviders initialUser={user}>{children}</AppProviders>
      </body>
    </html>
  );
}

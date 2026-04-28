import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";
import { getCurrentProfile } from "@/lib/current-user";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "downfor — find people for what you're doing",
  description: "Post what you're doing. See who's down.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentProfile();

  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        <AppProviders initialUser={user}>{children}</AppProviders>
      </body>
    </html>
  );
}

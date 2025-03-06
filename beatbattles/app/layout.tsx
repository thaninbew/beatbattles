import type { Metadata } from "next";
import Navigation from "@/components/layout/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "BeatBattles",
  description: "A multiplayer music game where players create and vote on 8-bar song snippets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
      >
        <Navigation />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}

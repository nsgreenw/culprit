import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { Nav } from "@/components/nav";
import { DisclaimerGate } from "@/components/disclaimer";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

const body = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Culprit · Find the food behind your symptoms",
  description:
    "Log food and symptoms, see which food compounds come before your symptoms, and test suspects with an elimination experiment.",
  appleWebApp: { capable: true, title: "Culprit", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f2ea" },
    { media: "(prefers-color-scheme: dark)", color: "#161513" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Nav />
        <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 sm:pb-16">
          {children}
        </main>
        <DisclaimerGate />
      </body>
    </html>
  );
}

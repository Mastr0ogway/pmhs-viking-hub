import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pmhs-viking-hub.vercel.app"),
  title: "PMHS Student & Family Navigation Hub · Viking Hub",
  description:
    "Pittsford Mendon High School Student & Family Navigation Hub — Search 58+ clubs & activities, AP & accelerated academic pathways, and interactive step-by-step student action guides.",
  openGraph: {
    title: "PMHS Viking Hub · Student & Family Navigation Hub",
    description:
      "Find Pittsford Mendon clubs and faculty advisors, map out AP, Honors, and accelerated coursework, and follow interactive checklists for working papers, community service, and transcripts.",
    siteName: "PMHS Viking Hub",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PMHS Viking Hub · Student & Family Navigation Hub",
    description:
      "Find Pittsford Mendon clubs and advisors, AP & accelerated academic pathways, and interactive step-by-step student action guides.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-slate-900">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Course Companion FTE – Generative AI Fundamentals",
  description: "Master Generative AI fundamentals with your personal Claude-powered AI tutor.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#030712] text-gray-100 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

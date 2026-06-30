import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/layout/CookieBanner";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pranexa Studio - Yoga Academy, Retreats & Studio with Ira Trivedi",
  description: "Certified yoga teacher training, retreats in exquisite locations, state-of-the-art Mumbai studio, and pre-recorded classes with Ira Trivedi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-light font-sans">
        <Header />
        <main className="flex-grow flex flex-col w-full">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Projecture — See Beyond the Listing",
  description:
    "Projecture shows you what a home could become — with real costs, real timelines, and the team to make it happen. Launching in Newton, MA.",
  openGraph: {
    title: "Projecture — See Beyond the Listing",
    description:
      "We show you what it could be. Then we build it. Future-state property marketplace launching in Newton, MA.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${inter.variable} antialiased`}>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

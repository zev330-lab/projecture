import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Projecture — Fully Renovated Homes in Newton",
  description:
    "Browse fully renovated homes in Newton, MA. Designed, built, and delivered by Steinmetz Real Estate and Bay State Remodeling.",
  openGraph: {
    title: "Projecture — Fully Renovated Homes in Newton",
    description:
      "Move-in ready homes in Newton's best neighborhoods. We handle the renovation — you get the keys.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} antialiased`}>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}

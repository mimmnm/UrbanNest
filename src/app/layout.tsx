import type { Metadata } from "next";
import { Jost, Quicksand, Schoolbell } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jost",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

const schoolbell = Schoolbell({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-schoolbell",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UrbanNest — Premium Beauty & Fashion",
  description: "Curated beauty, skincare, and fashion essentials for the modern woman.",
  keywords: ["beauty", "skincare", "makeup", "fashion", "cosmetics", "luxury", "bangladesh"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jost.variable} ${quicksand.variable} ${schoolbell.variable}`}>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

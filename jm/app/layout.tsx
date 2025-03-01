import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Major_Mono_Display, Orbitron } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const majorMono = Major_Mono_Display({
  weight: "400",
  variable: "--font-major-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  weight: ["400", "500"],
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Juice Me",
  description: "Your gateway to paradise",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${majorMono.variable} ${orbitron.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

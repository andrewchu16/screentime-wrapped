import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";

// Load Inter font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Screen Time Wrapped",
  description: "Discover insights about your screen usage habits in a Spotify Wrapped-like presentation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body 
        className="antialiased min-h-screen bg-background font-sans" 
        suppressHydrationWarning
        data-suppress-hydration-warning={true}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

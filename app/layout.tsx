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
  title: "Keyboard Configurator",
  description:
    "A web-based keyboard configurator built with Next.js and Three.js.",
  openGraph: {
    title: "Keyboard Configurator",
    description:
      "A web-based keyboard configurator built with Next.js and Three.js.",
    type: "website",
    images: [{ url: "/preview.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/preview.webp"],
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

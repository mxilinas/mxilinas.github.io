import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto, Noto_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    weight: "300",
    subsets: ["latin"],
});

const notoSans = Noto_Sans({
    variable: "--font-noto-sans",
    weight: "300",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    weight: "300",
    subsets: ["latin"],
});

const roboto = Roboto({
    variable: "--font-roboto",
    weight: "300",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Michael Xilinas",
    description: "My portfolio website",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${notoSans.variable} ${roboto.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "YtVid — YouTube Video Downloader",
  description: "Download YouTube videos and audio in high quality. Free and open-source YouTube downloader powered by yt-dlp.",
  keywords: "YouTube downloader, video downloader, yt-dlp, mp4, mp3, audio downloader",
  openGraph: {
    title: "YtVid — YouTube Video Downloader",
    description: "Download YouTube videos and audio in high quality using yt-dlp.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
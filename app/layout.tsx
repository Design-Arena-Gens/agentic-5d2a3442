import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video Sentiment Cutter",
  description: "Cut videos based on sentiment analysis using n8n",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

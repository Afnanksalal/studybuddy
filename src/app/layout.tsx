import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyBuddy",
  description: "Your AI-powered Study Companion",
  manifest: "/manifest.json",
  metadataBase: new URL("https://studybuddy-ai.vercel.app/"),
  openGraph: {
    type: "website",
    url: "https://studybuddy-ai.vercel.app/",
    title: "StudyBuddy AI",
    description: "Your AI-powered Study Companion",
    images: [
      {
        url: "/android-chrome-192x192.png",
        width: 192,
        height: 192,
        alt: "StudyBuddy AI",
      },
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "StudyBuddy AI",
      },
    ],
  },
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};
export const viewport: Viewport = {
  themeColor: "#5261ea",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
    <body>
    {children}
    </body>
    </html>
  );
}

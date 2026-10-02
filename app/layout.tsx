import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { getContent } from "./sanity/content";
import { siteUrl } from "./site";
import "./globals.css";

const garamond = localFont({
  src: [
    {
      path: "./fonts/EBGaramond-VariableFont_wght.ttf",
      weight: "400 800",
      style: "normal",
    },
    {
      path: "./fonts/EBGaramond-Italic-VariableFont_wght.ttf",
      weight: "400 800",
      style: "italic",
    },
  ],
  variable: "--font-garamond",
});

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getContent();

  return {
    metadataBase: new URL(siteUrl),
    title: settings.seoTitle,
    description: settings.seoDescription,
    applicationName: settings.name,
    authors: [{ name: settings.name, url: siteUrl }],
    creator: settings.name,
    publisher: settings.studioName ?? settings.name,
    alternates: { canonical: "/" },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      url: "/",
      siteName: settings.name,
      title: settings.seoTitle,
      description: settings.seoDescription,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seoTitle,
      description: settings.seoDescription,
    },
    formatDetection: { telephone: false, address: false, email: false },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${garamond.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "Emma Galwas",
  description:
    "A creative practice working globally across art direction and digital projects.",
};

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

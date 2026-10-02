import type { MetadataRoute } from "next";
import { getContent } from "./sanity/content";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { settings } = await getContent();

  return {
    name: settings.name,
    short_name: settings.name,
    description: settings.tagline,
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

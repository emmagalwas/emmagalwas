import { createClient } from "@sanity/client";

export const sanityConfig = {
  projectId: "zp5pg0oe",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
};

export const client = createClient({
  ...sanityConfig,
  apiVersion: "2025-02-19",
  useCdn: true,
  perspective: "published",
});

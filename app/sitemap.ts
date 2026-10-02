import type { MetadataRoute } from "next";
import { projects } from "./projects";
import { site } from "./site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      changeFrequency: "monthly",
      priority: 1,
      images: projects.flatMap((project) =>
        project.images.map((image) => `${site.url}${image.src}`),
      ),
    },
  ];
}

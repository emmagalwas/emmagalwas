import type { MetadataRoute } from "next";
import { getContent } from "./sanity/content";
import { siteUrl } from "./site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getContent();

  return [
    {
      url: siteUrl,
      changeFrequency: "monthly",
      priority: 1,
      images: projects.flatMap((project) =>
        project.media.flatMap((item) =>
          item.kind === "image" ? [item.src] : item.poster ? [item.poster] : [],
        ),
      ),
      videos: projects.flatMap((project) =>
        project.media.flatMap((item) =>
          item.kind === "video" && item.poster
            ? [
                {
                  title: `${project.title} — ${item.alt}`,
                  description: `${project.title} — ${project.role}`,
                  thumbnail_loc: item.poster,
                  content_loc: item.src,
                  publication_date: item.uploadDate,
                },
              ]
            : [],
        ),
      ),
    },
  ];
}

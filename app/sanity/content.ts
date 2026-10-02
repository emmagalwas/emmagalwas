import { cache } from "react";
import { connection } from "next/server";
import { createImageUrlBuilder } from "@sanity/image-url";
import { client, sanityConfig } from "./client";

type ImageCrop = { top: number; bottom: number; left: number; right: number };

type SanityImage = {
  _type: "image";
  _key: string;
  alt?: string;
  crop?: ImageCrop;
  hotspot?: { x: number; y: number; width: number; height: number };
  asset: {
    _id: string;
    url: string;
    metadata: { lqip?: string; dimensions: { width: number; height: number } };
  };
};

type SanityVideo = {
  _type: "video";
  _key: string;
  alt?: string;
  width?: number;
  height?: number;
  file: { url: string; _createdAt: string };
  poster?: Omit<SanityImage, "_type" | "_key" | "alt"> | null;
};

type SanityProject = {
  _id: string;
  title: string;
  role: string;
  media: (SanityImage | SanityVideo)[] | null;
};

type SanitySettings = {
  name?: string;
  tagline?: string;
  clients?: string[];
  studioAddress?: string;
  studioAddressUrl?: string;
  email?: string;
  emailLabel?: string;
  instagram?: string;
  seoTitle?: string;
  seoDescription?: string;
  studioName?: string;
  jobTitle?: string;
};

export type ProjectImage = {
  kind: "image";
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL?: string;
};

export type ProjectVideo = {
  kind: "video";
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  poster?: string;
  uploadDate: string;
};

export type ProjectMedia = ProjectImage | ProjectVideo;

export type Project = {
  id: string;
  slug: string;
  title: string;
  role: string;
  media: ProjectMedia[];
};

export type Settings = Required<
  Pick<SanitySettings, "name" | "tagline" | "seoTitle" | "seoDescription">
> &
  Omit<SanitySettings, "name" | "tagline" | "seoTitle" | "seoDescription"> & {
    clients: string[];
  };

const contentQuery = `{
  "settings": *[_id == "siteSettings"][0]{
    name, tagline, clients, studioAddress, studioAddressUrl, email, emailLabel,
    instagram, seoTitle, seoDescription, studioName, jobTitle
  },
  "projects": *[_type == "project" && count(media) > 0] | order(orderRank asc){
    _id, title, role,
    media[(_type == "image" && defined(asset)) || (_type == "video" && defined(file.asset))]{
      _type, _key, alt,
      _type == "image" => {
        crop, hotspot,
        asset->{_id, url, metadata{lqip, dimensions{width, height}}}
      },
      _type == "video" => {
        width, height,
        "file": file.asset->{url, _createdAt},
        poster{crop, hotspot, asset->{_id, url, metadata{lqip, dimensions{width, height}}}}
      }
    }
  }
}`;

const imageBuilder = createImageUrlBuilder(sanityConfig);

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const fallbackVideoSize = { width: 1920, height: 1080 };

function croppedSize(image: Pick<SanityImage, "asset" | "crop">) {
  const { width, height } = image.asset.metadata.dimensions;
  const crop = image.crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
  return {
    width: Math.round(width * (1 - crop.left - crop.right)),
    height: Math.round(height * (1 - crop.top - crop.bottom)),
  };
}

function toProjectImage(image: SanityImage, fallbackAlt: string): ProjectImage {
  return {
    kind: "image",
    key: image._key,
    src: imageBuilder.image(image).url(),
    alt: image.alt?.trim() || fallbackAlt,
    blurDataURL: image.asset.metadata.lqip,
    ...croppedSize(image),
  };
}

function toProjectVideo(video: SanityVideo, fallbackAlt: string): ProjectVideo {
  const poster = video.poster?.asset ? video.poster : null;
  const size =
    video.width && video.height
      ? { width: video.width, height: video.height }
      : poster
        ? croppedSize(poster)
        : fallbackVideoSize;

  return {
    kind: "video",
    key: video._key,
    src: video.file.url,
    alt: video.alt?.trim() || fallbackAlt,
    poster: poster ? imageBuilder.image(poster).width(1600).fit("max").auto("format").url() : undefined,
    uploadDate: video.file._createdAt,
    ...size,
  };
}

function toProjectMedia(item: SanityImage | SanityVideo, fallbackAlt: string): ProjectMedia {
  return item._type === "video"
    ? toProjectVideo(item, fallbackAlt)
    : toProjectImage(item, fallbackAlt);
}

function uniqueSlugs(projects: SanityProject[]) {
  const seen = new Map<string, number>();
  return projects.map((project) => {
    const base = slugify(project.title) || "project";
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  });
}

const defaultSettings: Settings = {
  name: "Emma Galwas",
  tagline: "A creative practice working globally across art direction and digital projects.",
  seoTitle: "Emma Galwas — Art Direction",
  seoDescription:
    "A creative practice working globally across art direction and digital projects.",
  clients: [],
};

export const getContent = cache(async () => {
  await connection();
  const { settings, projects } = await client.fetch<{
    settings: SanitySettings | null;
    projects: SanityProject[];
  }>(contentQuery);

  const slugs = uniqueSlugs(projects);

  return {
    settings: {
      ...defaultSettings,
      ...Object.fromEntries(Object.entries(settings ?? {}).filter(([, value]) => value != null)),
    } as Settings,
    projects: projects.map<Project>((project, index) => ({
      id: project._id,
      slug: slugs[index],
      title: project.title,
      role: project.role,
      media: (project.media ?? []).map((item) => toProjectMedia(item, project.title)),
    })),
  };
});

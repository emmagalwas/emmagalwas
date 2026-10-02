import Image from "next/image";
import type { CSSProperties } from "react";
import {
  getContent,
  type Project,
  type ProjectMedia,
  type ProjectVideo,
  type Settings,
} from "./sanity/content";
import { ProjectSlideshow } from "./project-slideshow";
import { SiteHeader } from "./site-header";
import { siteUrl } from "./site";

const itemsPerPage = 3;

type ProjectPage = {
  slug: string;
  label: string;
  items: ProjectMedia[];
  style: CSSProperties;
  divisor: number;
};

function ratioOf(item: ProjectMedia) {
  return item.width / item.height;
}

function chunk<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  );
}

function projectPages(project: Project): ProjectPage[] {
  const groups = chunk(project.media, itemsPerPage);
  const widest = groups
    .map((items) => ({
      divisor: items.reduce((sum, item) => sum + ratioOf(item), 0),
      gaps: items.length - 1,
    }))
    .reduce((best, group) => (group.divisor > best.divisor ? group : best));

  return groups.map((items, index) => ({
    slug: index === 0 ? project.slug : `${project.slug}/${index + 1}`,
    label: groups.length > 1 ? `${project.title}, ${index + 1} of ${groups.length}` : project.title,
    items,
    divisor: widest.divisor,
    style: { "--ratio": widest.divisor, "--gaps": widest.gaps } as CSSProperties,
  }));
}

function mediaSizes(page: ProjectPage, item: ProjectMedia) {
  return `${Math.ceil((ratioOf(item) / page.divisor) * 92)}vw`;
}

function ProjectVideoItem({ video, isFirst }: { video: ProjectVideo; isFirst: boolean }) {
  return (
    <video
      className="project-image"
      src={video.src}
      poster={video.poster}
      width={video.width}
      height={video.height}
      style={{ aspectRatio: `${video.width} / ${video.height}` }}
      aria-label={video.alt}
      autoPlay
      muted
      loop
      playsInline
      preload={isFirst ? "auto" : "metadata"}
      disablePictureInPicture
      disableRemotePlayback
    />
  );
}

function ProjectSlide({
  project,
  page,
  isFirst,
}: {
  project: Project;
  page: ProjectPage;
  isFirst: boolean;
}) {
  return (
    <section className="project">
      <div className="project-row" style={page.style}>
        {page.items.map((item) =>
          item.kind === "video" ? (
            <ProjectVideoItem key={item.key} video={item} isFirst={isFirst} />
          ) : (
            <Image
              key={item.key}
              className="project-image"
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes={mediaSizes(page, item)}
              placeholder={item.blurDataURL ? "blur" : "empty"}
              blurDataURL={item.blurDataURL}
              loading={isFirst ? "eager" : "lazy"}
              fetchPriority={isFirst ? "high" : "auto"}
              draggable={false}
            />
          ),
        )}
      </div>
      <h2 className="caption">
        {project.title} — {project.role}
      </h2>
    </section>
  );
}

function structuredData(settings: Settings, projects: Project[]) {
  const personId = `${siteUrl}/#person`;
  const studioId = `${siteUrl}/#studio`;
  const websiteId = `${siteUrl}/#website`;
  const sameAs = settings.instagram ? [settings.instagram] : undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: settings.name,
        url: `${siteUrl}/`,
        jobTitle: settings.jobTitle,
        email: settings.email ? `mailto:${settings.email}` : undefined,
        worksFor: { "@id": studioId },
        sameAs,
      },
      {
        "@type": "ProfessionalService",
        "@id": studioId,
        name: settings.studioName ?? settings.name,
        url: `${siteUrl}/`,
        description: settings.tagline,
        email: settings.email,
        image: `${siteUrl}/opengraph-image.png`,
        founder: { "@id": personId },
        areaServed: "Worldwide",
        knowsAbout: ["Art direction", "Digital projects", "Still life", "Campaigns"],
        sameAs,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: settings.name,
        url: `${siteUrl}/`,
        description: settings.seoDescription,
        publisher: { "@id": studioId },
        inLanguage: "en",
      },
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/#work`,
        url: `${siteUrl}/`,
        name: settings.seoTitle,
        isPartOf: { "@id": websiteId },
        about: { "@id": personId },
        hasPart: projects.map((project) => ({
          "@type": "CreativeWork",
          "@id": `${siteUrl}/#${project.slug}`,
          name: project.title,
          description: `${project.title} — ${project.role}`,
          creator: { "@id": personId },
          image: project.media.flatMap((item) =>
            item.kind === "image"
              ? [
                  {
                    "@type": "ImageObject",
                    contentUrl: item.src,
                    width: item.width,
                    height: item.height,
                    caption: item.alt,
                  },
                ]
              : [],
          ),
          video: project.media.flatMap((item) =>
            item.kind === "video"
              ? [
                  {
                    "@type": "VideoObject",
                    name: item.alt,
                    description: `${project.title} — ${item.alt}`,
                    contentUrl: item.src,
                    thumbnailUrl: item.poster,
                    uploadDate: item.uploadDate,
                    width: item.width,
                    height: item.height,
                  },
                ]
              : [],
          ),
        })),
      },
    ],
  };
}

export default async function Home() {
  const { settings, projects } = await getContent();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData(settings, projects)).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader settings={settings} />
      <main id="top">
        <h1 className="visually-hidden">{settings.seoTitle}</h1>
        <ProjectSlideshow
          slides={projects.flatMap((project, projectIndex) =>
            projectPages(project).map((page, pageIndex) => ({
              slug: page.slug,
              title: page.label,
              content: (
                <ProjectSlide
                  project={project}
                  page={page}
                  isFirst={projectIndex === 0 && pageIndex === 0}
                />
              ),
            })),
          )}
        />
      </main>
    </>
  );
}

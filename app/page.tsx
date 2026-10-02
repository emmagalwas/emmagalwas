import Image from "next/image";
import type { CSSProperties } from "react";
import {
  getContent,
  type Project,
  type ProjectMedia,
  type ProjectVideo,
  type Settings,
} from "./sanity/content";
import { MediaRow } from "./media-row";
import { SiteHeader } from "./site-header";
import { siteUrl } from "./site";

const desktopColumns = 3;
const tabletPeek = 1.12;
const mobilePeek = 1.18;

function rowLayout(project: Project) {
  const ratios = project.media.map((item) => item.width / item.height);
  const widestRatio = Math.max(...ratios);
  const itemCount = project.media.length;
  const visibleOnDesktop = Math.min(itemCount, desktopColumns);
  const desktopDivisor = ratios
    .slice(0, visibleOnDesktop)
    .reduce((sum, ratio) => sum + ratio, 0);
  const tabletColumns = Math.min(itemCount, 2);
  const tabletDivisor =
    widestRatio * tabletColumns * (itemCount > tabletColumns ? tabletPeek : 1);
  const mobileDivisor = widestRatio * (itemCount > 1 ? mobilePeek : 1);

  return {
    desktopDivisor,
    desktopGaps: visibleOnDesktop - 1,
    scrollsOnDesktop: itemCount > desktopColumns,
    tabletColumns,
    tabletDivisor,
    mobileDivisor,
  };
}

function rowVariables(project: Project): CSSProperties {
  const layout = rowLayout(project);
  return {
    "--ratio-desktop": layout.desktopDivisor,
    "--gaps-desktop": layout.desktopGaps,
    "--ratio-tablet": layout.tabletDivisor,
    "--gaps-tablet": layout.tabletColumns - 1,
    "--ratio-mobile": layout.mobileDivisor,
  } as CSSProperties;
}

function mediaSizes(project: Project, item: ProjectMedia) {
  const layout = rowLayout(project);
  const ratio = item.width / item.height;
  const share = (divisor: number, viewportShare: number) =>
    `${Math.ceil((ratio / divisor) * viewportShare)}vw`;

  return [
    `(min-width: 1024px) ${share(layout.desktopDivisor, 83)}`,
    `(min-width: 640px) ${share(layout.tabletDivisor, 83)}`,
    share(layout.mobileDivisor, 95),
  ].join(", ");
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

function ProjectSlide({ project, index }: { project: Project; index: number }) {
  const isFirst = index === 0;

  return (
    <section id={project.slug} className="project" aria-label={project.title}>
      <MediaRow
        style={rowVariables(project)}
        scrollsOnDesktop={rowLayout(project).scrollsOnDesktop}
        label={`${project.title} media`}
        focusable={project.media.length > 1}
      >
        {project.media.map((item) =>
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
              sizes={mediaSizes(project, item)}
              placeholder={item.blurDataURL ? "blur" : "empty"}
              blurDataURL={item.blurDataURL}
              loading={isFirst ? "eager" : "lazy"}
              fetchPriority={isFirst ? "high" : "auto"}
              draggable={false}
            />
          ),
        )}
      </MediaRow>
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
        {projects.map((project, index) => (
          <ProjectSlide key={project.id} project={project} index={index} />
        ))}
      </main>
    </>
  );
}

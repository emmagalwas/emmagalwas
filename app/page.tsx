import Image from "next/image";
import type { CSSProperties } from "react";
import { projects, type Project, type ProjectImage } from "./projects";
import { SiteHeader } from "./site-header";
import { site } from "./site";

const tabletPeek = 1.12;
const mobilePeek = 1.18;

function rowLayout(project: Project) {
  const ratios = project.images.map((image) => image.width / image.height);
  const ratioSum = ratios.reduce((sum, ratio) => sum + ratio, 0);
  const widestRatio = Math.max(...ratios);
  const imageCount = project.images.length;
  const tabletColumns = Math.min(imageCount, 2);
  const tabletDivisor =
    widestRatio * tabletColumns * (imageCount > tabletColumns ? tabletPeek : 1);
  const mobileDivisor = widestRatio * (imageCount > 1 ? mobilePeek : 1);

  return { ratioSum, tabletColumns, tabletDivisor, mobileDivisor };
}

function rowVariables(project: Project): CSSProperties {
  const layout = rowLayout(project);
  return {
    "--ratio-sum": layout.ratioSum,
    "--gaps": project.images.length - 1,
    "--ratio-tablet": layout.tabletDivisor,
    "--gaps-tablet": layout.tabletColumns - 1,
    "--ratio-mobile": layout.mobileDivisor,
  } as CSSProperties;
}

function imageSizes(project: Project, image: ProjectImage) {
  const layout = rowLayout(project);
  const ratio = image.width / image.height;
  const share = (divisor: number, viewportShare: number) =>
    `${Math.ceil((ratio / divisor) * viewportShare)}vw`;

  return [
    `(min-width: 1024px) ${share(layout.ratioSum, 83)}`,
    `(min-width: 640px) ${share(layout.tabletDivisor, 83)}`,
    share(layout.mobileDivisor, 95),
  ].join(", ");
}

function ProjectSlide({ project, index }: { project: Project; index: number }) {
  const isFirst = index === 0;

  return (
    <section id={project.slug} className="project" aria-label={project.title}>
      <div
        className="project-row"
        style={rowVariables(project)}
        role="region"
        aria-label={`${project.title} images`}
        tabIndex={project.images.length > 1 ? 0 : undefined}
      >
        {project.images.map((image) => (
          <Image
            key={image.src}
            className="project-image"
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={imageSizes(project, image)}
            loading={isFirst ? "eager" : "lazy"}
            fetchPriority={isFirst ? "high" : "auto"}
            draggable={false}
          />
        ))}
      </div>
      <h2 className="caption">
        {project.title} — {project.role}
      </h2>
    </section>
  );
}

function structuredData() {
  const personId = `${site.url}/#person`;
  const studioId = `${site.url}/#studio`;
  const websiteId = `${site.url}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: site.name,
        url: `${site.url}/`,
        jobTitle: "Art Director",
        email: `mailto:${site.email}`,
        worksFor: { "@id": studioId },
        sameAs: [site.instagram],
      },
      {
        "@type": "ProfessionalService",
        "@id": studioId,
        name: site.studioName,
        url: `${site.url}/`,
        description: site.tagline,
        email: site.email,
        image: `${site.url}/opengraph-image.png`,
        founder: { "@id": personId },
        areaServed: "Worldwide",
        knowsAbout: ["Art direction", "Digital projects", "Still life", "Campaigns"],
        sameAs: [site.instagram],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: site.name,
        url: `${site.url}/`,
        description: site.description,
        publisher: { "@id": studioId },
        inLanguage: "en",
      },
      {
        "@type": "CollectionPage",
        "@id": `${site.url}/#work`,
        url: `${site.url}/`,
        name: site.title,
        isPartOf: { "@id": websiteId },
        about: { "@id": personId },
        hasPart: projects.map((project) => ({
          "@type": "CreativeWork",
          "@id": `${site.url}/#${project.slug}`,
          name: project.title,
          description: `${project.title} — ${project.role}`,
          creator: { "@id": personId },
          image: project.images.map((image) => ({
            "@type": "ImageObject",
            contentUrl: `${site.url}${image.src}`,
            width: image.width,
            height: image.height,
            caption: image.alt,
          })),
        })),
      },
    ],
  };
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />
      <main id="top">
        <h1 className="visually-hidden">{site.title}</h1>
        {projects.map((project, index) => (
          <ProjectSlide key={project.slug} project={project} index={index} />
        ))}
      </main>
    </>
  );
}

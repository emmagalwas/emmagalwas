import Image from "next/image";
import type { CSSProperties } from "react";
import { projects, type Project, type ProjectImage } from "./projects";
import { SiteHeader } from "./site-header";

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
      <p className="caption">
        {project.title} — {project.role}
      </p>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <h1 className="visually-hidden">Emma Galwas — Art Direction</h1>
        {projects.map((project, index) => (
          <ProjectSlide key={project.slug} project={project} index={index} />
        ))}
      </main>
    </>
  );
}

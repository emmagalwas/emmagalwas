"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useMountEffect } from "./hooks/useMountEffect";

type Slide = { slug: string; title: string; content: ReactNode };
type Direction = "previous" | "next";

function syncVideos(slides: HTMLElement[], activeIndex: number) {
  slides.forEach((slide, index) =>
    slide.querySelectorAll("video").forEach((video) => {
      if (index === activeIndex) video.play().catch(() => undefined);
      else video.pause();
    }),
  );
}

function indexFromHash(slides: Slide[]) {
  const slug = decodeURIComponent(window.location.hash.slice(1));
  return Math.max(
    0,
    slides.findIndex((slide) => slide.slug === slug),
  );
}

export function ProjectSlideshow({ slides }: { slides: Slide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);

  function slideElements() {
    return Array.from(stage.current?.querySelectorAll<HTMLElement>(":scope > .slide") ?? []);
  }

  function show(index: number, updateHash: boolean) {
    const next = (index + slides.length) % slides.length;
    activeRef.current = next;
    setActiveIndex(next);
    syncVideos(slideElements(), next);
    if (updateHash) window.history.replaceState(null, "", `#${slides[next].slug}`);
  }

  function go(direction: Direction) {
    show(activeRef.current + (direction === "next" ? 1 : -1), true);
  }

  useMountEffect(() => {
    const syncFromHash = () => show(indexFromHash(slides), false);
    const handleKey = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey) return;
      if (event.key === "ArrowRight") go("next");
      if (event.key === "ArrowLeft") go("previous");
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("keydown", handleKey);
    };
  });

  function directionAt(event: MouseEvent<HTMLElement>): Direction {
    const box = event.currentTarget.getBoundingClientRect();
    return event.clientX < box.left + box.width / 2 ? "previous" : "next";
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as Element).closest("a, button")) return;
    go(directionAt(event));
  }

  return (
    <div
      ref={stage}
      className="slideshow"
      aria-roledescription="carousel"
      onClick={handleClick}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={slide.slug}
            className="slide"
            data-active={isActive ? "" : undefined}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
            aria-hidden={!isActive}
            inert={!isActive}
          >
            {slide.content}
          </div>
        );
      })}
      <button
        type="button"
        className="slideshow-button visually-hidden-focusable"
        data-direction="previous"
        onClick={() => go("previous")}
      >
        Previous project
      </button>
      <button
        type="button"
        className="slideshow-button visually-hidden-focusable"
        data-direction="next"
        onClick={() => go("next")}
      >
        Next project
      </button>
    </div>
  );
}

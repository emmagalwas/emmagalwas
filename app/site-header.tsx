"use client";

import { site } from "./site";

function syncHeaderHeight(header: HTMLElement | null) {
  if (!header) return;
  const root = document.documentElement;
  const observer = new ResizeObserver(([entry]) => {
    const height = entry.borderBoxSize?.[0]?.blockSize ?? header.offsetHeight;
    root.style.setProperty("--header-measured", `${height}px`);
  });
  observer.observe(header);
  return () => {
    observer.disconnect();
    root.style.removeProperty("--header-measured");
  };
}

export function SiteHeader() {
  return (
    <header className="site-header" ref={syncHeaderHeight}>
      <p className="wordmark">
        <a href="#top">
          <span>emma</span>
          <span>galwas</span>
        </a>
      </p>
      <div className="studio-info">
        <p>{site.tagline}</p>
        <p>Clients {site.clients.join(", ")}.</p>
        <p>
          Studio Address —{" "}
          <a href={`mailto:${site.email}`}>
            OFFICE@emmagalwasSTUDIO.com
          </a>{" "}
          —{" "}
          <a
            href={site.instagram}
            target="_blank"
            rel="noreferrer me"
          >
            Instagram
          </a>
        </p>
      </div>
    </header>
  );
}

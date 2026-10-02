"use client";

const clients = [
  "Aēsop",
  "Chanel",
  "Chloé",
  "Georg Jensen",
  "Loewe",
  "Louis Vuitton",
  "Prada",
  "Nanushka",
  "One&Only Hotels",
  "Tekla",
];

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
        <p>
          A creative practice working globally across art direction and
          digital projects.
        </p>
        <p>Clients {clients.join(", ")}.</p>
        <p>
          Studio Address —{" "}
          <a href="mailto:office@emmagalwasstudio.com">
            OFFICE@emmagalwasSTUDIO.com
          </a>{" "}
          —{" "}
          <a
            href="https://www.instagram.com/emmagalwas"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
        </p>
      </div>
    </header>
  );
}

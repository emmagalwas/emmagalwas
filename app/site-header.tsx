"use client";

import Image from "next/image";
import type { Settings } from "./sanity/content";

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

function ContactLine({ settings }: { settings: Settings }) {
  const parts = [
    settings.studioAddress &&
      (settings.studioAddressUrl ? (
        <a key="address" href={settings.studioAddressUrl} target="_blank" rel="noreferrer">
          {settings.studioAddress}
        </a>
      ) : (
        <span key="address">{settings.studioAddress}</span>
      )),
    settings.email && (
      <a key="email" href={`mailto:${settings.email}`}>
        {settings.emailLabel || settings.email}
      </a>
    ),
    settings.instagram && (
      <a key="instagram" href={settings.instagram} target="_blank" rel="noreferrer me">
        Instagram
      </a>
    ),
  ].filter(Boolean);

  if (!parts.length) return null;

  return (
    <p>
      {parts.flatMap((part, index) => (index === 0 ? [part] : [" — ", part]))}
    </p>
  );
}

export function SiteHeader({ settings }: { settings: Settings }) {
  return (
    <header className="site-header" ref={syncHeaderHeight}>
      <p className="wordmark">
        <a href="#top">
          <Image
            src="/logo.svg"
            alt={settings.name}
            width={1189}
            height={208}
            unoptimized
            loading="eager"
            fetchPriority="high"
          />
        </a>
      </p>
      <div className="studio-info">
        <p>{settings.tagline}</p>
        {settings.clients.length > 0 && <p>Clients {settings.clients.join(", ")}.</p>}
        <ContactLine settings={settings} />
      </div>
    </header>
  );
}

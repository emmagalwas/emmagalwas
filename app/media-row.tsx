"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";

type MediaRowProps = {
  children: ReactNode;
  style: CSSProperties;
  scrollsOnDesktop: boolean;
  label: string;
  focusable: boolean;
};

function revealClickedItem(event: MouseEvent<HTMLDivElement>) {
  const row = event.currentTarget;
  const item = (event.target as Element).closest(".project-image");
  if (!item || row.scrollWidth <= row.clientWidth) return;

  const rowBox = row.getBoundingClientRect();
  const itemBox = item.getBoundingClientRect();
  const padding = parseFloat(getComputedStyle(row).paddingInlineStart) || 0;
  const hiddenLeft = itemBox.left < rowBox.left + padding - 1;
  const hiddenRight = itemBox.right > rowBox.right - padding + 1;
  if (!hiddenLeft && !hiddenRight) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  item.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "nearest",
    inline: hiddenLeft ? "start" : "end",
  });
}

export function MediaRow({ children, style, scrollsOnDesktop, label, focusable }: MediaRowProps) {
  return (
    <div
      className="project-row"
      style={style}
      data-scroll={scrollsOnDesktop ? "" : undefined}
      role="region"
      aria-label={label}
      tabIndex={focusable ? 0 : undefined}
      onClick={revealClickedItem}
    >
      {children}
    </div>
  );
}

import React from "react";

/** Teal wordmark color matching the Helio RCM brand on light backgrounds. */
export const HELIO_WORDMARK_TEAL = "#3dbaa8";

const LOGO_VIEWBOX = { width: 229, height: 68, markWidth: 68 };

const parseTailwindHeightPx = (className = "") => {
  const arbitrary = className.match(/h-\[(\d+(?:\.\d+)?)px\]/);
  if (arbitrary) return Number(arbitrary[1]);

  const scale = className.match(/\bh-(\d+(?:\.\d+)?)\b/);
  if (scale) return Number(scale[1]) * 4;

  return 36;
};

const LogoWordmark = ({ variant, markHeightPx, className = "" }) => {
  const src = variant === "onLight" ? "/helio-logo.svg" : "/helio-logo-white.svg";
  const scaledWidth = markHeightPx * (LOGO_VIEWBOX.width / LOGO_VIEWBOX.height);
  const wordmarkWidth =
    markHeightPx * ((LOGO_VIEWBOX.width - LOGO_VIEWBOX.markWidth) / LOGO_VIEWBOX.height);

  return (
    <div
      className={`overflow-hidden shrink-0 ${className}`}
      style={{ height: markHeightPx, width: wordmarkWidth }}
      aria-hidden
    >
      <img
        src={src}
        alt=""
        className="max-w-none select-none"
        style={{
          height: markHeightPx,
          width: scaledWidth,
          marginLeft: -markHeightPx,
        }}
        loading="lazy"
        draggable={false}
      />
    </div>
  );
};

const SIZE_MARK = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
  sidebar: "h-12 w-12",
  xl: "h-16 w-16",
};

/**
 * Helio RCM brand lockup: colorful mark + original HELIO / RCM wordmark from helio-logo.svg.
 * Use variant="onDark" for white wordmark; variant="onLight" for brand teal wordmark.
 */
export default function HelioBrand({
  variant = "onDark",
  showWordmark = true,
  size = "md",
  markSize,
  className = "",
  markClassName = "",
  wordmarkClassName = "",
  alt = "Helio RCM",
}) {
  const resolvedMarkSize = markSize || SIZE_MARK[size] || SIZE_MARK.md;
  const markHeightPx = parseTailwindHeightPx(resolvedMarkSize);

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} aria-label={alt}>
      <img
        src="/favicon.png"
        alt=""
        aria-hidden
        className={`shrink-0 object-contain ${resolvedMarkSize} ${markClassName}`}
        loading="lazy"
        draggable={false}
      />
      {showWordmark ? (
        <LogoWordmark
          variant={variant}
          markHeightPx={markHeightPx}
          className={wordmarkClassName}
        />
      ) : null}
    </div>
  );
}

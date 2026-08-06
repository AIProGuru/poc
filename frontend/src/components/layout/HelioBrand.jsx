import React from "react";

/** Teal wordmark color matching the Helio RCM brand on light backgrounds. */
export const HELIO_WORDMARK_TEAL = "#3dbaa8";

const WORDMARK_SIZES = {
  sm: {
    helio: "text-[1.125rem]",
    rcm: "text-[0.4375rem]",
    rcmTracking: "tracking-[0.52em]",
  },
  md: {
    helio: "text-[1.375rem]",
    rcm: "text-[0.5rem]",
    rcmTracking: "tracking-[0.55em]",
  },
  lg: {
    helio: "text-[1.75rem]",
    rcm: "text-[0.625rem]",
    rcmTracking: "tracking-[0.55em]",
  },
  sidebar: {
    helio: "text-[1.875rem]",
    helioTracking: "tracking-[0.07em]",
    rcm: "text-[0.6875rem]",
    rcmTracking: "tracking-[0.62em]",
  },
  xl: {
    helio: "text-[2.25rem]",
    rcm: "text-[0.75rem]",
    rcmTracking: "tracking-[0.5em]",
  },
};

/**
 * Helio RCM brand lockup: colorful mark (unchanged) + separate HELIO / RCM wordmark.
 * Use variant="onDark" for white text; variant="onLight" for brand teal text.
 */
export default function HelioBrand({
  variant = "onDark",
  showWordmark = true,
  size = "md",
  markSize = "h-9 w-9",
  className = "",
  markClassName = "",
  wordmarkClassName = "",
  alt = "Helio RCM",
}) {
  const wordmarkColor = variant === "onLight" ? "text-[#3dbaa8]" : "text-white";
  const scale = WORDMARK_SIZES[size] || WORDMARK_SIZES.md;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} aria-label={alt}>
      <img
        src="/favicon.png"
        alt=""
        aria-hidden
        className={`shrink-0 object-contain ${markSize} ${markClassName}`}
        loading="lazy"
      />
      {showWordmark ? (
        <div
          className={`inline-block leading-none select-none font-bold ${wordmarkColor} ${wordmarkClassName}`}
        >
          <span className={`block ${scale.helio} ${scale.helioTracking || "tracking-[0.04em]"} uppercase`}>HELIO</span>
          <span className={`block text-center ${scale.rcm} ${scale.rcmTracking} mt-1 uppercase`}>
            RCM
          </span>
        </div>
      ) : null}
    </div>
  );
}

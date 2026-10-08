import React from "react";
import HelioBrand from "./HelioBrand";
import "../../pages/Home.css";

/**
 * Marketing site footer shared by Home, About, and other public pages.
 */
export default function SiteFooter() {
  return (
    <footer className="home-footer">
      <div className="home-footer__inner">
        <div className="home-footer__brand">
          <HelioBrand variant="onDark" size="xl" markSize="h-14 w-14" />
          <p className="home-footer__copy">
            © 2026, Helio RCM. All Rights Reserved.
          </p>
          <div className="home-footer__social" aria-label="Social links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <SocialIcon type="instagram" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <SocialIcon type="linkedin" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <SocialIcon type="facebook" />
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
              <SocialIcon type="x" />
            </a>
            <a href="https://google.com" target="_blank" rel="noreferrer" aria-label="Google">
              <SocialIcon type="google" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ type }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };

  if (type === "instagram") {
    return (
      <svg {...common}>
        <defs>
          <linearGradient id="site-ig" x1="0" y1="24" x2="24" y2="0">
            <stop stopColor="#f58529" />
            <stop offset="0.5" stopColor="#dd2a7b" />
            <stop offset="1" stopColor="#8134af" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="url(#site-ig)" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="4" stroke="url(#site-ig)" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1" fill="url(#site-ig)" />
      </svg>
    );
  }

  if (type === "linkedin") {
    return (
      <svg {...common}>
        <rect x="2" y="2" width="20" height="20" rx="3" fill="#0A66C2" />
        <path
          d="M7.2 10.2V17H5V10.2h2.2zm.1-2.4a1.3 1.3 0 11-2.6 0 1.3 1.3 0 012.6 0zM19 17h-2.2v-3.4c0-.9-.3-1.5-1.2-1.5-.6 0-1 .4-1.2.9-.1.2-.1.4-.1.7V17H12v-6.8h2.2v.9c.4-.6 1.1-1.1 2.3-1.1 1.7 0 2.5 1.1 2.5 3.3V17z"
          fill="#fff"
        />
      </svg>
    );
  }

  if (type === "facebook") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="10" fill="#1877F2" />
        <path
          d="M13.3 17.5v-5.1h1.7l.3-2h-2v-1.1c0-.6.2-1 1-1h1.1V6.3c-.2 0-.9-.1-1.7-.1-1.7 0-2.9 1-2.9 2.9v1.3H9.2v2h1.6v5.1h2.5z"
          fill="#fff"
        />
      </svg>
    );
  }

  if (type === "x") {
    return (
      <svg {...common}>
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#000" stroke="#fff" strokeWidth="0.6" />
        <path
          d="M7 7.5h2.1l2.2 3 2.5-3H16l-3.4 4.1L16.2 16.5h-2.1l-2.4-3.2-2.7 3.2H7l3.6-4.3L7 7.5z"
          fill="#fff"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="10" fill="#fff" />
      <path
        d="M12 6.2a5.8 5.8 0 105.8 5.8A5.8 5.8 0 0012 6.2zm0 1.1c.9 0 1.7.3 2.4.8-.3.4-.8.7-1.4.7h-.1a1.6 1.6 0 00-1.5 1.1 1.2 1.2 0 01-.7 1.5c-.1 0-.2.1-.2.2v.4c0 .7-.6 1.2-1.3 1.2h-.1A4.7 4.7 0 0112 7.3zm-3.7 6.5c.3-.4.8-.7 1.4-.7h.2c.4 0 .7.3.7.7v.1a1.5 1.5 0 001.5 1.4h.3a4.7 4.7 0 01-4.1-1.5zm7.4-.4a4.7 4.7 0 01-2.4 2.1v-.2a1.6 1.6 0 00-1.5-1.5h-.2a.6.6 0 01-.6-.6v-.1c0-.8.6-1.4 1.4-1.4h.1c1 .1 1.9-.5 2.2-1.4.4.8.7 1.8 1 3.1z"
        fill="#4285F4"
      />
    </svg>
  );
}

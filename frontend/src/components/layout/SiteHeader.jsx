import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import HelioBrand from "./HelioBrand";
import "../../pages/Home.css";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Platform", to: "/features" },
  { label: "Resources", to: "/resources" },
  { label: "Pricing" },
  { label: "About Us", to: "/about" },
];

/**
 * Marketing site header shared by Home, About, etc.
 * @param {"overlay"|"static"} variant - overlay floats on hero; static sits in document flow
 */
const isActivePath = (pathname, to) =>
  to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);

export default function SiteHeader({ variant = "static" }) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={`home-header${variant === "static" ? " site-header--static" : ""}${open ? " is-menu-open" : ""}`}
    >
      <div className="home-header__inner">
        <Link to="/" className="home-header__brand" aria-label="Helio RCM home">
          <HelioBrand variant="onDark" size="lg" markSize="h-10 w-10" />
        </Link>

        <nav className="home-header__nav" aria-label="Primary">
          {NAV_LINKS.map((link) =>
            link.to ? (
              <Link
                key={link.label}
                to={link.to}
                className={`home-header__link${isActivePath(pathname, link.to) ? " is-active" : ""}`}
              >
                {link.label}
              </Link>
            ) : (
              <button key={link.label} type="button" className="home-header__link">
                {link.label}
              </button>
            )
          )}
        </nav>

        <div className="home-header__actions">
          <Link to="/signin" className="home-header__login">
            Login
          </Link>
          <Link to="/contact" className="home-header__cta">
            Request a Demo
          </Link>
        </div>

        <button
          type="button"
          className={`home-header__toggle${open ? " is-open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        id="site-menu"
        className={`home-header__menu${open ? " is-open" : ""}`}
        aria-hidden={!open}
      >
        <nav className="home-header__menu-nav" aria-label="Mobile">
          {NAV_LINKS.map((link) => (
            <MobileItem
              key={link.label}
              item={link}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </nav>
        <div className="home-header__menu-actions">
          <Link to="/signin" className="home-header__menu-login" onClick={() => setOpen(false)}>
            Login
          </Link>
          <Link to="/contact" className="home-header__menu-cta" onClick={() => setOpen(false)}>
            Request a Demo
          </Link>
        </div>
      </div>
    </header>
  );
}

function MobileItem({ item, pathname, onNavigate }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const active = Boolean(item.to) && (isActivePath(pathname, item.to) || item.children?.some((child) => isActivePath(pathname, child.to)));

  if (!item.to) {
    return (
      <button type="button" className="home-header__menu-link">
        {item.label}
      </button>
    );
  }

  if (!hasChildren) {
    return (
      <Link
        to={item.to}
        className={`home-header__menu-link${active ? " is-active" : ""}`}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div className={`home-header__group${expanded ? " is-open" : ""}`}>
      <div className={`home-header__menu-link home-header__menu-parent${active ? " is-active" : ""}`}>
        <Link to={item.to} onClick={onNavigate}>
          {item.label}
        </Link>
        <button
          type="button"
          className="home-header__menu-chevron"
          aria-expanded={expanded}
          aria-label={`${expanded ? "Hide" : "Show"} ${item.label} menu`}
          onClick={() => setExpanded((value) => !value)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M7.4 8.6 12 13.2l4.6-4.6L18 10l-6 6-6-6z" />
          </svg>
        </button>
      </div>
      <div className="home-header__submenu">
        {item.children.map((child) => (
          <Link
            key={child.label}
            to={child.to}
            className={`home-header__submenu-link${isActivePath(pathname, child.to) ? " is-active" : ""}`}
            onClick={onNavigate}
          >
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

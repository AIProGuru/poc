import React from "react";
import { Link, useLocation } from "react-router-dom";
import HelioBrand from "./HelioBrand";
import "../../pages/Home.css";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Platform", to: "/features" },
  { label: "Resources", to: "/blog" },
  { label: "Pricing", to: "/contact" },
  { label: "About Us", to: "/about" },
];

/**
 * Marketing site header shared by Home, About, etc.
 * @param {"overlay"|"static"} variant - overlay floats on hero; static sits in document flow
 */
export default function SiteHeader({ variant = "static" }) {
  const { pathname } = useLocation();

  return (
    <header
      className={`home-header${variant === "static" ? " site-header--static" : ""}`}
    >
      <div className="home-header__inner">
        <Link to="/" className="home-header__brand" aria-label="Helio RCM home">
          <HelioBrand variant="onDark" size="lg" markSize="h-10 w-10" />
        </Link>

        <nav className="home-header__nav" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const active =
              link.to === "/"
                ? pathname === "/"
                : pathname === link.to || pathname.startsWith(`${link.to}/`);
            return (
              <Link
                key={link.label}
                to={link.to}
                className={`home-header__link${active ? " is-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="home-header__actions">
          <Link to="/signin" className="home-header__login">
            Login
          </Link>
          <Link to="/contact" className="home-header__cta">
            Request a Demo
          </Link>
        </div>
      </div>
    </header>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";
import "./Home.css";
import "./Notfound.css";

export default function Notfound() {
  return (
    <div className="notfound-page">
      <SiteHeader variant="overlay" />

      <main className="notfound-main">
        <div className="notfound-stage">
          <p className="notfound-kicker">404</p>
          <h1>Page not found</h1>
          <p className="notfound-copy">
            This page isn&apos;t available. Head back home, or contact us if you
            think this is a mistake.
          </p>
          <div className="notfound-actions">
            <Link to="/" className="notfound-cta">
              Back to Home
            </Link>
            <Link to="/contact" className="notfound-link">
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

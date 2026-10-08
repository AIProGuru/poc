import React from "react";
import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";
import "./Home.css";
import "./Resources.css";

const FEATURED = {
  title: "How AI Is Transforming Healthcare Revenue Cycle Management",
  author: "Vanessa Dzialakiewicz",
};

const CASE_STUDIES = [
  {
    title:
      "Microsoft & Duke CRI: Developing Frontier AI Models to Advance Clinical Reasoning and Early Diagnosis",
    tone: "teal",
    icon: "spark",
  },
  {
    title:
      "Helio RCM & Healthcare System Collaboration: Moving from Imaging Care Using Watson for Early Diagnostics",
    tone: "amber",
    icon: "pulse",
  },
  {
    title:
      "Amazon Web Services (AWS) & Health Systems: Accelerating Digital Transformation and Safeguarding Health Data Infrastructure",
    tone: "blue",
    icon: "shield",
  },
];

const NEWS = [
  {
    title: "Helio RCM Introduces Next-Gen AI Assistant to Automate Customer Workflows",
    author: "Vanessa Dzialakiewicz",
  },
  {
    title: "Helio RCM Quarterly Release: AI Engine Enhancements, New Features, and Policy Updates",
    author: "Vanessa Dzialakiewicz",
  },
];

const Resources = () => {
  return (
    <div className="resources-page">
      <SiteHeader variant="overlay" />

      <main className="resources-main">
        <div className="resources-stage">
          <article className="resources-feature">
            <div className="resources-feature__mark" aria-hidden>
              <MarkIcon name="spark" />
            </div>
            <div className="resources-feature__copy">
              <p className="resources-kicker">Featured</p>
              <h1>{FEATURED.title}</h1>
              <p className="resources-author">Author: {FEATURED.author}</p>
            </div>
            <ArrowButton label="Open featured article" />
          </article>

          <section className="resources-block" aria-labelledby="case-studies">
            <div className="resources-block__head">
              <h2 id="case-studies">Case Study</h2>
              <span className="resources-info" title="Selected partner stories">
                i
              </span>
            </div>
            <div className="resources-cases">
              {CASE_STUDIES.map((item) => (
                <article key={item.title} className={`resources-case resources-case--${item.tone}`}>
                  <div className="resources-case__mark" aria-hidden>
                    <MarkIcon name={item.icon} />
                  </div>
                  <h3>{item.title}</h3>
                </article>
              ))}
            </div>
          </section>

          <section className="resources-block" aria-labelledby="company-news">
            <div className="resources-block__head">
              <h2 id="company-news">Company News</h2>
            </div>
            <div className="resources-news">
              {NEWS.map((item) => (
                <article key={item.title} className="resources-story">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="resources-author">Author: {item.author}</p>
                  </div>
                  <ArrowButton label={`Open ${item.title}`} />
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

function ArrowButton({ label }) {
  return (
    <button type="button" className="resources-arrow" aria-label={label}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function MarkIcon({ name }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  if (name === "pulse") {
    return (
      <svg {...common}>
        <path d="M3 12h4l2.2-5 3.2 10 2.2-5H21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...common}>
        <path d="M12 3.5 19 6.5v5.2c0 4-2.7 6.8-7 8.3-4.3-1.5-7-4.3-7-8.3V6.5L12 3.5z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.8 12.1 11 14.2l4.2-4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 3.5 13.6 9H19l-4.4 3.2 1.7 5.3L12 14.8 7.7 17.5 9.4 12.2 5 9h5.4L12 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export default Resources;

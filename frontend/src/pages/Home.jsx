import React from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";
import "./Home.css";

const SERVE_ITEMS = [
  "Specialty Practices",
  "RCM Organizations",
  "Health Systems",
  "Hospitals",
];

const PLATFORM_CARDS = [
  {
    number: "01",
    title: "Intelligent claim status inquiry",
    body: "AI agents check claim status across payers continuously, surfacing what's stalled before it ages into a write-off.",
    tone: "orange",
  },
  {
    number: "02",
    title: "Denial recovery and prevention",
    body: "Every denial is triaged, appealed, and traced back to root cause — so the same denial doesn't happen twice.",
    tone: "rose",
  },
  {
    number: "03",
    title: "Payment integrity",
    body: "Contracts are checked against every remit automatically, catching underpayments payers count on going unnoticed.",
    tone: "teal",
  },
];

const Home = () => {
  const serveLoop = [...SERVE_ITEMS, ...SERVE_ITEMS, ...SERVE_ITEMS];

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__media" aria-hidden>
          <img src="/ai-hand.gif" alt="" className="home-hero__image" />
          <div className="home-hero__shade" />
        </div>

        <SiteHeader variant="overlay" />

        <div className="home-hero__content">
          <div className="home-hero__spacer" />
          <div className="home-hero__copy">
            <h1 className="home-hero__title">
              <span className="home-hero__line">Simple RCM.</span>
              <span className="home-hero__line">AI Precision.</span>
              <span className="home-hero__line">Powerful Results.</span>
            </h1>

            <p className="home-hero__tagline">
              A Modern, Customized Revenue Intelligence
              <br />
              Platform for Your Organization.
            </p>

            <Link to="/contact" className="home-hero__cta">
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      <section className="home-serve" aria-label="Who we serve">
        <h2 className="home-serve__title">Who We Serve</h2>
        <div className="home-serve__marquee">
          <div className="home-serve__track">
            {serveLoop.map((item, index) => (
              <span key={`${item}-${index}`} className="home-serve__item">
                <span className="home-serve__diamond" aria-hidden>
                  ✦
                </span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="home-platform">
        <div className="home-platform__intro">
          <div>
            <p className="home-platform__eyebrow">What we do</p>
            <h2 className="home-platform__title">
              One platform for the entire revenue cycle
            </h2>
            <p className="home-platform__lead">
              A single, AI-native system built to replace the patchwork of tools
              revenue cycle teams run today.
            </p>
          </div>
          <div className="home-platform__copy">
            <p>
              HelioRCM replaces fragmented revenue cycle systems with a single,
              AI-native platform that seamlessly integrates with virtually any
              EHR, API, or clearinghouse infrastructure.
            </p>
            <p>
              Founded by revenue cycle experts and supported by experienced
              medical advisors, HelioRCM combines deep RCM expertise, clinical
              insight, AI-powered intelligence, and entrepreneurial innovation.
              Our platform gives teams the tools to{" "}
              <strong>identify revenue leakage, automate manual processes, and strengthen financial performance.</strong>
            </p>
          </div>
        </div>

        <div className="home-platform__cards">
          {PLATFORM_CARDS.map((card) => (
            <article key={card.number} className={`home-platform__card home-platform__card--${card.tone}`}>
              <div className="home-platform__icon" aria-hidden>
                <CardIcon tone={card.tone} />
              </div>
              <p className="home-platform__number">{card.number}</p>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

function CardIcon({ tone }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  if (tone === "rose") {
    return (
      <svg {...common}>
        <path d="M4 16l5-5 3 3 8-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M14 6h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (tone === "teal") {
    return (
      <svg {...common}>
        <path d="M12 3l7 3v6c0 4.2-2.8 7.2-7 8.5C7.8 19.2 5 16.2 5 12V6l7-3z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 12.2l2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="6" y="3.5" width="12" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 8h6M9 11.5h6M9 15h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16.2" cy="16.2" r="3.2" fill="#0b1220" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 16.2l.8.8 1.7-1.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default Home;

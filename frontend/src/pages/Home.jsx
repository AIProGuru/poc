import React from "react";
import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";
import "./Home.css";

const MARQUEE_ITEMS = [
  "Hospital Systems",
  "Ambulatory Providers",
  "Clinics",
  "Services Organizations",
];

const MISSION_CARDS = [
  "Identify hidden financial losses before they impact your bottom line.",
  "Reduce write-offs and recover revenue from denied claims.",
  "Find reimbursement you're owed but never received.",
];

const Home = () => {
  const marqueeLoop = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

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
              Simple RCM
              <br />
              AI Precision
              <br />
              Powerful Results
            </h1>

            <p className="home-hero__tagline">
              The modern, AI-native revenue cycle management platform for
              healthcare providers and RCM organizations.
            </p>

            <div className="home-hero__block">
              <h2 className="home-hero__subtitle">Helio RCM</h2>
              <p className="home-hero__text">
                The AI-native, end-to-end SaaS platform built to transform the
                healthcare revenue cycle.
              </p>
            </div>

            <div className="home-hero__block">
              <h2 className="home-hero__subtitle">What We Do</h2>
              <p className="home-hero__text">
                HelioRCM replaces fragmented revenue cycle tools with a single
                AI-native platform that seamlessly integrates with virtually any
                EHR, API, and existing clearinghouse infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="home-mission-wrap">
        <div className="home-marquee" aria-hidden>
          <div className="home-marquee__media">
            <img src="/mission_bg.png" alt="" />
            <div className="home-marquee__shade" />
          </div>
          <div className="home-marquee__track">
            {marqueeLoop.map((item, index) => (
              <span key={`${item}-${index}`} className="home-marquee__item">
                {item}
                <span className="home-marquee__diamond">✧</span>
              </span>
            ))}
          </div>
        </div>

        <section className="home-mission">
          <div className="home-mission__media" aria-hidden>
            <img src="/mission_bg.png" alt="" className="home-mission__image" />
            <div className="home-mission__gradient" />
          </div>
          <div className="home-mission__content">
            <h2 className="home-mission__title">Our Mission</h2>
            <p className="home-mission__body">
              We ensure providers are fully reimbursed for the care they deliver.
              Through advanced analytics, AI-powered insights, and decades of
              revenue cycle expertise, we help healthcare organizations identify
              missed revenue, reduce denials, recover underpayments, and
              strengthen financial performance.
            </p>

            <div className="home-mission__cards">
              {MISSION_CARDS.map((text) => (
                <div key={text} className="home-mission__card">
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
};

export default Home;

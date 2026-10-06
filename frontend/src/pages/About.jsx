import React from "react";
import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";
import "./Home.css";
import "./About.css";

const About = () => {
  return (
    <div className="about-page">
      <SiteHeader variant="overlay" />

      <main className="about-main">
        <div className="about-hero">
          <div className="about-hero__portrait">
            <div className="about-hero__glow" aria-hidden />
            <img
              src="/Vanessa.png"
              alt="Vanessa Dzialakiewicz, founder of Helio RCM"
              className="about-hero__image"
            />
          </div>

          <div className="about-hero__card">
            <p>
              Hi, my name is <strong>Vanessa Dzialakiewicz</strong>, founder of
              HelioRCM. With over 16 years of experience in healthcare revenue
              cycle management across leading companies like R1, Optum, Change
              Healthcare, and Cloudmed, I created HelioRCM to address a critical
              industry challenge: lost revenue due to underpayments, denials,
              and outdated workflows. My mission is to combine deep domain
              expertise with advanced AI and automation to help healthcare
              providers recover lost income, improve efficiency, and capture
              every dollar they earn.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default About;

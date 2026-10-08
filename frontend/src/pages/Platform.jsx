import React from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";
import HelioBrand from "../components/layout/HelioBrand";
import "./Home.css";
import "./Platform.css";

const CAPABILITIES = [
  "Accelerate Cash Flow & Recover Revenue",
  "Optimize Collections & Billing",
  "Streamline Operations & Automation",
  "Enhance Clinical & Administrative Efficiency",
];

const AGENTS = [
  { name: "Carrie", role: "Claim corrector", image: "/Carrie.jpg" },
  { name: "Ivan", role: "Claim inquirer", image: "/Ivan.jpg" },
  { name: "David", role: "Appealer", image: "/David.jpg" },
  { name: "Chase", role: "Collector", image: "/Chase.jpg" },
  { name: "April", role: "UP appealer", image: "/April.jpg" },
  { name: "Poppy", role: "Cash poster", image: "/Poppy.jpg" },
];

const TOOLS = [
  { label: "ChatGPT support", icon: "search" },
  { label: "Automated payer outreach", icon: "link" },
  { label: "Contract data mining", icon: "file" },
  { label: "Payer policy data mining", icon: "data" },
  { label: "Automated appeal templates", icon: "template" },
];

const OPPORTUNITIES = [
  {
    title: "Claim scrubbing / edits",
    detail: "CH rejection, payer rejection",
    icon: "doc",
  },
  {
    title: "Claim status / delinquent",
    detail: "Pend 277, pend 835",
    icon: "clock",
  },
  {
    title: "Denials / appeals",
    detail: "Billing, coding, med necessity",
    icon: "alert",
  },
  {
    title: "Patient responsibility",
    detail: "Balance due from patient",
    icon: "user",
  },
  {
    title: "Expected reimbursement",
    detail: "Payer over/under paid",
    icon: "card",
  },
];

const Platform = () => {
  return (
    <div className="platform-page">
      <SiteHeader variant="overlay" />

      <main className="platform-main">
        <div className="platform-stage">
          <div className="platform-banner">
            <HelioBrand variant="onLight" showWordmark={false} size="sm" />
            <p>HelioRCM AI Platform.</p>
          </div>

          <div className="platform-grid">
            <article className="platform-card platform-can">
              <h2>What Our Platform Can Do?</h2>
              <ul>
                {CAPABILITIES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link to="/contact" className="platform-assess">
                Request Assessment
              </Link>
            </article>

            <div className="platform-opp">Recoverable opportunities ($)</div>

            <div className="platform-chips">
              {OPPORTUNITIES.map((item) => (
                <article key={item.title} className="platform-chip">
                  <OpportunityIcon name={item.icon} />
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>

            <article className="platform-card platform-move">
              <h3>Move from identifying problems to resolving them</h3>
              <p>— helping your organization recover more of the revenue it has already earned.</p>
            </article>

            <article className="platform-card platform-end">
              <h3>End state</h3>
              <p>Non-recoverable</p>
            </article>

            <article className="platform-card platform-take">
              <p>
                <strong>Take control of your financial performance</strong> by scheduling a{" "}
                <em>tailored demo</em> and requesting a <em>comprehensive revenue assessment</em>.
                You&apos;ll get a direct, first-hand look at how AI-driven intelligence identifies
                hidden revenue leakage, recovers underpayments, and streamlines complex workflows
                for your practice. Uncover exactly where your revenue cycle is losing money and
                see how modern automation can help you capture every dollar you&apos;ve earned.
              </p>
            </article>

            <article className="platform-card platform-agents">
              <p>
                Intelligent AI agents work alongside your team to{" "}
                <em>automate repetitive revenue cycle tasks</em>, prioritize work, and take action
                on resolvable claims.
              </p>
            </article>

            <article className="platform-card platform-analyze">
              <p>
                Continuously analyze <em>claims, payments, denials, contracts, and payer behavior</em>{" "}
                to surface revenue opportunities that would otherwise remain hidden.
              </p>
            </article>

            <article className="platform-card platform-cash">
              <OpportunityIcon name="cash" />
              <div>
                <h3>Cash posting</h3>
                <p>Contractual, payment, write-off, refund</p>
              </div>
            </article>
          </div>
        </div>
      </main>

      <section className="platform-team" aria-label="AI agents">
        <div className="platform-stage">
          <div className="platform-roster">
            {AGENTS.map((agent) => (
              <article key={agent.name} className="platform-person">
                <span className="platform-person__photo">
                  <img src={agent.image} alt="" />
                </span>
                <div>
                  <strong>{agent.name}</strong>
                  <span>{agent.role}</span>
                </div>
              </article>
            ))}
          </div>

          <ul className="platform-tools">
            {TOOLS.map((tool) => (
              <li key={tool.label}>
                <ToolIcon name={tool.icon} />
                {tool.label}
              </li>
            ))}
          </ul>

          <div className="platform-close">
            <h2>
              Stop managing the revenue cycle.
              <br />
              Start improving it.
            </h2>
            <p>
              See how HelioRCM can help your organization identify more
              opportunities, automate more work, and recover more revenue.
            </p>
            <Link to="/contact" className="platform-demo">
              Request a Demo
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

function ToolIcon({ name }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };

  if (name === "link") {
    return (
      <svg {...common}>
        <path d="M9 12a4 4 0 0 1 0-5.6l1.4-1.4a4 4 0 0 1 5.6 5.6L14.6 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M15 12a4 4 0 0 1 0 5.6l-1.4 1.4a4 4 0 0 1-5.6-5.6L9.4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "file") {
    return (
      <svg {...common}>
        <path d="M7 3.5h7l4 4V20a1.5 1.5 0 0 1-1.5 1.5h-9.5A1.5 1.5 0 0 1 5.5 20V5A1.5 1.5 0 0 1 7 3.5z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M14 3.8V8h4.2" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === "data") {
    return (
      <svg {...common}>
        <ellipse cx="12" cy="6.5" rx="6.5" ry="2.6" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5.5 6.5v5c0 1.5 2.9 2.7 6.5 2.7s6.5-1.2 6.5-2.7v-5" stroke="currentColor" strokeWidth="1.7" />
        <path d="M5.5 11.5v5c0 1.5 2.9 2.7 6.5 2.7s6.5-1.2 6.5-2.7v-5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (name === "template") {
    return (
      <svg {...common}>
        <rect x="5" y="3.5" width="14" height="17" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
        <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15.5 15.5 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function OpportunityIcon({ name }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };

  if (name === "clock") {
    return (
      <span className="platform-icon">
        <svg {...common}>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v4.2l2.6 1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  if (name === "alert") {
    return (
      <span className="platform-icon">
        <svg {...common}>
          <path d="M12 4.5 20 19H4L12 4.5z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 10v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="12" cy="16.2" r="0.8" fill="currentColor" />
        </svg>
      </span>
    );
  }

  if (name === "user") {
    return (
      <span className="platform-icon">
        <svg {...common}>
          <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M6.5 18.5c1.2-2.4 3-3.5 5.5-3.5s4.3 1.1 5.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  if (name === "card") {
    return (
      <span className="platform-icon">
        <svg {...common}>
          <rect x="3.5" y="6" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 10h17" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
    );
  }

  if (name === "cash") {
    return (
      <span className="platform-icon platform-icon--light">
        <svg {...common}>
          <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 8v6M9.8 9.2c.4-.7 1.2-1 2.2-1 1.3 0 2.2.6 2.2 1.6 0 2.4-4.4 1.2-4.4 3.4 0 1 .9 1.6 2.2 1.6 1 0 1.8-.3 2.2-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  return (
    <span className="platform-icon">
      <svg {...common}>
        <rect x="6" y="3.5" width="12" height="16" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 8h6M9 11.5h6M9 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export default Platform;

import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  CodeBracketSquareIcon,
  DocumentMagnifyingGlassIcon,
  DocumentPlusIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";
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
    title: "Claim Scrubbing & Edits",
    detail: "Reconcile Clearinghouse and Payer Rejections",
    icon: "doc",
    tone: "teal",
  },
  {
    title: "Claim Status & Delinquent Claims",
    detail: "Proactive Inquiries of Delayed Adjudication",
    icon: "clock",
    tone: "cyan",
  },
  {
    title: "Denials & Appeals Management",
    detail: "Resolve Denials Faster with AI-Driven Insights",
    icon: "alert",
    tone: "gold",
  },
  {
    title: "Automated Patient Balances",
    detail: "Accurate Patient Payment Collections",
    icon: "user",
    tone: "amber",
  },
  {
    title: "Payment Integrity",
    detail: "Identify and Recover Underpayments and Reconcile Overpayments",
    icon: "card",
    tone: "violet",
  },
];

const SECTION_COPY = {
  "pre-care": {
    title: "Pre-Care",
    copy: "What happens before the visit, from scheduling through an estimate.",
  },
};

const POINT_OF_CARE = [
  {
    title: "Price Transparency",
    icon: ReceiptPercentIcon,
    tone: "teal",
    points: [
      "AI-powered pricing from contracts, published fee schedules, and payer data",
      "Eligibility checks confirm patient benefits",
      "Procedure-specific cost estimates",
    ],
  },
  {
    title: "Clinical Intelligence (CDI)",
    icon: DocumentMagnifyingGlassIcon,
    tone: "cyan",
    points: [
      "AI reviews documentation and imaging",
      "Flags specificity and necessity gaps",
      "Stronger coding, fewer denials",
    ],
  },
  {
    title: "Charge Capture",
    icon: DocumentPlusIcon,
    tone: "gold",
    points: [
      "AI finds billable services and supplies",
      "Flags missing charges",
      "Less leakage, more compliance",
    ],
  },
  {
    title: "Coding Accuracy",
    icon: CodeBracketSquareIcon,
    tone: "violet",
    points: [
      "AI recommends current ICD-10 and HCPCS codes",
      "Surfaces pre-requisite information",
      "Fewer denials, maximum compliant payment",
    ],
  },
];

const POINT_OF_CARE_AI = [
  "Conversational AI helpdesk (ChatGPT)",
  "Machine learning regulatory, code set and bundling rules",
  "Machine learning contract and payer policy mining",
];

const Platform = () => {
  const { section } = useParams();
  const activeSection = section === "post-care" || section === "point-of-care" || SECTION_COPY[section] ? section : null;

  return (
    <div className="platform-page">
      <SiteHeader variant="overlay" />

      <main className="platform-main">
        <div className="platform-stage">
          <div className="platform-banner">
            <HelioBrand variant="onLight" showWordmark={false} size="sm" />
            <p>HelioRCM AI Platform</p>
          </div>

          {activeSection === "post-care" ? (
          <div className="platform-grid">
            <article className="platform-card platform-can">
              <h2>What Our Platform Can Do?</h2>
              <ul>
                {CAPABILITIES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link to="/pricing" className="platform-assess">
                Request Pricing
              </Link>
            </article>

            <div className="platform-opp">
              <p className="platform-opp__title">Recoverable Revenue</p>
              <p className="platform-opp__tagline">End-to-End AI-Native Automation</p>
            </div>

            <div className="platform-chips">
              {OPPORTUNITIES.map((item) => (
                <article key={item.title} className={`platform-chip platform-chip--${item.tone}`}>
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
              <h3>Final State</h3>
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
                <h3>Automated Cash Posting</h3>
                <p>Automate Posting of Payments, Contractual Adjustments, &amp; Write-Offs Directly into your EHR</p>
              </div>
            </article>
          </div>
          ) : activeSection === "point-of-care" ? (
          <div className="platform-poc">
            <h2 className="platform-poc-title">Point-of-Care</h2>
            <div className="platform-poc-banner">
              <p>Preventable Revenue Loss</p>
            </div>

            <div className="platform-poc-chips">
              {POINT_OF_CARE.map((item) => {
                const Icon = item.icon;
                return (
                <article key={item.title} className={`platform-poc-chip platform-poc-chip--${item.tone}`}>
                  <span className="platform-poc-icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <h3>{item.title}</h3>
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
                );
              })}
            </div>

            <article className="platform-poc-why">
              <h3>Why it matters</h3>
              <ul>
                <li>Getting the data right at the point of care raises clean claim rates earlier in the revenue cycle.</li>
                <li>Prevents denials, underpayments, and rework that the Post-Care modules would otherwise have to chase.</li>
              </ul>
            </article>

            <section className="platform-poc-ai" aria-label="AI capabilities">
              <p className="platform-poc-ai__label">AI at the core</p>
              <div className="platform-poc-ai__agent">
                <span aria-hidden="true">C</span>
                <div>
                  <strong>Carl</strong>
                  <em>Capturer</em>
                </div>
              </div>
              <ul>
                {POINT_OF_CARE_AI.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
          ) : activeSection ? (
            <section className="platform-section">
              <h2>{SECTION_COPY[activeSection].title}</h2>
              <p>{SECTION_COPY[activeSection].copy}</p>
            </section>
          ) : null}
        </div>
      </main>

      {activeSection === "post-care" ? (
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
      ) : null}

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
  const svg = {
    width: "100%",
    height: "100%",
    viewBox: "0 0 80 80",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };

  if (name === "clock") {
    return (
      <span className="platform-icon">
        <svg {...svg}>
          <circle cx="40" cy="42" r="22" fill="#0ea5e9" />
          <circle cx="40" cy="42" r="16" fill="#e0f2fe" />
          <circle cx="40" cy="42" r="2.2" fill="#0369a1" />
          <path d="M40 30.5v12.2l8 4.6" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="56" cy="24" r="9" fill="#22d3ee" />
          <path d="M56 19.5v5l3 1.8" stroke="#083344" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  if (name === "alert") {
    return (
      <span className="platform-icon">
        <svg {...svg}>
          <path d="M40 12 66 58H14L40 12z" fill="#facc15" />
          <path d="M40 18.5 60.5 54H19.5L40 18.5z" fill="#fef3c7" />
          <path d="M40 30v14" stroke="#a16207" strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="40" cy="49" r="2.1" fill="#a16207" />
        </svg>
      </span>
    );
  }

  if (name === "user") {
    return (
      <span className="platform-icon">
        <svg {...svg}>
          <circle cx="40" cy="40" r="24" fill="#fbbf24" />
          <circle cx="40" cy="33" r="8" fill="#fff7ed" />
          <path d="M24 54c2.4-7 8-10.5 16-10.5S53.6 47 56 54" fill="#fff7ed" />
          <circle cx="56" cy="24" r="9" fill="#f97316" />
          <path d="M56 20.2v7.6M52.2 24h7.6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  if (name === "card") {
    return (
      <span className="platform-icon">
        <svg {...svg}>
          <rect x="14" y="22" width="46" height="34" rx="8" fill="#8b5cf6" />
          <rect x="14" y="22" width="46" height="12" rx="8" fill="#c4b5fd" />
          <rect x="14" y="28" width="46" height="6" fill="#c4b5fd" />
          <rect x="22" y="42" width="16" height="4" rx="2" fill="#ede9fe" />
          <circle cx="54" cy="50" r="11" fill="#34d399" />
          <path d="M49 50.2 52.4 53.6 59.2 46" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  if (name === "price") {
    return (
      <span className="platform-icon">
        <svg {...svg}>
          <rect x="16" y="18" width="48" height="40" rx="10" fill="#2dd4bf" />
          <rect x="16" y="18" width="48" height="14" rx="10" fill="#99f6e4" />
          <rect x="16" y="26" width="48" height="6" fill="#99f6e4" />
          <circle cx="40" cy="46" r="9" fill="#ecfdf5" />
          <path d="M40 40.5v11M37.2 43.2c.6-1.2 1.6-1.8 2.8-1.8 1.8 0 3 1 3 2.4 0 1.3-1 2.1-3.2 2.5l-1.2.2c-2.4.4-3.6 1.3-3.6 2.8 0 1.6 1.4 2.6 3.4 2.6 1.4 0 2.5-.5 3.1-1.6" stroke="#115e59" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  if (name === "clinical") {
    return (
      <span className="platform-icon">
        <svg {...svg}>
          <rect x="20" y="12" width="32" height="44" rx="6" fill="#38bdf8" />
          <rect x="26" y="20" width="20" height="3" rx="1.5" fill="#e0f2fe" />
          <rect x="26" y="27" width="16" height="3" rx="1.5" fill="#e0f2fe" />
          <rect x="26" y="34" width="18" height="3" rx="1.5" fill="#e0f2fe" />
          <circle cx="54" cy="50" r="14" fill="#22d3ee" />
          <path d="M54 43.5v13M47.5 50h13" stroke="#083344" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  if (name === "capture") {
    return (
      <span className="platform-icon">
        <svg {...svg}>
          <rect x="18" y="16" width="36" height="46" rx="7" fill="#facc15" />
          <rect x="26" y="12" width="20" height="8" rx="3" fill="#fde68a" />
          <rect x="26" y="28" width="20" height="3" rx="1.5" fill="#78350f" />
          <rect x="26" y="36" width="16" height="3" rx="1.5" fill="#78350f" />
          <circle cx="54" cy="52" r="13" fill="#f97316" />
          <path d="M54 46v12M48 52h12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  if (name === "coding") {
    return (
      <span className="platform-icon">
        <svg {...svg}>
          <rect x="16" y="18" width="40" height="44" rx="8" fill="#a78bfa" />
          <path d="M26 32h20M26 40h14M26 48h16" stroke="#f5f3ff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="54" cy="50" r="13" fill="#34d399" />
          <path d="M48 50.2 52.2 54.4 60 46" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  if (name === "cash") {
    return (
      <span className="platform-icon">
        <svg {...svg}>
          <ellipse cx="34" cy="52" rx="16" ry="7" fill="#c2410c" />
          <ellipse cx="34" cy="48" rx="16" ry="7" fill="#fb923c" />
          <ellipse cx="34" cy="44" rx="16" ry="7" fill="#fdba74" />
          <ellipse cx="34" cy="40" rx="16" ry="7" fill="#fff7ed" />
          <ellipse cx="34" cy="40" rx="8" ry="3.2" fill="#fb923c" />
          <path d="M54 18v22" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
          <path d="M46 26 54 17l8 9" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  return (
    <span className="platform-icon">
      <svg {...svg}>
        <path d="M24 14h22l12 12v36a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6z" fill="#5eead4" />
        <path d="M46 14v10a4 4 0 0 0 4 4h8" fill="#99f6e4" />
        <path d="M28 38h18M28 46h14" stroke="#134e4a" strokeWidth="3" strokeLinecap="round" />
        <circle cx="52" cy="52" r="12" fill="#22c55e" />
        <path d="M46.2 52.2 50.2 56.2 58 47.6" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default Platform;

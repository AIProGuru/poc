import React, { useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";
import { sendInquiry } from "../utils/sendInquiry";
import "./Home.css";
import "./Pricing.css";

const MODULES = [
  "Claim Status",
  "Denials and Automated Appeals",
  "Patient Liability",
  "Payment Variance (Underpayments)",
  "Autonomous Cash Posting",
  "Agentic AI and LLMs",
];

const REVENUE_BANDS = [
  "Under $5M",
  "$5M-$25M",
  "$25M-$100M",
  "$100M-$250M",
  "$250M+",
];

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  confirmEmail: "",
  providerName: "",
  city: "",
  state: "",
  zip: "",
  modules: [],
  revenue: "",
  providers: "",
  practices: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Pricing = () => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const toggleModule = (module) => {
    setForm((prev) => {
      const selected = prev.modules.includes(module)
        ? prev.modules.filter((item) => item !== module)
        : [...prev.modules, module];
      return { ...prev, modules: selected };
    });
    setErrors((prev) => ({ ...prev, modules: undefined }));
  };

  const selectRevenue = (band) => {
    setForm((prev) => ({ ...prev, revenue: prev.revenue === band ? "" : band }));
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = "Enter a first name.";
    if (!form.lastName.trim()) next.lastName = "Enter a last name.";
    if (!form.email.trim()) next.email = "Enter an email.";
    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "Enter a valid email.";
    if (!form.confirmEmail.trim()) next.confirmEmail = "Confirm the email.";
    else if (form.email.trim().toLowerCase() !== form.confirmEmail.trim().toLowerCase()) {
      next.confirmEmail = "Email addresses do not match.";
    }
    if (!form.providerName.trim()) next.providerName = "Enter the provider name.";
    if (!form.city.trim()) next.city = "Enter a city.";
    if (!form.state.trim()) next.state = "Enter a state.";
    if (!form.zip.trim()) next.zip = "Enter a ZIP code.";
    if (form.modules.length === 0) next.modules = "Select at least one module.";
    if (form.providers.trim()) {
      const count = Number(form.providers);
      if (!Number.isInteger(count) || count < 1 || count > 100) {
        next.providers = "Enter a whole number from 1 to 100.";
      }
    }
    if (form.practices.trim()) {
      const count = Number(form.practices);
      if (!Number.isInteger(count) || count < 1) {
        next.practices = "Enter a whole number of 1 or more.";
      }
    }
    return next;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0 || sending) return;

    setSending(true);
    try {
      await sendInquiry({
        kind: "pricing",
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        confirmEmail: form.confirmEmail.trim(),
        providerName: form.providerName.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zip: form.zip.trim(),
        modules: form.modules,
        revenue: form.revenue,
        providers: form.providers.trim(),
        practices: form.practices.trim(),
      });
      setSubmitted(true);
    } catch (error) {
      setErrors({
        ...(error.fields || {}),
        form: error.fields ? undefined : error.message,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pricing-page">
      <SiteHeader variant="overlay" />

      <main className="pricing-main">
        <div className="pricing-stage">
          <header className="pricing-intro">
            <p className="pricing-kicker">Pricing</p>
            <h1>Pricing Inquiry</h1>
            <p className="pricing-copy">
              Tell us about your organization and we&apos;ll send a custom quote.
            </p>
          </header>

          {submitted ? (
            <section className="pricing-card pricing-success" aria-live="polite">
              <p className="pricing-kicker">Inquiry received</p>
              <h2>Thanks. We&apos;ll send a quote for your organization.</h2>
              <Link to="/" className="pricing-submit">
                Back to Home
              </Link>
            </section>
          ) : (
            <form className="pricing-card" onSubmit={onSubmit} noValidate>
              <fieldset className="pricing-section">
                <legend>
                  Name <Required />
                </legend>
                <div className="pricing-grid pricing-grid--2">
                  <Field
                    label="First Name"
                    name="firstName"
                    value={form.firstName}
                    onChange={onChange}
                    autoComplete="given-name"
                    error={errors.firstName}
                  />
                  <Field
                    label="Last Name"
                    name="lastName"
                    value={form.lastName}
                    onChange={onChange}
                    autoComplete="family-name"
                    error={errors.lastName}
                  />
                </div>
              </fieldset>

              <fieldset className="pricing-section">
                <legend>
                  Email <Required />
                </legend>
                <div className="pricing-grid pricing-grid--2">
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    autoComplete="email"
                    placeholder="Enter email"
                    error={errors.email}
                  />
                  <Field
                    label="Confirm Email"
                    name="confirmEmail"
                    type="email"
                    value={form.confirmEmail}
                    onChange={onChange}
                    autoComplete="email"
                    placeholder="Confirm email"
                    error={errors.confirmEmail}
                  />
                </div>
              </fieldset>

              <fieldset className="pricing-section">
                <legend>
                  Provider Location <Required />
                </legend>
                <div className="pricing-grid pricing-grid--location">
                  <Field
                    label="Provider Name"
                    name="providerName"
                    value={form.providerName}
                    onChange={onChange}
                    autoComplete="organization"
                    error={errors.providerName}
                  />
                  <Field
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    autoComplete="address-level2"
                    error={errors.city}
                  />
                  <Field
                    label="State"
                    name="state"
                    value={form.state}
                    onChange={onChange}
                    autoComplete="address-level1"
                    error={errors.state}
                  />
                  <Field
                    label="Zip Code"
                    name="zip"
                    value={form.zip}
                    onChange={onChange}
                    autoComplete="postal-code"
                    error={errors.zip}
                  />
                </div>
              </fieldset>

              <fieldset className="pricing-section">
                <legend>
                  Modules your practice is interested in <Required />
                </legend>
                <div className="pricing-choices" role="group" aria-label="Modules">
                  {MODULES.map((module) => {
                    const selected = form.modules.includes(module);
                    return (
                      <button
                        key={module}
                        type="button"
                        className={`pricing-choice${selected ? " is-selected" : ""}`}
                        aria-pressed={selected}
                        onClick={() => toggleModule(module)}
                      >
                        <span className="pricing-choice__mark" aria-hidden />
                        {module}
                      </button>
                    );
                  })}
                </div>
                {errors.modules ? <p className="pricing-error">{errors.modules}</p> : null}
              </fieldset>

              <fieldset className="pricing-section">
                <legend>Annual Net Patient Revenue</legend>
                <div className="pricing-bands" role="group" aria-label="Annual net patient revenue">
                  {REVENUE_BANDS.map((band) => {
                    const selected = form.revenue === band;
                    return (
                      <button
                        key={band}
                        type="button"
                        className={`pricing-band${selected ? " is-selected" : ""}`}
                        aria-pressed={selected}
                        onClick={() => selectRevenue(band)}
                      >
                        {band}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <fieldset className="pricing-section">
                <legend>Practice size</legend>
                <div className="pricing-grid pricing-grid--2">
                  <Field
                    label="Approx Number of Providers"
                    name="providers"
                    type="number"
                    min="1"
                    max="100"
                    value={form.providers}
                    onChange={onChange}
                    placeholder="Please enter a number from 1 to 100."
                    error={errors.providers}
                  />
                  <Field
                    label="Number of Practices"
                    name="practices"
                    type="number"
                    min="1"
                    value={form.practices}
                    onChange={onChange}
                    placeholder="Enter the number of practices"
                    error={errors.practices}
                  />
                </div>
              </fieldset>

              {errors.form ? <p className="pricing-error">{errors.form}</p> : null}
              <button type="submit" className="pricing-submit" disabled={sending}>
                {sending ? "Sending..." : "Submit"}
              </button>
            </form>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

function Required() {
  return <span className="pricing-required">Required</span>;
}

function Field({ label, error, ...input }) {
  const id = `pricing-${input.name}`;
  return (
    <label className="pricing-field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} aria-invalid={error ? "true" : undefined} {...input} />
      {error ? <small className="pricing-error">{error}</small> : null}
    </label>
  );
}

export default Pricing;

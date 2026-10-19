import React, { useState } from "react";
import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/layout/SiteFooter";
import { sendInquiry } from "../utils/sendInquiry";
import "./Home.css";
import "./Contact.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    updates: false,
    email: "",
    phone: "",
    provider: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "name" || name === "email") {
      setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Enter a name.";
    if (!form.email.trim()) next.email = "Enter an email.";
    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "Enter a valid email.";
    setErrors(next);
    if (Object.keys(next).length > 0 || sending) return;

    setSending(true);
    try {
      await sendInquiry({
        kind: "demo",
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        provider: form.provider.trim(),
        message: form.message.trim(),
        updates: form.updates,
      });
      setSubmitted(true);
    } catch (error) {
      setErrors(error.fields || { form: error.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <SiteHeader variant="overlay" />

      <main className="contact-main">
        <div className="contact-stage">
          <section className="contact-intro">
            <div className="contact-intro__copy">
              <p className="contact-intro__eyebrow">Schedule our AI Demo</p>
              <h1 className="contact-intro__title">Evaluate your revenue</h1>
              <p className="contact-intro__kicker">We will assess it for you</p>

              <ul className="contact-intro__list">
                <li>
                  <ListIcon type="support" />
                  <span>Support and answer all of our customers' questions and concerns.</span>
                </li>
                <li>
                  <ListIcon type="message" />
                  <span>
                    Send us a message and share your company's strategic goals and what you're
                    looking for.
                  </span>
                </li>
                <li>
                  <ListIcon type="check" />
                  <span>Allow us to email you with the latest updates about our products.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="contact-form-card">
            <h2 className="contact-form-card__title">Request a Demo</h2>
            {submitted ? (
              <div className="contact-success" aria-live="polite">
                <p>Thanks. We received your demo request and will be in touch.</p>
              </div>
            ) : (
            <form className="contact-form" onSubmit={onSubmit} noValidate>
              <label className="contact-field">
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  autoComplete="name"
                  aria-invalid={errors.name ? "true" : undefined}
                />
                {errors.name ? <small className="contact-error">{errors.name}</small> : null}
              </label>

              <label className="contact-check">
                <input
                  type="checkbox"
                  name="updates"
                  checked={form.updates}
                  onChange={onChange}
                />
                <span>Click here to receive updates from us</span>
              </label>

              <div className="contact-form__row">
                <label className="contact-field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    autoComplete="email"
                    aria-invalid={errors.email ? "true" : undefined}
                  />
                  {errors.email ? <small className="contact-error">{errors.email}</small> : null}
                </label>
                <label className="contact-field">
                  <span>Phone (Optional)</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={onChange}
                    autoComplete="tel"
                  />
                </label>
              </div>

              <label className="contact-field">
                <span>Provider</span>
                <input
                  type="text"
                  name="provider"
                  value={form.provider}
                  onChange={onChange}
                />
              </label>

              <label className="contact-field">
                <span>Message</span>
                <textarea
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={onChange}
                />
              </label>

              {errors.form ? <p className="contact-error">{errors.form}</p> : null}
              <button type="submit" className="contact-submit" disabled={sending}>
                {sending ? "Sending..." : "Submit"}
              </button>
            </form>
            )}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

function ListIcon({ type }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  };

  if (type === "support") {
    return (
      <svg {...common}>
        <path
          d="M12 3a7 7 0 00-7 7v2.2c0 .6-.2 1.2-.6 1.7L3.2 16A1 1 0 004 17.5h16a1 1 0 00.8-1.5l-1.2-2.1c-.4-.5-.6-1.1-.6-1.7V10a7 7 0 00-7-7z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M9 18.5a3 3 0 006 0" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  if (type === "message") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 12.2l3 3 6-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default Contact;

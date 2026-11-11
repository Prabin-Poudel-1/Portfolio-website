import React from "react";
export function Contact() {
  return (
    <section className="section-wrap contact" id="contact">
      <div>
        <p className="eyebrow">Let’s connect</p>
        <h2>
          Have an opportunity
          <br />
          in mind?
        </h2>
        <p>
          I’d be glad to discuss software engineering internships, projects, and
          opportunities to learn.
        </p>
        <a className="contact-email" href="mailto:contact@poudelprabin.com.np">
          contact@poudelprabin.com.np
        </a>
        <button className="button copy-email" type="button">
          Copy email address
        </button>
        <p
          id="copy-status"
          className="small"
          role="status"
          aria-live="polite"
        ></p>
        <p>
          <a href="tel:+9779744235965">+977 9744235965</a> · Chitwan, Nepal
        </p>
        <div className="social-links">
          <a
            className=""
            href="https://github.com/Prabin-Poudel-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.8-1.32-3.8-1.32-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.72 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.5-.29-5.13-1.25-5.13-5.55 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.55.23 2.69.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.31-2.63 5.26-5.14 5.54.4.35.76 1.03.76 2.08v3.1c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" />
            </svg>
            GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a
            className=""
            href="https://www.linkedin.com/in/prabin-poudel-556180329"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5.4 7.7H1.8V22h3.6V7.7ZM3.6 1.8a2.1 2.1 0 1 0 0 4.2 2.1 2.1 0 0 0 0-4.2ZM22.2 13.8c0-4.3-2.3-6.3-5.3-6.3-2.4 0-3.4 1.3-4 2.2v-2H9.3V22h3.6v-8c0-2.1.4-4.1 3-4.1s2.7 2.4 2.7 4.3V22h3.6v-8.2Z" />
            </svg>
            LinkedIn<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a
            className=""
            href="https://instagram.com/pra_.veen._005"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </div>
      <form id="contact-form" aria-describedby="contact-availability">
        <p id="contact-availability" className="contact-notice">
          Enable JavaScript to send a message here, or email
          <a href="mailto:contact@poudelprabin.com.np">
            contact@poudelprabin.com.np
          </a>
          for now.
        </p>
        <div className="honeypot" aria-hidden="true">
          <label htmlFor="contact-website">Leave this field empty</label>
          <input
            id="contact-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>
        <label htmlFor="contact-name">Your name</label>
        <input
          id="contact-name"
          name="name"
          autoComplete="name"
          required
          maxLength={120}
        />
        <label htmlFor="contact-email">Email address</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          maxLength={5000}
        ></textarea>
        <button className="button primary" type="submit" disabled>
          <span data-submit-label>Enable JavaScript to send</span>
          <span className="send-spinner" aria-hidden="true"></span>
        </button>
        <p
          id="form-status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        ></p>
        <a className="text-link" href="mailto:contact@poudelprabin.com.np">
          Send an email instead ↗
        </a>
      </form>
    </section>
  );
}

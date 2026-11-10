import React from "react";
import { SystemDiagram } from "../components/SystemDiagram";
export function Hero() {
  return (
    <section className="home section-wrap" id="home">
      <div className="home-content">
        <p className="availability">
          <span aria-hidden="true"></span>Open to internship opportunities
        </p>
        <p className="eyebrow">AI · Security · Systems</p>
        <h1>
          Prabin
          <br />
          Poudel<span className="accent">.</span>
        </h1>
        <p className="hero-role">
          Computer Engineering Student &amp; Developer
        </p>
        <p className="hero-intro">
          I build secure software, mobile applications, and AI-assisted
          systems—with an interest in what happens beyond the happy path.
        </p>
        <p className="hero-focus">
          AI agent security · Rust &amp; Python · Offline-first mobile · Spring
          Boot · PostgreSQL
        </p>
        <div className="hero-actions">
          <a className="button primary" href="#portfolio">
            View projects <span aria-hidden="true">↓</span>
          </a>
          <a
            className="button"
            href="cv.pdf?v=20261014-ai"
            download="Prabin-Poudel-CV.pdf"
          >
            Download CV
          </a>
        </div>
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
        </div>
      </div>
      <figure className="hero-portrait">
        <img
          src="assets/portrait.webp"
          width="640"
          height="640"
          fetchPriority="high"
          alt="Prabin Poudel beside a lake"
        />
        <figcaption>
          <span>Based in Bharatpur, Nepal</span>
          <strong>Building. Learning. Iterating.</strong>
        </figcaption>
      </figure>
      <SystemDiagram />
    </section>
  );
}

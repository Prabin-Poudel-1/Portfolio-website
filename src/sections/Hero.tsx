import React from "react";
import { SystemDiagram } from "../components/SystemDiagram";
export function Hero() {
  return (
    <section className="home section-wrap" id="home">
      <div className="hero-topline">
        <p className="eyebrow">Prabin Poudel / Engineering portfolio</p>
        <p className="availability">
          <span />
          Open to internships
        </p>
      </div>
      <div className="home-content">
        <p className="hero-role">Computer Engineering Student & Developer</p>
        <h1>
          Connecting ideas.
          <br />
          <em>Engineering</em>
          <br />
          what’s next<span className="accent">.</span>
        </h1>
        <p className="hero-intro">
          I build secure software, offline-first applications, and AI-assisted
          systems. Curious about the connections. Careful about the boundaries.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="#portfolio">
            Explore my work ↗
          </a>
          <a
            className="button"
            href="cv.pdf?v=20261014-ai"
            download="Prabin-Poudel-CV.pdf"
          >
            Download CV ↓
          </a>
        </div>
      </div>
      <SystemDiagram />
      <div className="hero-bottom">
        <div className="identity-note">
          <img
            src="assets/portrait.webp"
            width="56"
            height="56"
            alt="Prabin Poudel beside a lake"
          />
          <p>
            <strong>Prabin Poudel</strong>
            <span>Building from Bharatpur, Nepal</span>
          </p>
        </div>
        <div className="social-links">
          <a
            href="https://github.com/Prabin-Poudel-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <a
            href="https://www.linkedin.com/in/prabin-poudel-556180329"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
        </div>
        <a className="scroll-note" href="#portfolio">
          SCROLL TO EXPLORE ↓
        </a>
      </div>
    </section>
  );
}

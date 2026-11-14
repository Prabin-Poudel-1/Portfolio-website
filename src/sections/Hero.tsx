import React, { useState } from "react";
import { SystemDiagram } from "../components/SystemDiagram";
import { HeroInterests } from "../components/HeroInterests";
export function Hero() {
  const [motionPaused, setMotionPaused] = useState(false);
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
          I build for
          <br />
          <em>when things</em>
          <br />
          go wrong<span className="accent">.</span>
        </h1>
        <HeroInterests />
        <p className="hero-intro">
          Offline networks. Secure AI agents. Satellite intelligence. I build
          software for unpredictable conditions—and make its limits explicit.
        </p>
        <div className="hero-actions">
          <a className="button primary" href="#portfolio">
            Explore my work ↗
          </a>
          <a className="text-link hero-lab-link" href="/?demo=rescuer-sathi#portfolio">Try the Signal Lost Lab ↗</a>
          <a
            className="button"
            href="cv.pdf?v=20261014-ai"
            download="Prabin-Poudel-CV.pdf"
          >
            Download CV ↓
          </a>
        </div>
      </div>
      <SystemDiagram paused={motionPaused} onPause={() => setMotionPaused(value => !value)} />
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

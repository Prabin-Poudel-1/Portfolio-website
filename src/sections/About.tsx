import React from "react";
import { LocationCard } from "../components/LocationCard";
export function About() {
  return (
    <section className="section-wrap about" id="about">
      <div className="about-story">
        <img
          className="about-portrait"
          src="assets/portrait.webp"
          width="640"
          height="640"
          loading="lazy"
          alt="Prabin Poudel beside a lake"
        />
        <p className="eyebrow">A little about me</p>
        <h2>
          Curious about systems.
          <br />
          Committed to learning.
        </h2>
      </div>
      <div>
        <p>
          I’m a Computer Engineering student at United Technical College,
          Pokhara University, in Bharatpur, Chitwan. I enjoy connecting mobile
          interfaces, backend services, and AI models into useful applications.
        </p>
        <p>
          My projects explore what happens beyond the happy path: interrupted
          connectivity, private information, uncertain predictions, and changing
          real-world conditions. Sentinel AI extends that interest into
          cybersecurity: separating an agent’s proposed actions from the
          policies that authorize them.
        </p>
        <p>
          I’m looking for software engineering internships where I can
          contribute, learn from experienced engineers, and deepen my
          development practice.
        </p>
        <a
          className="button cv-download"
          href="cv.pdf?v=20261014-ai"
          download="Prabin-Poudel-CV.pdf"
        >
          Download my CV ↗
        </a>
      </div>
      <LocationCard />
    </section>
  );
}

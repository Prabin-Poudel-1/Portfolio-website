import React from "react";
export function ProjectArchive() {
  return (
    <section className="project-archive" aria-label="Project documentation">
      <div className="projects-grid">
        <article
          className="project-card featured sentinel-feature"
          id="project-sentinel-ai"
        >
          <div className="project-visual">
            <img
              src="assets/projects/sentinel-ai.svg"
              width="960"
              height="600"
              loading="lazy"
              alt="Sentinel AI concept diagram of an independent authorization boundary"
            />
            <span className="art-label">Architecture illustration</span>
          </div>
          <div className="project-details">
            <p className="eyebrow">01 / AI Security · Systems Engineering</p>
            <h3>
              Sentinel AI <span className="project-alias">/ SentinelOS</span>
            </h3>
            <p className="project-subtitle">
              Your agent can propose. Only policy can permit.
            </p>
            <p>
              A local-first Rust security gateway that checks supported agent
              actions against trusted contracts, Cedar policies, and human
              approvals before execution.
            </p>
            <p className="project-highlight">
              Open-source research · Release candidate
            </p>
            <ul className="tags">
              <li>Rust</li>
              <li>Python</li>
              <li>Cedar Policy</li>
              <li>Wasmtime</li>
              <li>SQLite</li>
            </ul>
            <div className="project-actions">
              <a className="button primary" href="sentinel-ai.html">
                View case study ↗
              </a>
              <a
                className="text-link"
                href="https://github.com/Prabin-Poudel-1/sentinel-si"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗
              </a>
              <a
                className="text-link"
                href="https://sentinel.poudelprabin.com.np"
                target="_blank"
                rel="noopener noreferrer"
              >
                Project website ↗
              </a>
            </div>
          </div>
        </article>
        <article className="project-card featured" id="project-rescuer-sathi">
          <div
            className="project-visual app-preview"
            aria-label="Rescuer Sathi application screenshots"
          >
            <img
              src="assets/screenshots/rescuer-dashboard.jpg"
              width="720"
              height="1612"
              loading="lazy"
              alt="Rescuer dashboard showing a nearby SOS"
            />
            <img
              src="assets/screenshots/rescue-map.jpg"
              width="714"
              height="1599"
              loading="lazy"
              alt="Accepted rescue and location map"
            />
            <span className="art-label">Actual Android app</span>
          </div>
          <div className="project-details">
            <p className="eyebrow">02 / Android engineering prototype</p>
            <h3>Rescuer Sathi</h3>
            <p className="project-subtitle">
              Offline-First Emergency Assistance &amp; Rescue Coordination
            </p>
            <p>
              When connectivity drops, an emergency request should remain
              available. This Android prototype persists SOS requests locally
              and coordinates verified responders.
            </p>
            <p className="project-highlight">
              Physical-device relay testing · Three on-device AI models
            </p>
            <ul className="tags">
              <li>Flutter</li>
              <li>Spring Boot</li>
              <li>PostgreSQL</li>
              <li>TFLite</li>
            </ul>
            <div className="project-actions">
              <a className="button" href="rescuer-sathi.html">
                View case study <span aria-hidden="true">↗</span>
              </a>
              <a
                className="text-link"
                href="https://github.com/Prabin-Poudel-1/rescuer-sathi"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗<span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </article>
        <article className="project-card featured ghostcursor-feature" id="project-ghostcursor">
          <div className="project-visual">
            <img
              src="assets/projects/ghostcursor.svg"
              width="1200"
              height="675"
              loading="lazy"
              alt="Schematic depiction of two GhostCursor browser workspaces with a shared pointer and annotation"
            />
            <span className="art-label">Illustrative architecture cover · not an actual browser capture</span>
          </div>
          <div className="project-details">
            <p className="eyebrow">03 / Browser Systems · Real-time Collaboration</p>
            <h3>GhostCursor</h3>
            <p className="project-subtitle">Browse together. Point anywhere.</p>
            <p>
              A privacy-first browser extension with encrypted WebRTC cursors,
              click ripples, laser drawings and session-only, element-anchored
              sticky notes. Chromium and Firefox share the same protocol.
            </p>
            <p className="project-highlight">
              Phase 3 prototype · 106 unit tests · 9 browser tests · CI verified
            </p>
            <ul className="tags">
              <li>TypeScript</li><li>WebRTC</li><li>Manifest V3</li>
              <li>Firefox</li><li>Playwright</li>
            </ul>
            <div className="project-actions">
              <a className="button" href="?demo=ghostcursor#portfolio">
                Explore interactive lab ↗
              </a>
              <a className="text-link" href="https://github.com/Prabin-Poudel-1/ghost-curser/tree/feature/ghostcursor-phase3" target="_blank" rel="noopener noreferrer">
                Phase 3 source ↗
              </a>
              <a className="text-link" href="https://github.com/Prabin-Poudel-1/ghost-curser/blob/feature/ghostcursor-phase3/docs/VERIFICATION.md" target="_blank" rel="noopener noreferrer">
                Test evidence ↗
              </a>
            </div>
          </div>
        </article>
        <article className="project-card featured" id="project-chitwan-care">
          <div className="project-visual">
            <img
              src="assets/projects/chitwan-care.webp"
              width="1100"
              height="733"
              loading="lazy"
              alt="Concept illustration for Chitwan Care; not an application screenshot"
            />
            <span className="art-label">Concept artwork</span>
          </div>
          <div className="project-details">
            <p className="eyebrow">04 / Environmental reporting</p>
            <h3>Chitwan Care</h3>
            <p className="project-subtitle">
              AI-Assisted Waste Detection &amp; Environmental Reporting
            </p>
            <p>
              Connect a waste photo to a cleanup workflow: on-device detection,
              location-linked reports, administrator review, and department
              follow-up.
            </p>
            <p className="project-highlight">
              Tested on Android · Deployed backend + Neon
            </p>
            <ul className="tags">
              <li>Flutter</li>
              <li>Spring Boot</li>
              <li>PostgreSQL</li>
              <li>LiteRT</li>
            </ul>
            <div className="project-actions">
              <a className="button" href="chitwan-care.html">
                View case study <span aria-hidden="true">↗</span>
              </a>
              <a
                className="text-link"
                href="https://github.com/Prabin-Poudel-1/waste-photo-type"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗<span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </article>
        <article className="project-card compact" id="project-smart-university">
          <div className="project-visual">
            <img
              src="assets/projects/smart-university.webp"
              width="1100"
              height="733"
              loading="lazy"
              alt="Concept illustration for Smart University Management System; not an application screenshot"
            />
            <span className="art-label">Concept artwork</span>
          </div>
          <div className="project-details">
            <p className="eyebrow">05 / Web application</p>
            <h3>Smart University Management System</h3>
            <p className="project-subtitle">A connected campus workspace</p>
            <p>
              Student, teacher, course, enrollment, and notice management with
              student ID cards and PDF generation.
            </p>
            <ul className="tags">
              <li>Java</li>
              <li>Spring Boot</li>
              <li>PostgreSQL</li>
              <li>PDFBox</li>
            </ul>
            <div className="project-actions">
              <a
                className="text-link"
                href="https://github.com/Prabin-Poudel-1/Smart-University-managemnt-Sytem"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗<span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </article>
        <article className="project-card compact" id="project-chitwan-plus">
          <div className="project-visual">
            <img
              src="assets/projects/chitwan-plus.webp"
              width="1100"
              height="733"
              loading="lazy"
              alt="Concept illustration for Chitwan Plus; not an application screenshot"
            />
            <span className="art-label">Concept artwork</span>
          </div>
          <div className="project-details">
            <p className="eyebrow">06 / Travel planning prototype</p>
            <h3>Chitwan Plus</h3>
            <p className="project-subtitle">Interest-led travel planning</p>
            <p>
              A Bharatpur Pulse prototype that balances interests, budget, and
              time, with maps, replacement itinerary previews, and Gemini trip
              assistance.
            </p>
            <ul className="tags">
              <li>React</li>
              <li>TypeScript</li>
              <li>Leaflet</li>
              <li>Spring Boot</li>
            </ul>
            <div className="project-actions">
              <a
                className="text-link"
                href="https://github.com/Prabin-Poudel-1/prototype"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub ↗<span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

import React from "react";
export function Expertise() {
  return (
    <section className="section-wrap" id="expertise">
      <div className="section-heading">
        <p className="eyebrow">How I build</p>
        <h2>Engineering expertise</h2>
        <p>
          Practical experience developed through mobile, backend, and
          AI-assisted projects.
        </p>
      </div>
      <div className="expertise-grid">
        <article className="expertise-card">
          <span className="number">01</span>
          <h3>Mobile Application Engineering</h3>
          <p>
            Flutter and Android applications with persistent local state,
            resilient sync, and clear recovery when connectivity is lost.
          </p>
        </article>
        <article className="expertise-card">
          <span className="number">02</span>
          <h3>Backend &amp; API Development</h3>
          <p>
            Spring Boot REST APIs, PostgreSQL data models, JWT authentication,
            and role-aware application workflows.
          </p>
        </article>
        <article className="expertise-card">
          <span className="number">03</span>
          <h3>AI Integration</h3>
          <p>
            Model training and on-device TensorFlow Lite inference, with image
            preprocessing and clear separation of predictions from validated
            outcomes.
          </p>
        </article>
        <article className="expertise-card">
          <span className="number">04</span>
          <h3>Secure Systems &amp; Architecture</h3>
          <p>
            Independent agent authorization with Rust and Cedar Policy,
            restricted execution, encrypted persistence, consent-based sharing,
            and regression tests around access boundaries.
          </p>
        </article>
      </div>
    </section>
  );
}

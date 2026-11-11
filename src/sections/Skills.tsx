import React, { useState } from "react";
const groups = [
  {
    title: "Programming Languages",
    tags: [
      "Java",
      "Dart",
      "Python",
      "JavaScript",
      "TypeScript",
      "C / C++",
      "Rust",
    ],
  },
  {
    title: "Mobile Development",
    tags: ["Flutter", "Android", "Kotlin integration", "Riverpod"],
  },
  {
    title: "Backend Development",
    tags: ["Spring Boot", "REST APIs", "Spring Data JPA", "JWT"],
  },
  {
    title: "Databases",
    tags: ["PostgreSQL", "SQLite", "H2", "Flyway", "Cloudflare D1"],
  },
  {
    title: "DevOps & Tools",
    tags: [
      "Git",
      "Docker",
      "Maven",
      "Vite",
      "GitHub Actions",
      "Playwright",
      "Cloudflare Workers",
    ],
  },
  {
    title: "AI & Machine Learning",
    tags: [
      "Model training",
      "YOLO / Ultralytics",
      "TensorFlow Lite / LiteRT",
      "Computer vision",
    ],
  },
];
export function Skills() {
  const [query, setQuery] = useState("");
  const shown = groups.filter((group) =>
    (group.title + " " + group.tags.join(" "))
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  return (
    <section className="section-wrap" id="skill">
      <div className="section-heading">
        <p className="eyebrow">My toolkit</p>
        <h2>Technologies I work with</h2>
        <p>A working toolkit grounded in the projects above.</p>
      </div>
      <div className="toolkit-search">
        <label htmlFor="skill-search">Explore the toolkit</label>
        <input
          id="skill-search"
          type="search"
          placeholder="Find a technology…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p role="status">
          {query
            ? shown.length + " matching categories"
            : "Browse technologies by discipline."}
        </p>
      </div>
      <div className="skills-grid">
        {shown.map((group) => (
          <article className="skill-group" key={group.title}>
            <h3>{group.title}</h3>
            <ul className="tags">
              {group.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p className="skills-note">
        Secure systems: Cedar Policy, WebAssembly, Wasmtime, signed task
        contracts, and audit logging. Also used in my web projects: React, HTML,
        CSS, and Leaflet maps.
      </p>
    </section>
  );
}

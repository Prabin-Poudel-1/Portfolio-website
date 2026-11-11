import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { projects } from "../data/projects";
import { ProjectArchive } from "./ProjectArchive";
import { DemoPanel } from "../components/DemoPanel";
import { swipeDirection } from "../demos/model";
import { playSound } from "../utils/sound.js";
export function Projects() {
  const [index, setIndex] = useState(0),
    [enhanced, setEnhanced] = useState(false);
  const [demo, setDemo] = useState(false);
  const demoTrigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const direction = useRef(1);
  const item = projects[index];
  useEffect(() => setEnhanced(true), []);
  useEffect(() => {
    if (!root.current) return;
    const element = root.current;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const timeline = gsap.timeline({
        defaults: { ease: "power2.out", duration: 0.42 },
      });
      timeline
        .fromTo(
          element.querySelector(".cinema-image"),
          { opacity: 0.35, x: direction.current * 28, scale: 1.025 },
          { opacity: 1, x: 0, scale: 1 },
          0,
        )
        .fromTo(
          element.querySelectorAll(".cinema-copy > *"),
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, stagger: 0.035 },
          0.04,
        )
        .fromTo(
          element.querySelector(".cinema-counter"),
          { y: direction.current * 12, opacity: 0 },
          { y: 0, opacity: 1 },
          0,
        );
      return () => {
        timeline.kill();
        gsap.set(
          element.querySelectorAll(
            ".cinema-image,.cinema-copy > *,.cinema-counter",
          ),
          { clearProps: "all" },
        );
      };
    });
    return () => media.revert();
  }, [index]);
  function select(next: number) {
    const normalized = (next + projects.length) % projects.length;
    if (normalized === index) return;
    direction.current = next > index ? 1 : -1;
    setIndex(normalized);
    playSound("project");
  }
  useEffect(() => {
    const choose = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      const next = projects.findIndex((p) => p.id === id);
      if (next >= 0) {
        direction.current = 1;
        setIndex(next);
      }
    };
    window.addEventListener("portfolio:project", choose);
    return () => window.removeEventListener("portfolio:project", choose);
  }, []);
  return (
    <section className="section-wrap cinema-section" id="portfolio">
      <div className="section-heading">
        <p className="eyebrow">Selected work / 07 perspectives</p>
        <h2>
          Systems in focus.
          <br />
          <span className="accent">Explore the connections.</span>
        </h2>
        <p>
          From independent AI authorization to offline emergency communication.
          Select a project to look closer.
        </p>
      </div>
      <div
        ref={root}
        className="cinema"
        style={{ "--scene": item.color } as React.CSSProperties}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured engineering projects"
        tabIndex={0}
        onKeyDown={(e) => {
          if (
            e.target instanceof HTMLAnchorElement ||
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLSelectElement
          )
            return;
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            select(index + (e.key === "ArrowRight" ? 1 : -1));
          }
          if (e.key === "Home") {
            e.preventDefault();
            select(0);
          }
          if (e.key === "End") {
            e.preventDefault();
            select(projects.length - 1);
          }
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          start.current = { x: t.clientX, y: t.clientY };
        }}
        onTouchEnd={(e) => {
          if (!start.current) return;
          const t = e.changedTouches[0],
            dx = t.clientX - start.current.x,
            dy = t.clientY - start.current.y;
          const offset = swipeDirection(dx, dy);
          if (offset) select(index + offset);
          start.current = null;
        }}
      >
        <div className="cinema-meta">
          <span>ENGINEERING COLLECTION</span>
          <span className="cinema-counter">
            {String(index + 1).padStart(2, "0")} <i>/ 07</i>
          </span>
          <span>{item.category}</span>
        </div>
        <div
          className={"cinema-stage scene-" + item.id}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of 7: ${item.name}`}
        >
          <div className="cinema-image">
            {item.image ? (
              <img
                key={item.image}
                src={item.image}
                alt={item.alt}
                width={item.id === "rescuer-sathi" ? 720 : 1100}
                height={item.id === "rescuer-sathi" ? 1612 : 733}
                loading="lazy"
              />
            ) : (
              <div className="type-cover">
                <span aria-hidden="true">
                  {item.id === "rakshak" ? "↗" : "UTC"}
                </span>
                <strong>{item.name}</strong>
                <small>
                  {item.id === "rakshak"
                    ? "NARAYANI / EXPERIMENTAL EVIDENCE"
                    : "COMMUNITY / EVENTS / IDEAS"}
                </small>
              </div>
            )}
            <span className="media-caption">{item.label}</span>
          </div>
          <div className="cinema-copy">
            <p className="eyebrow">{item.category}</p>
            <h3>{item.name}</h3>
            <p className="scene-subtitle">{item.subtitle}</p>
            <p>{item.description}</p>
            <ul className="tags">
              {item.stack.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <div className="scene-actions">
              <button
                ref={demoTrigger}
                className="button primary"
                aria-expanded={demo}
                aria-controls="project-demo"
                onClick={() => {
                  setDemo(!demo);
                  playSound(demo ? "close" : "open");
                }}
              >
                {demo ? "Close demonstration" : "Explore interactive demo"}
              </button>
              {item.url && (
                <a
                  className="button primary"
                  href={item.url}
                  {...(item.url.startsWith("https")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  onClick={() => playSound("open")}
                >
                  {item.url.endsWith(".html")
                    ? "Read case study"
                    : "Visit website"}{" "}
                  ↗
                </a>
              )}
              {item.live && (
                <a href={item.live} target="_blank" rel="noopener noreferrer">
                  Live Sentinel AI ↗
                </a>
              )}
              {item.repo && (
                <a href={item.repo} target="_blank" rel="noopener noreferrer">
                  {item.id === "rakshak"
                    ? "Private repository ↗"
                    : "GitHub ↗"}
                </a>
              )}
              {!item.url && !item.repo && (
                <a href="#contact">Ask about this project ↗</a>
              )}
            </div>
          </div>
        </div>
        <div className="cinema-controls">
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => select(index - 1)}
          >
            ←
          </button>
          <div className="scene-track">
            {projects.map((p, i) => (
              <button
                type="button"
                key={p.id}
                aria-label={`Show ${p.name}`}
                aria-pressed={i === index}
                onClick={() => select(i)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <i />
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => select(index + 1)}
          >
            →
          </button>
        </div>
        <p className="sr-only" role="status">
          Project {index + 1} of 7: {item.name}
        </p>
      </div>
      <noscript>
        <p>
          Interactive demonstrations require JavaScript. The project
          documentation below remains available.
        </p>
      </noscript>
      <p className="gallery-hint">
        Choose a number · Use arrow keys · Swipe on mobile{" "}
        <span>No autoplay. Explore at your pace.</span>
      </p>
      {demo && (
        <DemoPanel
          id={item.id}
          onClose={() => {
            setDemo(false);
            demoTrigger.current?.focus({ preventScroll: true });
          }}
        />
      )}
      <details className="project-index" open={enhanced ? undefined : true}>
        <summary onClick={() => playSound("open")}>
          Browse project documentation{" "}
          <span>Technical detail, sources, and project boundaries ↗</span>
        </summary>
        <ProjectArchive />
        <div className="pending-projects">
          {projects
            .filter((p) => p.id === "rakshak" || p.id === "united-tech-club")
            .map((p) => (
              <article id={"project-" + p.id} key={p.id}>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer">
                    Visit website ↗
                  </a>
                )}
              </article>
            ))}
        </div>
      </details>
    </section>
  );
}

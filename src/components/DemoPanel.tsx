import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { projects } from "../data/projects";
import { playSound } from "../utils/sound.js";

const Relay = lazy(() => import("../demos/Relay"));
const Authorization = lazy(() => import("../demos/Authorization"));
const Geospatial = lazy(() => import("../demos/Geospatial"));
const Previews = lazy(() => import("../demos/Previews"));
class DemoBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p role="alert">
        The interactive preview could not load. Project documentation remains
        available below. Close and reopen to retry, or refresh the page.
      </p>
    ) : (
      this.props.children
    );
  }
}
export function DemoPanel({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const project = projects.find((p) => p.id === id)!;
  useEffect(() => {
    heading.current?.focus();
    heading.current?.scrollIntoView({ block: "start" });
  }, []);
  return (
    <section
      id="project-demo"
      className="demo-panel"
      aria-labelledby="demo-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <header className="demo-header">
        <div>
          <p className="eyebrow">THE LAB / INTERACTIVE FIELD NOTES</p>
          <h3 id="demo-title" ref={heading} tabIndex={-1}>
            {project.name}
          </h3>
          <p>
            {id === "united-tech-club"
              ? "Verified website captures with interactive presentation."
              : "Browser demonstration · illustrative data · no live services"}
          </p>
        </div>
        <button
          onClick={() => {
            playSound("close");
            onClose();
          }}
          aria-label="Close interactive demonstration"
        >
          Close ×
        </button>
      </header>
      <DemoBoundary key={id}>
        <Suspense
          fallback={
            <p role="status" className="demo-loading">
              Loading interactive module…
            </p>
          }
        >
          {id === "rescuer-sathi" ? (
            <Relay />
          ) : id === "sentinel-ai" ? (
            <Authorization />
          ) : id === "rakshak" ? (
            <Geospatial />
          ) : (
            <Previews id={id} />
          )}
        </Suspense>
      </DemoBoundary>
    </section>
  );
}

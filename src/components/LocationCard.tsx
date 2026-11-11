import {
  Component,
  type ReactNode,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
const Globe = lazy(() => import("./Globe"));
class GlobeFallback extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export function LocationCard() {
  const root = useRef<HTMLElement>(null),
    [load, setLoad] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" },
    );
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  const fallback = (
    <img
      src="assets/geo/globe-fallback.svg"
      width="440"
      height="440"
      loading="lazy"
      alt="Earth centered on Asia with Nepal marked approximately"
    />
  );
  return (
    <aside
      className="location-card"
      ref={root}
      aria-labelledby="location-title"
    >
      <div className="location-heading">
        <p className="eyebrow">LOCAL ROOTS / GLOBAL CURIOSITY</p>
        <span className="location-status">Open to connections</span>
      </div>
      <h3 id="location-title">
        Building from
        <br />
        <em>Bharatpur, Nepal.</em>
      </h3>
      <div className="globe-slot">
        {load ? (
          <GlobeFallback fallback={fallback}>
            <Suspense fallback={fallback}>
              <Globe />
            </Suspense>
          </GlobeFallback>
        ) : (
          fallback
        )}
      </div>
      <div className="location-caption">
        <span>CHITWAN / NEPAL</span>
        <span>Computer Engineering</span>
      </div>
      <p className="location-source">
        Regional location only. Coastlines:{" "}
        <a
          href="https://www.naturalearthdata.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Natural Earth ↗
        </a>
        . No device location is requested.
      </p>
    </aside>
  );
}

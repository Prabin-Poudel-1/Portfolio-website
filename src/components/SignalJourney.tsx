import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
const stages = [
  ["skill", "Technical foundation"],
  ["expertise", "Engineering capabilities"],
  ["about", "Study & identity"],
  ["contact", "Make a connection"],
];
export function SignalJourney({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null),
    svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const element = root.current,
      graphic = svg.current;
    if (!element || !graphic) return;
    gsap.registerPlugin(ScrollTrigger);
    const sections = stages.map(
      ([id]) => element.querySelector<HTMLElement>("#" + id)!,
    );
    const base = graphic.querySelector<SVGPathElement>(".signal-base")!,
      fill = graphic.querySelector<SVGPathElement>(".signal-fill")!,
      head = graphic.querySelector<SVGCircleElement>(".signal-head")!;
    const nodes = Array.from(
      graphic.querySelectorAll<SVGCircleElement>(".signal-node"),
    );
    let staticMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let total = 1,
      positions: number[] = [],
      triggers: ScrollTrigger[] = [],
      resizeFrame = 0;
    function layout() {
      const box = element!.getBoundingClientRect();
      positions = sections.map(
        (s) => s.getBoundingClientRect().top - box.top + 80,
      );
      let d = `M28 ${positions[0]}`;
      for (let i = 1; i < positions.length; i++) {
        const mid = (positions[i - 1] + positions[i]) / 2;
        d += ` L28 ${mid - 30} Q28 ${mid - 14} 14 ${mid} Q6 ${mid + 8} 14 ${mid + 24} L28 ${mid + 44} L28 ${positions[i]}`;
      }
      base.setAttribute("d", d);
      fill.setAttribute("d", d);
      graphic!.setAttribute("viewBox", `0 0 56 ${box.height}`);
      nodes.forEach((n, i) => n.setAttribute("cy", String(positions[i])));
      total = fill.getTotalLength();
      fill.style.strokeDasharray = String(total);
      draw();
    }
    function draw(progress?: number) {
      if (staticMotion) {
        fill.style.strokeDashoffset = "0";
        sections.forEach((s) => (s.dataset.signal = "connected"));
        nodes.forEach((n) => n.classList.add("connected"));
        return;
      }
      const top = element!.getBoundingClientRect().top;
      const y = Math.max(
        positions[0] || 0,
        Math.min(
          positions.at(-1) || 1,
          progress === undefined
            ? innerHeight * 0.5 - top
            : positions[0] + progress * (positions.at(-1)! - positions[0]),
        ),
      );
      let low = 0,
        high = total;
      for (let i = 0; i < 14; i++) {
        const middle = (low + high) / 2;
        if (fill.getPointAtLength(middle).y < y) low = middle;
        else high = middle;
      }
      const distance = (low + high) / 2,
        point = fill.getPointAtLength(distance);
      fill.style.strokeDashoffset = String(total - distance);
      head.setAttribute("cx", String(point.x));
      head.setAttribute("cy", String(point.y));
      graphic!.dataset.progress = (distance / total).toFixed(3);
      sections.forEach((s, i) => {
        const reached = y >= positions[i] - 1;
        s.dataset.signal = reached ? "connected" : "pending";
        nodes[i].classList.toggle("connected", reached);
      });
    }
    layout();
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      staticMotion = false;
      const progress = { value: 0 };
      const tween = gsap.to(progress, {
        value: 1,
        ease: "none",
        onUpdate: () => draw(progress.value),
        scrollTrigger: {
          trigger: element,
          start: () => `top+=${positions[0]} center`,
          end: () => `top+=${positions.at(-1)} center`,
          scrub: 0.3,

          onRefresh: layout,
        },
      });
      triggers = sections.map((s) =>
        ScrollTrigger.create({
          trigger: s,
          start: "top 80%",
          end: "bottom 20%",
          onToggle: (self) =>
            s.classList.toggle("signal-current", self.isActive),
        }),
      );
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        triggers.forEach((t) => t.kill());
      };
    });
    media.add("(prefers-reduced-motion: reduce)", () => {
      staticMotion = true;
      sections.forEach((s) => (s.dataset.signal = "connected"));
      fill.style.strokeDashoffset = "0";
      nodes.forEach((n) => n.classList.add("connected"));
      return () => {};
    });
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        layout();
        ScrollTrigger.refresh();
      });
    });
    observer.observe(element);
    return () => {
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      media.revert();
    };
  }, []);
  return (
    <div className="signal-journey" ref={root}>
      <svg
        ref={svg}
        className="signal-rail"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path className="signal-base" />
        <path className="signal-fill" />
        {stages.map(([id]) => (
          <circle key={id} className="signal-node" cx="28" r="7" />
        ))}
        <circle className="signal-head" r="4" />
      </svg>
      <nav className="journey-guide" aria-label="Engineering story">
        <span>FOLLOW THE SIGNAL</span>
        {stages.map(([id, title], i) => (
          <a href={"#" + id} key={id}>
            <b>0{i + 1}</b>
            {title}
          </a>
        ))}
      </nav>
      {children}
    </div>
  );
}

import React, { memo, useEffect, useRef, useState } from "react";
import { createTypewriter, interests } from "../utils/typewriter";

export const HeroInterests = memo(function HeroInterests() {
  // A useful static phrase is also present in prerendered HTML without JavaScript.
  const [text, setText] = useState<string>(interests[0]);
  const [paused, setPaused] = useState(false);
  const [animated, setAnimated] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const userPaused = useRef(false);
  const sync = useRef<() => void>(() => {});

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let controller: ReturnType<typeof createTypewriter> | undefined;
    let visible = true;
    const update = () => controller?.pause(userPaused.current || document.hidden || !visible);
    sync.current = update;
    const configure = () => {
      controller?.dispose();
      controller = undefined;
      setAnimated(!motion.matches);
      if (motion.matches) setText(interests[0]);
      else {
        controller = createTypewriter(setText);
        update();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    if (container.current) observer.observe(container.current);
    configure();
    motion.addEventListener("change", configure);
    document.addEventListener("visibilitychange", update);
    return () => {
      controller?.dispose();
      observer.disconnect();
      motion.removeEventListener("change", configure);
      document.removeEventListener("visibilitychange", update);
      sync.current = () => {};
    };
  }, []);

  return (
    <div className="hero-interests" ref={container} data-running={animated && !paused}>
      <span className="sr-only">Technical interests: {interests.join(", ")}.</span>
      <div className="interests-caption">
        <span aria-hidden="true">Exploring & building</span>
        {animated && (
          <button type="button" className="interests-pause"
            aria-label={paused ? "Resume rotating interests" : "Pause rotating interests"}
            onClick={() => {
              userPaused.current = !userPaused.current;
              setPaused(userPaused.current);
              sync.current();
            }}>
            <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
          </button>
        )}
      </div>
      <div className="interests-stage" aria-hidden="true">
        {interests.map((phrase) => (
          <span className="interests-reserve" key={phrase}>{phrase}<i className="typing-cursor" /></span>
        ))}
        <span className="interests-typed">{text}<i className="typing-cursor" /></span>
      </div>
    </div>
  );
});

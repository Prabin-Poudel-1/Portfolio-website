import { CustomCursor } from "./CustomCursor";
import { useEffect } from "react";
import { gsap } from "gsap";
import { playSound } from "../utils/sound.js";
export function InteractionEffects() {
  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let target: HTMLElement | null = null;
    const reset = () => {
      if (target) {
        gsap.to(target, { x: 0, y: 0, duration: 0.2, clearProps: "transform" });
        target = null;
      }
    };
    const move = (e: PointerEvent) => {
      if (!fine.matches || reduced.matches) return;
      const el = (e.target as Element).closest<HTMLElement>(
        ".hero-actions .button",
      );
      if (!el) {
        reset();
        return;
      }
      if (target !== el) reset();
      target = el;
      const rect = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - rect.left - rect.width / 2) * 0.06,
        y: (e.clientY - rect.top - rect.height / 2) * 0.08,
        duration: 0.2,
        overwrite: true,
      });
    };
    const success = () => playSound("success");
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", reset);
    window.addEventListener("portfolio:success", success);
    return () => {
      reset();
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", reset);
      window.removeEventListener("portfolio:success", success);
    };
  }, []);
  return <CustomCursor />;
}

/** One bounded rAF loop per visual, suspended offscreen/hidden/reduced-motion. */
export function animateHero(element: HTMLElement, draw: (seconds: number, elapsed: number) => void) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, previous = 0, elapsed = 0, visible = false, disposed = false;
  const tick = (now: number) => {
    const dt = Math.min((now - previous) / 1000 || 0, .04);
    previous = now;
    elapsed += dt;
    draw(dt, elapsed);
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (!disposed && visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  observer.observe(element);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    document.removeEventListener('visibilitychange', sync);
    reduced.removeEventListener('change', sync);
  };
}

export const interests = [
  "Software Engineering",
  "AI & Machine Learning",
  "Cybersecurity",
  "Full-Stack Development",
  "Building Real-World Solutions",
] as const;

// One scheduled character at a time. Pause keeps the current phrase and position.
export function createTypewriter(
  render: (text: string) => void,
  schedule: (fn: () => void, delay: number) => number = (fn, delay) => window.setTimeout(fn, delay),
  cancel: (id: number) => void = (id) => window.clearTimeout(id),
) {
  let phrase = 0, count = 0, erasing = false, paused = false, disposed = false;
  let timer: number | undefined;
  let delay = 900; // Let the existing hero entrance settle first.
  const queue = () => {
    if (!paused && !disposed) timer = schedule(tick, delay);
  };
  const tick = () => {
    timer = undefined;
    if (paused || disposed) return;
    const text = interests[phrase];
    count += erasing ? -1 : 1;
    render(text.slice(0, count));
    if (!erasing && count === text.length) {
      erasing = true;
      delay = 2600;
    } else if (erasing && count === 0) {
      phrase = (phrase + 1) % interests.length;
      erasing = false;
      delay = 400;
    } else {
      delay = erasing ? 32 : text[count - 1] === " " ? 140 : 58 + (count % 4) * 13;
    }
    queue();
  };
  render("");
  queue();
  return {
    pause(value: boolean) {
      if (paused === value || disposed) return;
      paused = value;
      if (timer !== undefined) cancel(timer);
      timer = undefined;
      if (!paused) queue();
    },
    dispose() {
      disposed = true;
      if (timer !== undefined) cancel(timer);
      timer = undefined;
    },
  };
}

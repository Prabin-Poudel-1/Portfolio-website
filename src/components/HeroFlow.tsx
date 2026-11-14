import { useEffect, useState } from 'react';
import { GoldenSmoke } from './GoldenSmoke';
import { LightDust } from './LightDust';

/**
 * Dark mode: original golden smoke cloud from the earlier screenshot.
 * Light mode: newer, wider GPU dust field.
 * Exactly one renderer mounts at a time, retaining pause/reduced-motion cleanup.
 */
export function HeroFlow({ paused }: { paused: boolean }) {
  // Stable initial output preserves the existing SSR/hydration structure.
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTheme(root.dataset.theme === 'light' ? 'light' : 'dark');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return theme === 'light'
    ? <LightDust paused={paused} />
    : <GoldenSmoke paused={paused} />;
}

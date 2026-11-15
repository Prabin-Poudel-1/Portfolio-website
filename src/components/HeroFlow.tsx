import { lazy, Suspense, useSyncExternalStore } from 'react';

const GoldenSmoke = lazy(() => import('./GoldenSmoke').then(module => ({ default: module.GoldenSmoke })));
const PARTICLE_MEDIA = '(min-width: 768px) and (prefers-reduced-motion: no-preference)';
function subscribe(notify: () => void) {
  const media = window.matchMedia(PARTICLE_MEDIA);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
}
const desktopEnabled = () => window.matchMedia(PARTICLE_MEDIA).matches;
const serverDisabled = () => false;

/** Gate before rendering the lazy component: phones never request its chunk.
 * The false server snapshot also keeps the initial hydration render identical.
 */
export function HeroFlow({ paused }: { paused: boolean }) {
  const enabled = useSyncExternalStore(subscribe, desktopEnabled, serverDisabled);
  return enabled ? <Suspense fallback={null}><GoldenSmoke paused={paused} /></Suspense> : null;
}

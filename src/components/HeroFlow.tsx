import { GoldenSmoke } from './GoldenSmoke';

/**
 * The Canvas 2D sculpture is used for both themes.
 * The previously separate WebGL light theme could disappear on some browsers
 * and its low-alpha points were difficult to see against an ivory background.
 * GoldenSmoke already handles live theme-palette changes, eight forms,
 * the 1.5x star count (with unchanged dust), hover interaction, and reduced motion.
 */
export function HeroFlow({ paused }: { paused: boolean }) {
  return <GoldenSmoke paused={paused} />;
}

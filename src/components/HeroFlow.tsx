import { GoldenSmoke } from './GoldenSmoke';

/** Shared desktop sculpture/nebula; GoldenSmoke owns viewport and motion gating. */
export function HeroFlow({ paused }: { paused: boolean }) {
  return <GoldenSmoke paused={paused} />;
}

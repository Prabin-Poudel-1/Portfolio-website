export type Vec3 = [number, number, number];
export type Coordinate = [number, number];
const rad = Math.PI / 180;
export function project(
  [lon, lat]: Coordinate,
  longitude: number,
  tilt: number,
): Vec3 {
  const a = (lon - longitude) * rad,
    b = lat * rad,
    t = tilt * rad;
  const x = Math.cos(b) * Math.sin(a),
    y = Math.sin(b),
    z = Math.cos(b) * Math.cos(a);
  return [
    x,
    y * Math.cos(t) - z * Math.sin(t),
    y * Math.sin(t) + z * Math.cos(t),
  ];
}
// Clip against the visible hemisphere; normalize horizon intersections onto the sphere.
export function frontRing(points: Vec3[]): Vec3[] {
  const output: Vec3[] = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[(i + points.length - 1) % points.length],
      b = points[i];
    if (a[2] >= 0 !== b[2] >= 0) {
      const t = a[2] / (a[2] - b[2]),
        x = a[0] + t * (b[0] - a[0]),
        y = a[1] + t * (b[1] - a[1]),
        len = Math.hypot(x, y) || 1;
      output.push([x / len, y / len, 0]);
    }
    if (b[2] >= 0) output.push(b);
  }
  return output;
}
export function wrapLongitude(value: number) {
  return ((((value + 180) % 360) + 360) % 360) - 180;
}
export function clampTilt(value: number) {
  return Math.max(-55, Math.min(55, value));
}

export function advanceRotation(
  lon: number,
  velocity: number,
  dt: number,
  auto: boolean,
  reduced: boolean,
  interacting: boolean,
) {
  if (reduced) return { lon, velocity: 0 };
  if (interacting) return { lon, velocity };
  const nextVelocity = Math.abs(velocity * 0.91) < 0.001 ? 0 : velocity * 0.91;
  return {
    lon: wrapLongitude(lon + (velocity * dt) / 16 + (auto ? dt * 0.0025 : 0)),
    velocity: nextVelocity,
  };
}

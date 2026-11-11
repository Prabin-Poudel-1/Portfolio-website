import type { Coordinate } from "./globeMath";

// Rasterize the existing seam-split geographic rings once, then sample their
// coverage on the sphere. No horizon-clipped polygon is closed across the disc.
export function createLandRenderer(rings: Coordinate[][], resolution: number) {
  const map = document.createElement("canvas");
  map.width = 2048;
  map.height = 1024;
  const mapContext = map.getContext("2d", { willReadFrequently: true })!;
  mapContext.fillStyle = "white";
  for (const ring of rings) {
    mapContext.beginPath();
    ring.forEach(([lon, lat], i) => {
      const x = (lon + 180) / 360 * map.width;
      const y = (90 - lat) / 180 * map.height;
      if (i) mapContext.lineTo(x, y); else mapContext.moveTo(x, y);
    });
    mapContext.closePath();
    mapContext.fill();
  }
  const rgba = mapContext.getImageData(0, 0, map.width, map.height).data;
  const mask = new Uint8Array(map.width * map.height);
  for (let i = 0; i < mask.length; i++) mask[i] = rgba[i * 4 + 3];
  const texture = document.createElement("canvas");
  texture.width = texture.height = resolution;
  const ctx = texture.getContext("2d")!;
  const image = ctx.createImageData(resolution, resolution);
  const pixels: { offset: number; x: number; y: number; z: number }[] = [];
  for (let row = 0; row < resolution; row++) {
    for (let col = 0; col < resolution; col++) {
      const x = (col + .5) / resolution * 2 - 1;
      const y = 1 - (row + .5) / resolution * 2;
      const zz = 1 - x * x - y * y;
      if (zz >= 0) pixels.push({ offset: (row * resolution + col) * 4, x, y, z: Math.sqrt(zz) });
    }
  }
  let previousColor = "", rgb = [170, 181, 212];
  return (longitude: number, tilt: number, color: string) => {
    const angle = tilt * Math.PI / 180, sin = Math.sin(angle), cos = Math.cos(angle);
    // Use canvas color parsing so the existing theme tokens remain authoritative.
    if (color !== previousColor) {
      mapContext.clearRect(0, 0, 1, 1);
      mapContext.fillStyle = color;
      mapContext.fillRect(0, 0, 1, 1);
      rgb = Array.from(mapContext.getImageData(0, 0, 1, 1).data).slice(0, 3);
      previousColor = color;
    }
    const [r, g, b] = rgb;
    for (const p of pixels) {
      const lat = Math.asin(Math.max(-1, Math.min(1, p.y * cos + p.z * sin)));
      const lon = Math.atan2(p.x, p.z * cos - p.y * sin) + longitude * Math.PI / 180;
      const u = ((lon / (2 * Math.PI) + .5) % 1 + 1) % 1 * map.width - .5;
      const v = Math.max(0, Math.min(map.height - 1, (.5 - lat / Math.PI) * map.height - .5));
      const ux = Math.floor(u), vy = Math.floor(v), fx = u - ux, fy = v - vy;
      const left = (ux + map.width) % map.width, right = (left + 1) % map.width;
      const bottom = Math.min(map.height - 1, vy + 1);
      const topAlpha = mask[vy * map.width + left] * (1 - fx) + mask[vy * map.width + right] * fx;
      const bottomAlpha = mask[bottom * map.width + left] * (1 - fx) + mask[bottom * map.width + right] * fx;
      image.data[p.offset] = r;
      image.data[p.offset + 1] = g;
      image.data[p.offset + 2] = b;
      image.data[p.offset + 3] = topAlpha * (1 - fy) + bottomAlpha * fy;
    }
    ctx.putImageData(image, 0, 0);
    return texture;
  };
}

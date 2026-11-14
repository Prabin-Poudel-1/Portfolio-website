import { useEffect, useRef } from 'react';
import { animateHero } from '../utils/heroMotion';

// Original, self-contained GPU particle sculpture: no external textures or copied assets.
const vertexSource = `
precision highp float;
attribute vec3 aPosition;
attribute vec4 aDetail;
uniform vec2 uResolution;
uniform vec2 uOrigin;
uniform vec2 uPointer;
uniform float uActive;
uniform float uPress;
uniform vec2 uMotion;
uniform float uSpeed;
uniform float uTime;
uniform float uScale;
uniform float uDpr;
uniform float uDark;
varying float vLight;
varying float vDepth;
varying float vHaze;
varying float vOpacity;
void main() {
  vec3 p = aPosition;
  // Only the light theme becomes a wider, free-floating field of fine dust.
  // The dark theme keeps its original sculpture geometry and movement.
  if (uDark < .5) {
    p.x = p.x * 1.28 + .11 * sin(aDetail.y * 57. + aDetail.x * 19.);
    p.y = p.y * 1.10 + .075 * cos(aDetail.y * 37. + aDetail.x * 23.);
    p.x += .025 * sin(uTime * .55 + aDetail.y * 38.);
    p.y += .019 * cos(uTime * .48 + aDetail.y * 34.);
  }
  p.x += .048 * sin(p.y * 7.2 + uTime * .26 + aDetail.y * 5.);
  p.y += .048 * cos(p.x * 5.8 - uTime * .22 + aDetail.y * 5.);
  float c = cos(uTime * .054), s = sin(uTime * .054);
  p = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  float depth = 1.32 / (1.65 - p.z * .23);
  vec2 point = uOrigin + vec2(p.x, -p.y) * uScale * depth;
  float distanceToCursor = length(point - uPointer);
  // Restore the magnetic golden vortex from the older interactive smoke study.
  // At rest (uActive = 0), the approved dark sculpture stays identical.
  float influence = uActive * (1. - smoothstep(18., 315., distanceToCursor));
  float field = influence * influence;
  vec2 normal = normalize(point - uPointer + vec2(.001));
  vec2 tangent = vec2(-normal.y, normal.x);
  float swirl = 26. + uPress * 25. + min(uSpeed, 2.5) * 9.;
  point += tangent * field * swirl;
  point += normal * field * (8. + uPress * 14.);
  point += uMotion * field * min(uSpeed, 2.5) * 12.;
  vec2 clip = point / uResolution * 2. - 1.;
  gl_Position = vec4(clip.x, -clip.y, 0., 1.);
  vLight = influence;
  vDepth = .40 + smoothstep(-.9, .9, p.z) * .60;
  vHaze = aDetail.z;
  vOpacity = aDetail.w;
  float size = mix(1.2 + aDetail.x * 2.4, 13. + aDetail.x * 21., vHaze);
  if (uDark < .5) {
    // Smaller point sprites prevent a muddy fog on the ivory background.
    size = mix(.9 + aDetail.x * 1.9, 4.2 + aDetail.x * 5.8, vHaze);
  }
  gl_PointSize = min(64., size * uDpr * (.70 + depth * .45));
}`;
const fragmentSource = `
precision mediump float;
uniform vec3 uNeutral;
uniform vec3 uGold;
uniform vec3 uFlare;
uniform float uDark;
varying float vLight;
varying float vDepth;
varying float vHaze;
varying float vOpacity;
void main() {
  vec2 uv = gl_PointCoord * 2. - 1.;
  float r2 = dot(uv, uv);
  if (r2 > 1.) discard;
  float kernel = exp(-r2 * 3.7);
  float fog = exp(-r2 * 2.9);
  float light = pow(vLight, 1.12);
  // Warm, restrained gold at rest; cursor proximity turns nearby dust light blue.
  vec3 color = mix(uNeutral, uGold, light * .82);
  color = mix(color, uFlare, pow(vLight, 2.4) * .78);
  color *= mix(.5, 1.22, vDepth);
  float alpha = mix(kernel * .59, fog * .13, vHaze) * vOpacity;
  if (uDark < .5) {
    // Fine, high-definition dust specks rather than broad translucent smoke.
    float fleck = pow(max(0., 1. - r2), 4.8);
    alpha = mix(fleck * .88, exp(-r2 * 5.) * .21, vHaze) * vOpacity * .81;
  }
  alpha *= 1. + light * (uDark > .5 ? 1.55 : .95);
  gl_FragColor = vec4(color, alpha);
}`;
function channel(hex: string, backup: string): [number, number, number] {
  let h = (hex || backup).trim().replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) h = backup.slice(1);
  const n = parseInt(h, 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}
function cloud(count: number) {
  const data = new Float32Array(count * 7);
  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const r = (Math.random() + Math.random() + Math.random() - 1.5) * .14;
    const b = (Math.random() * 2 - 1) * (.16 + .1 * Math.cos(3 * t));
    const k = i * 7;
    data[k] = .69 * Math.sin(t) + .34 * Math.sin(t * 2.13 + .82) + b * Math.cos(2.6 * t) + r;
    data[k + 1] = .56 * Math.cos(t * 1.17) + .26 * Math.sin(t * 2.83 + .25) + b * Math.sin(2.1 * t) + r * .8;
    data[k + 2] = .48 * Math.sin(t * 1.76 + .75) + .17 * Math.cos(t * 3.2) + b * 1.7 + r * 1.2;
    data[k + 3] = Math.random();
    data[k + 4] = Math.random();
    data[k + 5] = Math.random() < .15 ? 1 : 0;
    data[k + 6] = .38 + Math.random() * .62;
  }
  return data;
}
export function LightDust({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const hero = canvas?.parentElement;
    if (!canvas || !hero) return;
    const gl = canvas.getContext('webgl', { alpha: true, depth: false, antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Hero particle shader:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Hero particle link:', gl.getProgramInfoLog(program));
      return;
    }
    const buffer = gl.createBuffer();
    if (!buffer) return;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const position = gl.getAttribLocation(program, 'aPosition');
    const detail = gl.getAttribLocation(program, 'aDetail');
    gl.enableVertexAttribArray(position);
    gl.enableVertexAttribArray(detail);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 28, 0);
    gl.vertexAttribPointer(detail, 4, gl.FLOAT, false, 28, 12);
    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const U = {
      resolution: uniform('uResolution'), origin: uniform('uOrigin'),
      pointer: uniform('uPointer'), active: uniform('uActive'),
      press: uniform('uPress'), motion: uniform('uMotion'),
      speed: uniform('uSpeed'), time: uniform('uTime'), scale: uniform('uScale'),
      dpr: uniform('uDpr'), neutral: uniform('uNeutral'),
      gold: uniform('uGold'), flare: uniform('uFlare'), dark: uniform('uDark'),
    };
    let width = 1, height = 1, dpr = 1, count = 0;
    let dark = true, bounds = hero.getBoundingClientRect();
    let neutral: [number, number, number] = [0.77, 0.77, 0.79];
    let gold: [number, number, number] = [.89, .74, .48];
    let flare: [number, number, number] = [1, .89, .64];
    const pointer = {
      x: -5000, y: -5000, tx: -5000, ty: -5000,
      active: 0, inside: false, pressed: false,
      directionX: 0, directionY: 0, speed: 0, lastTime: 0,
    };
    const palette = () => {
      dark = document.documentElement.dataset.theme !== 'light';
      const css = getComputedStyle(hero);
      neutral = channel(css.getPropertyValue('--sculpture-base'), dark ? '#C4C5C8' : '#64626A');
      gold = channel(css.getPropertyValue('--sculpture-gold'), dark ? '#E3BC7B' : '#B57B2F');
      flare = channel(css.getPropertyValue('--sculpture-flare'), dark ? '#FFE4A3' : '#E7AB4B');
    };
    const resize = () => {
      bounds = hero.getBoundingClientRect();
      width = Math.max(1, hero.clientWidth);
      height = Math.max(1, hero.clientHeight);
      dpr = Math.min(window.devicePixelRatio || 1, 1.65);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      const nextCount = width < 700 ? 6500 : Math.round(Math.min(22000, Math.max(12000, width * height / 62)));
      if (nextCount !== count) {
        count = nextCount;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, cloud(count), gl.STATIC_DRAW);
      }
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const now = performance.now();
      const nextX = e.clientX - bounds.left;
      const nextY = e.clientY - bounds.top;
      if (pointer.inside && pointer.lastTime > 0) {
        const deltaX = nextX - pointer.tx;
        const deltaY = nextY - pointer.ty;
        const travel = Math.hypot(deltaX, deltaY);
        const milliseconds = Math.max(8, now - pointer.lastTime);
        if (travel > .01) {
          pointer.directionX = deltaX / travel;
          pointer.directionY = deltaY / travel;
          pointer.speed = Math.min(2.5, travel / milliseconds);
        }
      }
      pointer.tx = nextX;
      pointer.ty = nextY;
      pointer.lastTime = now;
      pointer.inside = true;
      if (pointer.x < 0) { pointer.x = nextX; pointer.y = nextY; }
    };
    const leave = () => { pointer.inside = false; pointer.pressed = false; };
    const press = (e: PointerEvent) => { if (e.pointerType !== 'touch') pointer.pressed = true; };
    const release = () => { pointer.pressed = false; };
    const scroll = () => { bounds = hero.getBoundingClientRect(); pointer.inside = false; };
    const draw = (dt: number, time: number) => {
      if (gl.isContextLost()) return;
      const ease = 1 - Math.exp(-dt * 14);
      pointer.x += (pointer.tx - pointer.x) * ease;
      pointer.y += (pointer.ty - pointer.y) * ease;
      pointer.active += ((pointer.inside ? 1 : 0) - pointer.active) * (1 - Math.exp(-dt * 6));
      pointer.speed *= Math.exp(-dt * 5);
      pointer.directionX *= Math.exp(-dt * 2);
      pointer.directionY *= Math.exp(-dt * 2);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.blendFunc(gl.SRC_ALPHA, dark ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform2f(U.resolution, width, height);
      gl.uniform2f(U.origin, width * (width < 700 ? .51 : .465), height * (width < 700 ? .47 : .51));
      gl.uniform2f(U.pointer, pointer.x, pointer.y);
      gl.uniform1f(U.active, pointer.active);
      gl.uniform1f(U.press, pointer.pressed ? 1 : 0);
      gl.uniform2f(U.motion, pointer.directionX, pointer.directionY);
      gl.uniform1f(U.speed, pointer.speed);
      gl.uniform1f(U.time, time);
      gl.uniform1f(U.scale, Math.min(width * (width < 700 ? .33 : .205), height * .35, 310));
      gl.uniform1f(U.dpr, dpr);
      gl.uniform3fv(U.neutral, neutral);
      gl.uniform3fv(U.gold, gold);
      gl.uniform3fv(U.flare, flare);
      gl.uniform1f(U.dark, dark ? 1 : 0);
      gl.drawArrays(gl.POINTS, 0, count);
    };
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    resize(); palette();
    const resizer = new ResizeObserver(resize); resizer.observe(hero);
    const theme = new MutationObserver(palette);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', leave);
    hero.addEventListener('pointerdown', press, { passive: true });
    window.addEventListener('pointerup', release, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    const stop = paused ? () => {} : animateHero(hero, draw);
    return () => {
      stop(); resizer.disconnect(); theme.disconnect();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', leave);
      hero.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', resize);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [paused]);
  return <canvas className="hero-flow" ref={ref} aria-hidden="true" />;
}

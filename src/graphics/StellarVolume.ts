/** Continuous 3D atmospheric integration; Canvas2D still draws the crisp stars.
 * No bloom chain, fullscreen fog, external textures, or graphics dependency.
 */
// Shared by the GLSL pass and Canvas fallback, with deliberately bounded opacity.
const GLOBAL_NEBULA_ALPHA = .075;
const GLOBAL_TEXT_FLOOR = .68;
const GLOBAL_TEXT_FEATHER = 180;
export function globalNebulaOpacity(optical: number, u: number, textDistance: number) {
  const edge = Math.max(0, Math.min(1, textDistance / GLOBAL_TEXT_FEATHER));
  const across = Math.max(0, Math.min(1, (u - .05) / .90));
  const attenuation = GLOBAL_TEXT_FLOOR + (1 - GLOBAL_TEXT_FLOOR) * edge * edge * (3 - 2 * edge);
  const composition = .72 + .28 * across * across * (3 - 2 * across);
  return GLOBAL_NEBULA_ALPHA * (1 - Math.exp(-Math.max(0, optical) * 1.4)) * attenuation * composition;
}

const vertexSource = `#version 300 es
precision highp float;
out vec2 uv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;
const fragmentSource = `#version 300 es
precision highp float;
precision highp sampler3D;
in vec2 uv;
out vec4 color;
uniform sampler3D field;
uniform vec2 viewport;
uniform vec2 center;
uniform vec2 spread;
uniform vec4 textBounds;
uniform float gridSize;
uniform float elapsed;
uniform int steps;
uniform vec3 shadowColor;
uniform vec3 scatterColor;
uniform vec3 lightColor;

// Continuous spatial structure, never a random value generated per frame.
float structure(vec3 p) {
  float large = sin(p.x * 3.2 + p.z * 2.4 - elapsed * .09)
    * cos(p.y * 3.7 + elapsed * .07);
  float medium = sin(p.x * 9.0 + p.y * 5.6 + large * 1.7)
    * cos(p.z * 7.8 - p.y * 3.2 + elapsed * .11);
  float fine = sin(dot(p, vec3(21.0, -17.0, 13.0)) + medium + elapsed * .13);
  return max(.06, .48 + .40 * large + .30 * medium + .12 * fine);
}
vec2 volume(vec3 p) {
  vec3 q = (p + 1.6) / 3.2;
  if (any(lessThan(q, vec3(0.0))) || any(greaterThan(q, vec3(1.0)))) return vec2(0.0);
  return texture(field, (q * (gridSize - 1.0) + .5) / gridSize).rg * 8.0;
}
void main() {
  vec2 pixel = vec2(uv.x, 1.0 - uv.y) * viewport;
  vec2 plane = (pixel - center) / spread;
  // Only atmosphere is masked; star cores and all page content are untouched.
  vec2 outsideText = max(max(textBounds.xy - pixel, pixel - textBounds.zw), vec2(0.0));
  float readability = mix(.08, 1.0, smoothstep(0.0, 80.0, length(outsideText)));
  // Matches the stellar projection exactly: screen = world / (1 - .32*z).
  // March front-to-back; each layer transmits light from those behind it.
  float dz = 3.2 / float(steps);
  float distanceStep = dz * length(vec3(-plane * .32, 1.0));
  vec4 sum = vec4(0.0);
  for (int i = 0; i < 64; i++) {
    if (i >= steps || sum.a > .90) break;
    float z = 1.6 - (float(i) + .5) * dz;
    vec3 p = vec3(plane * (1.0 - .32 * z), z);
    vec2 cell = volume(p);
    // Reject the diffuse tail instead of integrating barely occupied cells
    // through the entire ray. Smooth support avoids a hard density surface.
    if (cell.r <= .06) continue;
    float support = smoothstep(.06, .42, cell.r);
    float density = (cell.r - .06) * support * structure(p);
    float localLight = 1.0 - exp(-cell.g * 1.15);
    // Local self-shadowing from the density field, not screen-space blur.
    float cover = volume(p + vec3(-.08, -.12, .14)).r;
    float transmission = exp(-cover * .35);
    float depth = smoothstep(-1.1, 1.1, z);
    vec3 radiance = mix(shadowColor, scatterColor, .72 + .18 * depth);
    radiance = mix(radiance, lightColor, localLight * .48);
    radiance *= .72 + .28 * transmission;
    // Weakly lit regions transmit almost all background light. No beige pedestal.
    float illumination = .10 + .90 * localLight * localLight;
    float alpha = 1.0 - exp(-density * distanceStep * .65 * illumination);
    float contribution = (1.0 - sum.a) * alpha;
    sum.rgb += radiance * contribution;
    sum.a += contribution;
  }
  // Smooth optical compression caps atmospheric coverage at 20%, versus 64%
  // previously. Scale premultiplied RGB with alpha to avoid bright fog fringes.
  float coverage = .20 * (1.0 - exp(-sum.a / .20)) * readability;
  vec4 sculpture = sum * (coverage / max(sum.a, .00001));

  // Independent hero-space volume: changing sculpture position never moves it.
  // Twelve cheap slices add faint ribbons across the full hero, not a fog slab.
  vec2 heroPlane = (pixel / viewport - .5) * vec2(4.8, 3.2);
  float opticalDepth = 0.0;
  for (int j = 0; j < 12; j++) {
    float z = -1.2 + (float(j) + .5) * .2;
    vec3 p = vec3(heroPlane * (1.0 - z * .08), z);
    float bend = p.y * 2.0 + sin(p.x * 1.5 + elapsed * .025) * 1.25 + z * .9;
    float ribbon = exp(-pow(sin(bend), 2.0) * 12.0);
    float clusters = smoothstep(.25, .95, structure(p));
    // Broad low-frequency presence never vanishes between the wisps. Fine
    // spatial modulation is continuous, with no per-frame random blinking.
    float broad = .5 + .5 * sin(p.x * .9 + p.y * .7 + z * .5 - elapsed * .017);
    float detail = .5 + .5 * sin(dot(p, vec3(31.0, -23.0, 19.0)) + elapsed * .06);
    opticalDepth += (.08 + .16 * broad + ribbon * (.18 + .54 * clusters)
      + .025 * detail * clusters) * .2;
  }
  float textAttenuation = mix(${GLOBAL_TEXT_FLOOR}, 1.0,
    smoothstep(0.0, ${GLOBAL_TEXT_FEATHER.toFixed(1)}, length(outsideText)));
  float composition = mix(.72, 1.0, smoothstep(.05, .95, pixel.x / viewport.x));
  float nebulaAlpha = ${GLOBAL_NEBULA_ALPHA} * (1.0 - exp(-opticalDepth * 1.4)) * textAttenuation * composition;
  vec3 nebulaLight = mix(scatterColor, lightColor, .18);
  color = sculpture + vec4(nebulaLight * nebulaAlpha, nebulaAlpha) * (1.0 - sculpture.a);
}`;

export type StellarVolume = {
  canvas: HTMLCanvasElement;
  resize(width: number, height: number): void;
  palette(shadow: string, scatter: string, light: string): void;
  render(density: Float32Array, lighting: Float32Array, time: number,
    centerX: number, centerY: number, spreadX: number, spreadY: number,
    textBounds?: Float32Array): boolean;
  gpuTimeMs(): number | null;
  dispose(): void;
};

export function createStellarVolume(gridSize: number, restored?: () => void): StellarVolume | null {
  const canvas = document.createElement('canvas');
  let gl: WebGL2RenderingContext | null;
  try {
    gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true,
      antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  } catch { return null; }
  if (!gl) return null;
  const context = gl;
  const compile = (type: number, source: string) => {
    const shader = context.createShader(type);
    if (!shader) return null;
    context.shaderSource(shader, source);
    context.compileShader(shader);
    if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
      context.deleteShader(shader);
      return null;
    }
    return shader;
  };
  const vertex = compile(context.VERTEX_SHADER, vertexSource);
  const fragment = compile(context.FRAGMENT_SHADER, fragmentSource);
  const program = context.createProgram();
  if (!vertex || !fragment || !program) {
    if (vertex) context.deleteShader(vertex);
    if (fragment) context.deleteShader(fragment);
    if (program) context.deleteProgram(program);
    return null;
  }
  context.attachShader(program, vertex); context.attachShader(program, fragment);
  context.linkProgram(program);
  context.deleteShader(vertex); context.deleteShader(fragment);
  if (!context.getProgramParameter(program, context.LINK_STATUS)) {
    context.deleteProgram(program); return null;
  }
  const texture = context.createTexture();
  if (!texture) { context.deleteProgram(program); return null; }
  const uniform = (name: string) => context.getUniformLocation(program, name);
  const u = { viewport: uniform('viewport'), center: uniform('center'), spread: uniform('spread'),
    elapsed: uniform('elapsed'), steps: uniform('steps'), shadow: uniform('shadowColor'),
    scatter: uniform('scatterColor'), light: uniform('lightColor'), text: uniform('textBounds') };
  context.useProgram(program);
  context.uniform1i(uniform('field'), 0);
  context.uniform1f(uniform('gridSize'), gridSize);
  context.activeTexture(context.TEXTURE0);
  context.bindTexture(context.TEXTURE_3D, texture);
  context.texParameteri(context.TEXTURE_3D, context.TEXTURE_MIN_FILTER, context.LINEAR);
  context.texParameteri(context.TEXTURE_3D, context.TEXTURE_MAG_FILTER, context.LINEAR);
  for (const axis of [context.TEXTURE_WRAP_S, context.TEXTURE_WRAP_T, context.TEXTURE_WRAP_R])
    context.texParameteri(context.TEXTURE_3D, axis, context.CLAMP_TO_EDGE);
  context.texStorage3D(context.TEXTURE_3D, 1, context.RGBA8, gridSize, gridSize, gridSize);
  const voxels = new Uint8Array(gridSize ** 3 * 4);
  let width = 1, height = 1, lost = false, disposed = false;
  let quality = 1, lastGpuMs: number | null = null, frame = 0;
  const timer = context.getExtension('EXT_disjoint_timer_query_webgl2');
  let query: WebGLQuery | null = null;
  const sizeTarget = () => {
    const scale = Math.min(.40, 520 / width, 340 / height) * quality;
    canvas.width = Math.max(1, Math.ceil(width * scale));
    canvas.height = Math.max(1, Math.ceil(height * scale));
    context.viewport(0, 0, canvas.width, canvas.height);
  };
  const onLoss = (event?: Event) => { event?.preventDefault(); lost = true; };
  const onRestore = () => { if (!disposed) restored?.(); };
  canvas.addEventListener('webglcontextlost', onLoss);
  canvas.addEventListener('webglcontextrestored', onRestore);
  const setColor = (location: WebGLUniformLocation | null, hex: string) => {
    const n = Number.parseInt(hex.replace('#', ''), 16);
    context.uniform3f(location, ((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  };
  return {
    canvas,
    resize(w, h) {
      width = w; height = h;
      // Bounded desktop render target, independent of device pixel ratio.
      sizeTarget();
    },
    palette(shadow, scatter, light) {
      if (lost || disposed) return;
      context.useProgram(program);
      setColor(u.shadow, shadow); setColor(u.scatter, scatter); setColor(u.light, light);
    },
    render(density, lighting, time, cx, cy, sx, sy, textBounds) {
      if (lost || disposed || context.isContextLost()) return false;
      if (timer && query && context.getQueryParameter(query, context.QUERY_RESULT_AVAILABLE)) {
        if (!context.getParameter(timer.GPU_DISJOINT_EXT)) {
          lastGpuMs = Number(context.getQueryParameter(query, context.QUERY_RESULT)) / 1e6;
          if (lastGpuMs > 10 && quality > .6) { quality = Math.max(.6, quality * .85); sizeTarget(); }
        }
        context.deleteQuery(query); query = null;
      }
      for (let i = 0; i < density.length; i++) {
        voxels[i * 4] = Math.min(255, Math.round(density[i] * 255 / 8));
        voxels[i * 4 + 1] = Math.min(255, Math.round(lighting[i] * 255 / 8));
      }
      context.useProgram(program);
      context.activeTexture(context.TEXTURE0);
      context.bindTexture(context.TEXTURE_3D, texture);
      context.texSubImage3D(context.TEXTURE_3D, 0, 0, 0, 0, gridSize, gridSize, gridSize,
        context.RGBA, context.UNSIGNED_BYTE, voxels);
      context.uniform2f(u.viewport, width, height);
      context.uniform2f(u.center, cx, cy); context.uniform2f(u.spread, sx, sy);
      context.uniform4f(u.text, textBounds?.[0] ?? -100000, textBounds?.[1] ?? -100000,
        textBounds?.[2] ?? -100000, textBounds?.[3] ?? -100000);
      context.uniform1f(u.elapsed, time); context.uniform1i(u.steps, Math.max(32, Math.round(48 * quality)));
      const measure = timer && !query && frame++ % 120 === 0;
      if (measure) { query = context.createQuery(); if (query) context.beginQuery(timer.TIME_ELAPSED_EXT, query); }
      context.drawArrays(context.TRIANGLES, 0, 3);
      if (measure && query) context.endQuery(timer.TIME_ELAPSED_EXT);
      return true;
    },
    gpuTimeMs: () => lastGpuMs,
    dispose() {
      if (disposed) return;
      disposed = true;
      canvas.removeEventListener('webglcontextlost', onLoss);
      canvas.removeEventListener('webglcontextrestored', onRestore);
      if (query) context.deleteQuery(query);
      context.deleteTexture(texture); context.deleteProgram(program);
      context.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.width = canvas.height = 1;
    },
  };
}

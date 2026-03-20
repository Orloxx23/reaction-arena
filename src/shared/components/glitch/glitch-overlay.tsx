"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { detectGpuCapability } from "./gpu-detection";

// Pixel grid size in CSS pixels
const PX = 5;
const GAP = 1;
const CELL = PX + GAP; // total cell size

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

// Shader: pixel grid darkening + grain + click effects
const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_click;
uniform float u_cell;
uniform float u_gap;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                      -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = v_uv;
  float t = u_time;
  float click = u_click;
  float cell = u_cell;
  float gap = u_gap;
  float px = cell - gap;

  // Pixel grid coordinates
  vec2 pixCoord = gl_FragCoord.xy / cell;
  vec2 cellId = floor(pixCoord);
  vec2 cellUV = fract(pixCoord); // 0-1 within each cell

  // Pixel square mask: 1 inside the pixel, 0 in the gap
  float pixelX = smoothstep(0.0, gap / cell * 2.0, cellUV.x)
               * smoothstep(1.0, 1.0 - gap / cell * 2.0, cellUV.x);
  float pixelY = smoothstep(0.0, gap / cell * 2.0, cellUV.y)
               * smoothstep(1.0, 1.0 - gap / cell * 2.0, cellUV.y);
  float pixelMask = pixelX * pixelY;

  // Round the corners slightly
  vec2 cornerDist = abs(cellUV - 0.5) * 2.0;
  float corner = smoothstep(1.0, 0.85, max(cornerDist.x, cornerDist.y));
  pixelMask *= corner;

  // Per-pixel brightness variation (subtle shimmer)
  float shimmer = hash(cellId + floor(t * 3.0) * 0.01) * 0.15 + 0.85;

  // Ambient grain
  float grain = snoise(gl_FragCoord.xy * 0.8 + t * 12.0);
  float ambientGrain = abs(grain) * 0.04;

  // Film noise layer - fullscreen static that flickers
  float filmNoise = hash(floor(gl_FragCoord.xy * 0.5) + floor(t * 24.0) * 0.1);
  filmNoise = filmNoise * filmNoise * 0.08;

  // === RANDOM GLITCH BURSTS (triggers ~every few seconds) ===
  float glitchSeed = floor(t * 2.0); // changes 2x per second
  float glitchTrigger = step(0.95, hash(vec2(glitchSeed, 0.0))); // ~5% chance
  float glitchIntensity = glitchTrigger * hash(vec2(glitchSeed, 1.0)); // random strength

  // Combined glitch factor: random bursts + click
  float glitch = max(glitchIntensity, click);

  // Tear lines (random bursts + click)
  float tearTotal = 0.0;
  float tearSpeed = 40.0 + glitchIntensity * 20.0;
  for (float i = 0.0; i < 8.0; i++) {
    float tearY = hash(vec2(floor(t * tearSpeed), i * 17.0));
    float tearW = 0.001 + hash(vec2(floor(t * tearSpeed), i * 17.0 + 1.0)) * 0.008;
    tearTotal += smoothstep(tearW, 0.0, abs(uv.y - tearY)) * glitch;
  }

  // RGB split (random bursts + click)
  float splitAmt = glitch * 0.02;
  float rGrain = abs(snoise((gl_FragCoord.xy + vec2(splitAmt * u_resolution.x, 0.0)) * 0.8 + t * 12.0));
  float bGrain = abs(snoise((gl_FragCoord.xy - vec2(splitAmt * u_resolution.x * 1.3, 0.0)) * 0.8 + t * 12.0));

  // Glitch blocks - big colored rectangles
  float blockTotal = 0.0;
  vec3 blockColor = vec3(0.0);
  float blockSeed = floor(t * 15.0);
  for (float i = 0.0; i < 4.0; i++) {
    float bY = hash(vec2(blockSeed, i * 31.0));
    float bH = 0.01 + hash(vec2(blockSeed, i * 31.0 + 1.0)) * 0.06;
    float bX = hash(vec2(blockSeed, i * 31.0 + 2.0));
    float bW = 0.05 + hash(vec2(blockSeed, i * 31.0 + 3.0)) * 0.4;
    float bMask = step(bY, uv.y) * step(uv.y, bY + bH)
                * step(bX, uv.x) * step(uv.x, bX + bW) * glitch;
    blockTotal += bMask;
    blockColor += vec3(
      hash(vec2(blockSeed, i * 31.0 + 4.0)) * 0.5,
      0.4 + hash(vec2(blockSeed, i * 31.0 + 5.0)) * 0.6,
      hash(vec2(blockSeed, i * 31.0 + 6.0)) * 0.4
    ) * bMask;
  }
  blockTotal = min(blockTotal, 1.0);

  // === COMPOSE ===
  // The grid gap is rendered as solid black (darkens the page)
  // Pixel area gets grain/glow on top

  // Dark gap: output black with high alpha where pixelMask is 0
  float gapDark = (1.0 - pixelMask) * 0.5;

  // Grain/glow effects (only visible inside pixels)
  float grainVis = (ambientGrain + filmNoise) * pixelMask * shimmer;
  grainVis += abs(grain) * tearTotal * 1.5 * pixelMask;
  grainVis += abs(grain) * glitch * glitch * 0.25 * pixelMask;

  vec3 grainColor = vec3(0.15, 1.0, 0.3) * grainVis;
  grainColor.r += rGrain * 0.3 * glitch * pixelMask;
  grainColor.b += bGrain * 0.3 * glitch * pixelMask;
  grainColor += vec3(0.3, 1.0, 0.4) * abs(grain) * tearTotal * 0.6 * pixelMask;

  // Glitch blocks
  grainColor += blockColor * 0.6 * pixelMask;

  // Screen flicker - random brightness dips
  float flicker = 1.0 - step(0.97, hash(vec2(floor(t * 8.0), 0.0))) * 0.4;

  // Final: dark gaps + bright grain in pixel areas
  vec3 color = grainColor;
  float alpha = gapDark + length(grainColor) * 3.0;
  // Flicker adds a dark flash over everything
  alpha += (1.0 - flicker) * 0.3;
  alpha = clamp(alpha, 0.0, 0.85);

  fragColor = vec4(color * flicker, alpha);
}`;

const FRAGMENT_SHADER_LOW = `#version 300 es
precision mediump float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_click;
uniform float u_cell;
uniform float u_gap;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  float cell = u_cell;
  float gap = u_gap;

  vec2 cellUV = fract(gl_FragCoord.xy / cell);
  float pixelX = step(gap / cell, cellUV.x) * step(cellUV.x, 1.0 - gap / cell);
  float pixelY = step(gap / cell, cellUV.y) * step(cellUV.y, 1.0 - gap / cell);
  float pixelMask = pixelX * pixelY;

  float gapDark = (1.0 - pixelMask) * 0.7;
  float grain = hash(floor(gl_FragCoord.xy / cell) + u_time * 3.0) * 0.03;
  float burst = hash(floor(gl_FragCoord.xy) + u_time * 100.0) * u_click * u_click * 0.2;

  vec3 color = vec3(0.15, 1.0, 0.3) * (grain + burst) * pixelMask;
  float alpha = clamp(gapDark + length(color) * 3.0, 0.0, 0.7);

  fragColor = vec4(color, alpha);
}`;

function createShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram | null {
  const vertShader = createShader(gl, gl.VERTEX_SHADER, vs);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fs);
  if (!vertShader || !fragShader) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  gl.deleteShader(vertShader);
  gl.deleteShader(fragShader);
  return program;
}

function applyShake(intensity: number) {
  if (intensity < 0.01) {
    document.body.style.transform = "";
    return;
  }
  const r = () => (Math.random() - 0.5) * 2;
  document.body.style.transform =
    `translate(${r() * intensity * 18}px, ${r() * intensity * 12}px) rotate(${r() * intensity * 2}deg) scale(${1 + r() * intensity * 0.025})`;
}

// DOM content displacement: creates temporary strip divs that visually
// shift horizontal slices of the real page content
const activeStrips: HTMLDivElement[] = [];

function applyContentGlitch(intensity: number) {
  // Clean up existing strips
  for (const strip of activeStrips) {
    strip.remove();
  }
  activeStrips.length = 0;

  if (intensity < 0.15) return;

  const stripCount = Math.floor(3 + Math.random() * 4); // 3-6 strips
  const vh = window.innerHeight;

  for (let i = 0; i < stripCount; i++) {
    const strip = document.createElement("div");
    const y = Math.random() * vh;
    const h = 2 + Math.random() * (intensity * 40 + 8); // strip height 2-50px
    const offsetX = (Math.random() - 0.5) * intensity * 60; // horizontal shift
    const top = Math.max(0, y);
    const bottom = Math.max(0, vh - y - h);

    strip.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 49;
      pointer-events: none;
      clip-path: inset(${top}px 0 ${bottom}px 0);
      transform: translateX(${offsetX}px);
      backdrop-filter: blur(0px);
      -webkit-backdrop-filter: blur(0px);
    `;

    // Some strips get color distortion
    if (Math.random() < 0.4) {
      const hue = Math.floor(Math.random() * 360);
      const sat = 100 + Math.floor(Math.random() * 200);
      strip.style.backdropFilter = `hue-rotate(${hue}deg) saturate(${sat}%)`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (strip.style as any).webkitBackdropFilter = `hue-rotate(${hue}deg) saturate(${sat}%)`;
    }

    // Some strips get a tinted background for more visible break
    if (Math.random() < 0.3) {
      const r = Math.random() < 0.5 ? 255 : 0;
      const g = Math.random() < 0.3 ? 255 : 0;
      const b = Math.random() < 0.5 ? 255 : 0;
      strip.style.backgroundColor = `rgba(${r},${g},${b},${0.05 + Math.random() * 0.1})`;
    }

    strip.setAttribute("aria-hidden", "true");
    document.body.appendChild(strip);
    activeStrips.push(strip);
  }
}

export function GlitchOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const clickRef = useRef(0);
  const startTimeRef = useRef(0);
  const [enabled, setEnabled] = useState(false);

  const handleClick = useCallback(() => {
    clickRef.current = 1.0;
  }, []);

  useEffect(() => {
    const gpu = detectGpuCapability();
    if (!gpu.supported || gpu.tier === "none") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: gpu.tier === "low" ? "low-power" : "default",
    });
    if (!gl) return;

    setEnabled(true);

    const fragSource = gpu.tier === "low" ? FRAGMENT_SHADER_LOW : FRAGMENT_SHADER;
    const program = createProgram(gl, VERTEX_SHADER, fragSource);
    if (!program) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uClick = gl.getUniformLocation(program, "u_click");
    const uCell = gl.getUniformLocation(program, "u_cell");
    const uGap = gl.getUniformLocation(program, "u_gap");

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const resize = () => {
      const dpr = gpu.tier === "low" ? 1 : Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("click", handleClick);
    startTimeRef.current = performance.now();

    const dpr = gpu.tier === "low" ? 1 : Math.min(window.devicePixelRatio, 2);
    const cellPx = CELL * dpr;
    const gapPx = GAP * dpr;

    const frameInterval = gpu.tier === "low" ? 33.3 : 16.6;
    let lastFrame = 0;

    const render = (now: number) => {
      rafRef.current = requestAnimationFrame(render);
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;

      const t = (now - startTimeRef.current) / 1000;

      clickRef.current *= 0.85;
      if (clickRef.current < 0.005) clickRef.current = 0;

      // Shake + DOM displacement only on click
      applyShake(clickRef.current);
      applyContentGlitch(clickRef.current);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uClick, clickRef.current);
      gl.uniform1f(uCell, cellPx);
      gl.uniform1f(uGap, gapPx);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", handleClick);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
      document.body.style.transform = "";
      for (const strip of activeStrips) strip.remove();
      activeStrips.length = 0;
    };
  }, [handleClick]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      role="presentation"
      className="fixed inset-0 pointer-events-none z-50"
      style={{ display: enabled ? "block" : "none" }}
    />
  );
}

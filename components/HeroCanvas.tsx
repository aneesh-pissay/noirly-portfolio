"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { cancelFrame, frame } from "framer-motion";
import {
  GRID_BLEED,
  computeNoiseField,
  gridPosition,
  type WorkerMessage,
  type WorkerResponse,
} from "@/workers/noiseWorker";

/**
 * Breathing gradient mesh behind the hero.
 *
 * A grid of control points is displaced by a simplex field and the quads
 * between them are filled with the brand accent at very low alpha. The noise
 * moves the points; it never touches the colour. Each point picks up its weight
 * from a fixed radial ramp evaluated at wherever the noise has carried it, so
 * the palette is constant and only the shape breathes.
 *
 * Three things keep it off the critical path:
 *  - the field is computed in a worker, and the main thread only ever draws;
 *  - drawing happens into a backing store a fifth of the display size, with the
 *    browser's own bilinear upscale doing the smoothing that a per-pixel
 *    interpolation would otherwise cost;
 *  - an IntersectionObserver stops the loop and terminates the worker the
 *    moment the hero leaves the viewport.
 *
 * The render loop is Framer Motion's frame scheduler, not a private rAF, so the
 * canvas shares the one loop every motion value already runs on.
 */

const DESKTOP_GRID = { cols: 12, rows: 8 } as const;
/** Touch gets a coarser mesh — 24 points is cheaper to compute inline than to
 *  hand to a worker and wait for. */
const TOUCH_GRID = { cols: 6, rows: 4 } as const;

/** Noise time per frame. About 0.024/s: nothing a visitor consciously clocks
 *  inside the first eight seconds. */
const TIME_STEP = 0.0004;

/** Peak alpha of the accent over the page background. */
const GOLD_ALPHA = 0.06;

/** Backing store scale. The mesh has no detail finer than a cell, so drawing at
 *  full resolution would be paying for pixels the upscale invents anyway. */
const RESOLUTION = 0.2;

/** Control-point travel as a fraction of one cell.
 *
 *  The ceiling here is not taste, it is topology: the field runs to +/-1.05, so
 *  two neighbours can move this far in opposite directions and the gap between
 *  them closes at twice this value. Above 0.5 they cross, the quad inverts, and
 *  the overlap composites its alpha twice — which is what turns a surface into
 *  a bright tangle. 0.35 leaves clear headroom. */
const DISPLACE = 0.35;

/** Where the light sits in normalised hero space — high and to the right,
 *  matching the auras already in the section. */
const RAMP_ORIGIN_X = 0.74;
const RAMP_ORIGIN_Y = 0.16;
const RAMP_RADIUS = 0.86;

const REFERENCE_GOLD = "#c9a44a";
const REFERENCE_RGB: Rgb = { r: 201, g: 164, b: 74 };

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function mediaSubscriber(query: string): (onStoreChange: () => void) => () => void {
  return (onStoreChange) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", onStoreChange);
    return () => mql.removeEventListener("change", onStoreChange);
  };
}

const COARSE = "(pointer: coarse)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeCoarse = mediaSubscriber(COARSE);
const subscribeReduced = mediaSubscriber(REDUCED);
const getCoarse = (): boolean => window.matchMedia(COARSE).matches;
const getReduced = (): boolean => window.matchMedia(REDUCED).matches;
const getServerSnapshot = (): boolean => false;

/** Smoothstep, so the light has no visible rim where the ramp reaches zero. */
function smoothstep(t: number): number {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return x * x * (3 - 2 * x);
}

/** The static colour ramp, sampled at a control point's *displaced* position.
 *  That is the whole trick: the colour field never changes, the sampling points
 *  wander through it. */
function ramp(nx: number, ny: number): number {
  const dx = nx - RAMP_ORIGIN_X;
  const dy = ny - RAMP_ORIGIN_Y;
  return smoothstep(1 - Math.sqrt(dx * dx + dy * dy) / RAMP_RADIUS);
}

/**
 * Resolves the live theme accent to channels. Assigning to fillStyle and
 * reading it back makes the canvas do the CSS colour parsing, so whatever
 * notation the palette uses is handled; anything it refuses to parse leaves the
 * reference gold in place.
 */
function resolveAccent(ctx: CanvasRenderingContext2D, raw: string): Rgb {
  ctx.fillStyle = REFERENCE_GOLD;
  ctx.fillStyle = raw.trim();
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(ctx.fillStyle);
  if (!hex) return REFERENCE_RGB;
  return {
    r: Number.parseInt(hex[1], 16),
    g: Number.parseInt(hex[2], 16),
    b: Number.parseInt(hex[3], 16),
  };
}

export function HeroCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coarse = useSyncExternalStore(subscribeCoarse, getCoarse, getServerSnapshot);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, getServerSnapshot);

  useEffect(() => {
    const element = canvasRef.current;
    if (element === null) return;
    const context = element.getContext("2d");
    if (context === null) return;

    // Re-bound with non-nullable *declared* types. The inner functions below are
    // hoisted declarations, and TypeScript does not carry a narrowing into a
    // function that could have been called before the guard ran — annotating
    // here gives them the non-null types without an assertion.
    const canvas: HTMLCanvasElement = element;
    const ctx: CanvasRenderingContext2D = context;

    const { cols, rows } = coarse ? TOUCH_GRID : DESKTOP_GRID;
    // Touch skips the worker; so does reduced motion, which draws once and stops.
    const wantsWorker = !coarse && !reduced;

    let cssWidth = 0;
    let cssHeight = 0;
    let accent: Rgb = REFERENCE_RGB;

    let time = 0;
    let field: Float32Array<ArrayBuffer> | null = null;
    /** Detached buffer waiting to be refilled — see the ping-pong in request(). */
    let spare: ArrayBuffer | null = null;
    let pending = false;
    let worker: Worker | null = null;
    let running = false;

    /* ------------------------------- drawing ------------------------------ */

    const xs = new Float32Array(cols * rows);
    const ys = new Float32Array(cols * rows);
    const ws = new Float32Array(cols * rows);

    function render(): void {
      if (!field || cssWidth === 0 || cssHeight === 0) return;

      const scale = canvas.width / cssWidth;
      const cellW = (cssWidth * (1 + GRID_BLEED * 2)) / (cols - 1);
      const cellH = (cssHeight * (1 + GRID_BLEED * 2)) / (rows - 1);
      const travelX = cellW * DISPLACE;
      const travelY = cellH * DISPLACE;

      for (let row = 0; row < rows; row += 1) {
        const baseY = gridPosition(row, rows, cssHeight);
        for (let col = 0; col < cols; col += 1) {
          const point = row * cols + col;
          const baseX = gridPosition(col, cols, cssWidth);
          const x = baseX + field[point * 2] * travelX;
          const y = baseY + field[point * 2 + 1] * travelY;
          xs[point] = x * scale;
          ys[point] = y * scale;
          ws[point] = ramp(x / cssWidth, y / cssHeight);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { r, g, b } = accent;

      for (let row = 0; row < rows - 1; row += 1) {
        for (let col = 0; col < cols - 1; col += 1) {
          const tl = row * cols + col;
          const tr = tl + 1;
          const bl = tl + cols;
          const br = bl + 1;

          // Bilinear across the quad, approximated as a linear ramp between its
          // two horizontal edges. Adjacent cells share those edge values, so the
          // mesh stays continuous down the grid; the upscale handles the rest.
          const topAlpha = ((ws[tl] + ws[tr]) / 2) * GOLD_ALPHA;
          const bottomAlpha = ((ws[bl] + ws[br]) / 2) * GOLD_ALPHA;

          const gradient = ctx.createLinearGradient(
            (xs[tl] + xs[tr]) / 2,
            (ys[tl] + ys[tr]) / 2,
            (xs[bl] + xs[br]) / 2,
            (ys[bl] + ys[br]) / 2,
          );
          gradient.addColorStop(0, "rgba(" + r + ", " + g + ", " + b + ", " + topAlpha + ")");
          gradient.addColorStop(1, "rgba(" + r + ", " + g + ", " + b + ", " + bottomAlpha + ")");

          ctx.beginPath();
          ctx.moveTo(xs[tl], ys[tl]);
          ctx.lineTo(xs[tr], ys[tr]);
          ctx.lineTo(xs[br], ys[br]);
          ctx.lineTo(xs[bl], ys[bl]);
          ctx.closePath();

          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }
    }

    function computeInline(): void {
      field = computeNoiseField({
        type: "field",
        cols,
        rows,
        width: cssWidth,
        height: cssHeight,
        time,
        buffer: field ? field.buffer : null,
      });
    }

    /* -------------------------------- worker ------------------------------ */

    function handleField(event: MessageEvent<WorkerResponse>): void {
      // The frame we have been rendering becomes the buffer the worker fills next.
      if (field) spare = field.buffer;
      field = event.data.field;
      pending = false;
    }

    function startWorker(): void {
      if (worker || !wantsWorker) return;
      try {
        worker = new Worker(new URL("../workers/noiseWorker.ts", import.meta.url), {
          type: "module",
        });
        worker.addEventListener("message", handleField);
      } catch {
        // Blocked by CSP, or a browser without module workers. The inline path
        // runs the identical code, just here.
        worker = null;
      }
    }

    function stopWorker(): void {
      if (!worker) return;
      worker.removeEventListener("message", handleField);
      worker.terminate();
      worker = null;
      pending = false;
      spare = null;
    }

    function request(): void {
      if (!worker || pending) return;
      pending = true;
      const message: WorkerMessage = {
        type: "field",
        cols,
        rows,
        width: cssWidth,
        height: cssHeight,
        time,
        buffer: spare,
      };
      const transfer: Transferable[] = spare ? [spare] : [];
      spare = null;
      worker.postMessage(message, transfer);
    }

    /* --------------------------------- loop ------------------------------- */

    function tick(): void {
      time += TIME_STEP;
      if (worker) request();
      else computeInline();
      render();
    }

    function start(): void {
      if (running || reduced) return;
      running = true;
      startWorker();
      frame.update(tick, true);
    }

    function stop(): void {
      if (!running) return;
      running = false;
      cancelFrame(tick);
      stopWorker();
    }

    /* -------------------------------- sizing ------------------------------ */

    function readAccent(): Rgb {
      return resolveAccent(
        ctx,
        getComputedStyle(canvas).getPropertyValue("--accent") || REFERENCE_GOLD,
      );
    }

    let measureFrame = 0;

    function measure(): void {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (width === 0 || height === 0) return;
      cssWidth = width;
      cssHeight = height;
      canvas.width = Math.max(1, Math.round(width * RESOLUTION));
      canvas.height = Math.max(1, Math.round(height * RESOLUTION));
      accent = readAccent();
      // A resized backing store is transparent again, so redraw now rather than
      // leaving a blank frame until the next tick — or forever, if paused.
      if (!field) computeInline();
      render();
    }

    function scheduleMeasure(): void {
      if (measureFrame !== 0) return;
      measureFrame = requestAnimationFrame(() => {
        measureFrame = 0;
        measure();
      });
    }

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(canvas);
    scheduleMeasure();

    // Repaint in the new palette when the theme picker switches accents.
    const themeObserver = new MutationObserver(() => {
      accent = readAccent();
      render();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });

    // Reduced motion keeps the single frame measure() already drew, and no loop.
    const intersectionObserver = reduced
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) start();
            else stop();
          },
          { threshold: 0 },
        );
    intersectionObserver?.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
      intersectionObserver?.disconnect();
      stop();
    };
  }, [coarse, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className ?? "pointer-events-none absolute inset-0 h-full w-full"}
    />
  );
}

export default HeroCanvas;

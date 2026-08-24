import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { PointerEvent as RPointerEvent } from "react";

/* ------------------------------------------------------------------ math */
export const clamp = (v: number, lo: number, hi: number) =>
  v < lo ? lo : v > hi ? hi : v;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const inv = (a: number, b: number, v: number) => (b === a ? 0 : (v - a) / (b - a));
export const norm = (v: number, lo: number, hi: number) =>
  clamp(inv(lo, hi, v), 0, 1);
export const mapRange = (v: number, a: number, b: number, c: number, d: number) =>
  lerp(c, d, norm(v, a, b));
export const roundTo = (v: number, step: number) => Math.round(v / step) * step;
export const wrap = (v: number, max: number) => ((v % max) + max) % max;
export const fmt = (v: number, d = 0) => v.toFixed(d);
export const TAU = Math.PI * 2;

/** polar coordinate: angle in degrees, 0 = top, clockwise positive */
export const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) };
};
export const describeArc = (
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number
) => {
  const s = polar(cx, cy, r, a0);
  const e = polar(cx, cy, r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} ${sweep} ${e.x} ${e.y}`;
};

/* ------------------------------------------------------------------ rng */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
/** stable, musical-ish waveform peaks */
export const makeBars = (seed: number, count: number, power = 0.62) => {
  const rnd = mulberry32(seed);
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const env =
      0.55 +
      0.45 * Math.sin((i / count) * Math.PI * 3 + seed) * Math.sin((i / count) * Math.PI);
    out.push(clamp(Math.pow(rnd(), power) * 0.7 + env * 0.45, 0.04, 1));
  }
  return out;
};

/* ------------------------------------------------------------------ drag */
export type DragInfo = {
  dx: number;
  dy: number;
  px: number;
  py: number;
  shift: boolean;
  event: PointerEvent;
};
export type DragEndInfo = {
  velocity: number;
  angle: number;
  px: number;
  py: number;
};
export type DragHandlers = {
  onStart?: (e: PointerEvent) => void;
  onMove?: (i: DragInfo) => void;
  onEnd?: (i: DragEndInfo) => void;
};

export function useDrag(handlers: DragHandlers) {
  const [dragging, setDragging] = useState(false);
  const h = useRef(handlers);
  h.current = handlers;
  const s = useRef({ active: false, id: -1, x: 0, y: 0, t: 0, vx: 0, vy: 0 });

  const move = useCallback((e: PointerEvent) => {
    const st = s.current;
    if (!st.active || e.pointerId !== st.id) return;
    const now = performance.now();
    const dx = e.clientX - st.x;
    const dy = e.clientY - st.y;
    const dt = Math.max(1, now - st.t);
    st.vx = st.vx * 0.6 + (dx / dt) * 0.4;
    st.vy = st.vy * 0.6 + (dy / dt) * 0.4;
    st.x = e.clientX;
    st.y = e.clientY;
    st.t = now;
    h.current.onMove?.({
      dx,
      dy,
      px: e.clientX,
      py: e.clientY,
      shift: e.shiftKey,
      event: e,
    });
    e.preventDefault();
  }, []);

  const up = useCallback(
    (e: PointerEvent) => {
      const st = s.current;
      if (!st.active || e.pointerId !== st.id) return;
      st.active = false;
      setDragging(false);
      h.current.onEnd?.({
        velocity: Math.hypot(st.vx, st.vy),
        angle: Math.atan2(st.vy, st.vx),
        px: e.clientX,
        py: e.clientY,
      });
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    },
    [move]
  );

  const down = useCallback(
    (e: RPointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const st = s.current;
      st.active = true;
      st.id = e.pointerId;
      st.x = e.clientX;
      st.y = e.clientY;
      st.t = performance.now();
      st.vx = 0;
      st.vy = 0;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      setDragging(true);
      h.current.onStart?.(e.nativeEvent);
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
      e.preventDefault();
    },
    [move, up]
  );

  useEffect(
    () => () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    },
    [move, up]
  );

  return { onPointerDown: down, dragging } as const;
}

/* -------------------------------------------------------- press + hold */
export function useHoldPress(onActivate: () => void) {
  const cb = useRef(onActivate);
  cb.current = onActivate;
  const timers = useRef<{ a?: number; b?: number }>({});
  const clear = useCallback(() => {
    if (timers.current.a) {
      clearTimeout(timers.current.a);
      timers.current.a = undefined;
    }
    if (timers.current.b) {
      clearTimeout(timers.current.b);
      timers.current.b = undefined;
    }
  }, []);
  const start = useCallback(() => {
    clear();
    cb.current();
    let delay = 300;
    const loop = () => {
      cb.current();
      delay = Math.max(26, delay * 0.85);
      timers.current.b = window.setTimeout(loop, delay);
    };
    timers.current.a = window.setTimeout(() => {
      timers.current.b = window.setTimeout(loop, delay);
    }, 320);
  }, [clear]);
  useEffect(() => clear, [clear]);
  return { start, stop: clear } as const;
}

/* ----------------------------------------------------------------- size */
export function useSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setSize({ width: cr.width, height: cr.height });
    });
    ro.observe(el);
    setSize({ width: el.clientWidth, height: el.clientHeight });
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

/* ----------------------------------------------------------- lightweight */
export const haptic = (ms = 8) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* ignore */
  }
};

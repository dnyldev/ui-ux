import React, { useEffect, useRef, useState } from "react";

/* ================= types ================= */

export type ModelDef = {
  name: string;
  tag: string;
  note: string;
  Comp: React.ComponentType<{ accent: string }>;
};

export type DomainDef = {
  id: string;
  num: string;
  title: string;
  fa: string;
  accent: string;
  note: string;
  group: string;
  models: ModelDef[];
};

/* ================= utils ================= */

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const snap = (v: number, s: number) => Math.round(v / s) * s;
export const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  const d = Math.floor((s % 1) * 10);
  return `${m}:${ss.toString().padStart(2, "0")}.${d}`;
};
export const fmtDb = (pct: number) =>
  pct <= 0.5 ? "-∞" : `${(20 * Math.log10(pct / 100)).toFixed(1)} dB`;

export function genPeaks(seed: number, n: number) {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const r = Math.abs(Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453) % 1;
    const env = 0.5 + 0.5 * Math.sin((i / n) * Math.PI);
    const beat = 0.62 + 0.38 * Math.abs(Math.sin(i * 0.53 + seed));
    out.push(clamp(env * beat * (0.5 + r * 0.65), 0.07, 1));
  }
  return out;
}

export function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

/* ================= hooks ================= */

export function useSpring(target: number, stiff = 170, damp = 24) {
  const [x, setX] = useState(target);
  const s = useRef({ x: target, v: 0 });
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.045, (now - last) / 1000);
      last = now;
      const st = s.current;
      st.v += (-stiff * (st.x - target) - damp * st.v) * dt;
      st.x += st.v * dt;
      if (Math.abs(st.v) < 0.015 && Math.abs(st.x - target) < 0.015) {
        st.x = target;
        st.v = 0;
        setX(target);
        return;
      }
      setX(st.x);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, stiff, damp]);
  return x;
}

export function usePointerDrag(
  onMove: (d: { dx: number; dy: number; x: number; y: number; shiftKey: boolean }) => void,
  opts?: { onStart?: () => void; onEnd?: (moved: boolean) => void }
) {
  const [dragging, setDragging] = useState(false);
  const cb = useRef(onMove);
  cb.current = onMove;
  const o = useRef(opts);
  o.current = opts;
  const last = useRef<{ x: number; y: number } | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const moved = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    last.current = { x: e.clientX, y: e.clientY };
    start.current = { x: e.clientX, y: e.clientY };
    moved.current = false;
    setDragging(true);
    o.current?.onStart?.();
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!last.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 4) moved.current = true;
    cb.current({ dx, dy, x: e.clientX, y: e.clientY, shiftKey: e.shiftKey });
  };
  const end = () => {
    if (!last.current) return;
    last.current = null;
    setDragging(false);
    o.current?.onEnd?.(moved.current);
  };
  return {
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
    } as React.DOMAttributes<HTMLElement>,
  };
}

export function useHold(fn: () => void, delay = 420, interval = 65) {
  const f = useRef(fn);
  f.current = fn;
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const i = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (t.current) clearTimeout(t.current);
    if (i.current) clearInterval(i.current);
    t.current = null;
    i.current = null;
  };
  useEffect(() => stop, []);
  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      f.current();
      t.current = setTimeout(() => {
        i.current = setInterval(() => f.current(), interval);
      }, delay);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
  };
  return handlers;
}

/** mock transport clock — frontend only */
export function usePlayer(duration: number, autoplay = false) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const t = useRef(0);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      t.current = (t.current + dt) % duration;
      setTime(t.current);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration]);
  const seek = (nt: number) => {
    t.current = ((nt % duration) + duration) % duration;
    setTime(t.current);
  };
  return { time, playing, playingRef: t, toggle: () => setPlaying((p) => !p), setPlaying, seek };
}

/** visual beat clock — pulses only, no audio */
export function useBeatClock(bpm: number, playing: boolean) {
  const [ph, setPh] = useState({ beat: -1, phase: 0 });
  useEffect(() => {
    if (!playing) {
      setPh({ beat: -1, phase: 0 });
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const spb = 60 / bpm;
    const step = (now: number) => {
      const beat = (now - t0) / 1000 / spb;
      setPh({ beat: Math.floor(beat), phase: beat % 1 });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [bpm, playing]);
  return ph;
}

export function useWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

/* ================= icons ================= */

const paths = {
  reset: "M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 3.5V7H8",
  play: "M8.5 5.5v13l10-6.5z",
  pause: "M8 5.5h3v13H8zM13.5 5.5h3v13h-3z",
  x: "M6.5 6.5l11 11M17.5 6.5l-11 11",
  chevD: "M6.5 9.5l5.5 5.5 5.5-5.5",
  plus: "M12 5.5v13M5.5 12h13",
  minus: "M5.5 12h13",
};
export type IconName = keyof typeof paths;

export function Icon({ name, size = 15, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={paths[name]} />
    </svg>
  );
}

/* ================= Dial (rotary, relative) ================= */

export function Dial({
  value, min, max, onChange, onReset, accent, size = 116, sens = 0.45, fineSens = 0.04,
  step = 1, format, unit, wheelStep,
}: {
  value: number; min: number; max: number;
  onChange: (v: number) => void; onReset?: () => void;
  accent: string; size?: number; sens?: number; fineSens?: number; step?: number;
  format?: (v: number) => string; unit?: string; wheelStep?: number;
}) {
  const vRef = useRef(value);
  vRef.current = value;
  const chRef = useRef(onChange);
  chRef.current = onChange;
  const elRef = useRef<HTMLDivElement>(null);

  const drag = usePointerDrag(({ dx, dy, shiftKey }) => {
    const d = (dx - dy) * (shiftKey ? fineSens : sens);
    let nv = vRef.current + d;
    if (!shiftKey) nv = snap(nv, step);
    chRef.current(clamp(nv, min, max));
  });

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const fn = (e: WheelEvent) => {
      e.preventDefault();
      const ws = wheelStep ?? step;
      const d = (e.deltaY < 0 ? 1 : -1) * (e.shiftKey ? ws / 10 : ws);
      chRef.current(clamp(vRef.current + d, min, max));
    };
    el.addEventListener("wheel", fn, { passive: false });
    return () => el.removeEventListener("wheel", fn);
  }, [min, max, step, wheelStep]);

  const frac = clamp((value - min) / (max - min), 0, 1);
  const c = size / 2;
  const r = size / 2 - 9;
  const pt = (deg: number, rr = r): [number, number] => [c + rr * Math.cos((deg * Math.PI) / 180), c + rr * Math.sin((deg * Math.PI) / 180)];
  const arc = (from: number, to: number, rr = r) => {
    const [x1, y1] = pt(from, rr);
    const [x2, y2] = pt(to, rr);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${rr} ${rr} 0 ${to - from > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };
  const ticks = Array.from({ length: 11 }, (_, i) => 135 + i * 27);
  const needle = pt(135 + 270 * frac, r - 14);
  const needleIn = pt(135 + 270 * frac, r - 26);

  return (
    <div
      ref={elRef}
      role="slider"
      tabIndex={0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Math.round(value * 10) / 10}
      {...drag.handlers}
      onDoubleClick={() => onReset?.()}
      onKeyDown={(e) => {
        const fs = step / 10;
        if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); chRef.current(clamp(vRef.current + (e.shiftKey ? fs : step), min, max)); }
        if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); chRef.current(clamp(vRef.current - (e.shiftKey ? fs : step), min, max)); }
      }}
      className="relative cursor-ns-resize select-none rounded-full outline-offset-4"
      style={{ width: size, height: size, touchAction: "none" }}
    >
      <svg width={size} height={size} className="block">
        <circle cx={c} cy={c} r={r - 22} fill="url(#dialbody)" stroke="rgba(255,255,255,0.09)" />
        <defs>
          <radialGradient id="dialbody" cx="50%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#2c303a" />
            <stop offset="100%" stopColor="#191b21" />
          </radialGradient>
        </defs>
        {ticks.map((t, i) => {
          const [x1, y1] = pt(t, r + 2);
          const [x2, y2] = pt(t, r + 6);
          const active = t <= 135 + 270 * frac + 0.01;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={active ? accent : "rgba(255,255,255,0.16)"} strokeWidth={1.6} strokeLinecap="round" opacity={active ? 0.95 : 1} />;
        })}
        <path d={arc(135, 404.9)} stroke="rgba(255,255,255,0.1)" strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <path d={arc(135, 135 + 270 * frac + 0.1)} stroke={accent} strokeWidth={3.5} fill="none" strokeLinecap="round" style={{ filter: drag.dragging ? `drop-shadow(0 0 6px ${accent})` : undefined, transition: "filter .2s" }} />
        <line x1={needleIn[0]} y1={needleIn[1]} x2={needle[0]} y2={needle[1]} stroke={accent} strokeWidth={3} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-mono font-semibold leading-none" style={{ fontSize: size * 0.16, color: "var(--ink)" }}>
          {format ? format(value) : Math.round(value)}
        </span>
        {unit && <span className="mt-1 text-[9.5px] font-semibold tracking-[0.14em] uppercase" style={{ color: "var(--ink-3)" }}>{unit}</span>}
      </div>
    </div>
  );
}

/* ================= Wheel (vertical looping picker) ================= */

export function Wheel({
  min, max, value, onChange, format, accent, itemH = 40, rows = 5, unit,
}: {
  min: number; max: number; value: number; onChange: (v: number) => void;
  format?: (v: number) => string; accent: string; itemH?: number; rows?: number; unit?: string;
}) {
  const [pos, setPos] = useState(value);
  const posR = useRef(value);
  const velR = useRef(0);
  const animR = useRef(0);
  const dragR = useRef(false);
  const lastInt = useRef(value);
  const chRef = useRef(onChange);
  chRef.current = onChange;

  useEffect(() => {
    if (!dragR.current) {
      cancelAnimationFrame(animR.current);
      posR.current = value;
      lastInt.current = value;
      setPos(value);
    }
  }, [value]);
  useEffect(() => () => cancelAnimationFrame(animR.current), []);

  const snapTo = (target: number) => {
    target = clamp(target, min, max);
    const from = posR.current;
    const start = performance.now();
    const dur = 210;
    const step = (now: number) => {
      const k = clamp((now - start) / dur, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      const p = from + (target - from) * e;
      posR.current = p;
      setPos(p);
      if (k < 1) animR.current = requestAnimationFrame(step);
      else chRef.current(target);
    };
    animR.current = requestAnimationFrame(step);
  };
  const inertia = () => {
    const step = () => {
      let p = posR.current + velR.current;
      velR.current *= 0.93;
      if (p < min) { p = min; velR.current = 0; }
      if (p > max) { p = max; velR.current = 0; }
      posR.current = p;
      setPos(p);
      const ri = clamp(Math.round(p), min, max);
      if (ri !== lastInt.current) { lastInt.current = ri; chRef.current(ri); }
      if (Math.abs(velR.current) > 0.035) animR.current = requestAnimationFrame(step);
      else snapTo(ri);
    };
    animR.current = requestAnimationFrame(step);
  };
  const drag = usePointerDrag(
    ({ dy }) => {
      cancelAnimationFrame(animR.current);
      let p = posR.current - dy / itemH;
      if (p < min) p = min + (p - min) * 0.22;
      if (p > max) p = max + (p - max) * 0.22;
      velR.current = velR.current * 0.55 + (-dy / itemH) * 0.45;
      posR.current = p;
      setPos(p);
      const ri = clamp(Math.round(p), min, max);
      if (ri !== lastInt.current) { lastInt.current = ri; chRef.current(ri); }
    },
    {
      onStart: () => { dragR.current = true; cancelAnimationFrame(animR.current); },
      onEnd: () => {
        dragR.current = false;
        if (posR.current < min || posR.current > max) snapTo(clamp(Math.round(posR.current), min, max));
        else if (Math.abs(velR.current) > 0.12) inertia();
        else snapTo(clamp(Math.round(posR.current), min, max));
      },
    }
  );

  const h = rows * itemH;
  const items: React.ReactNode[] = [];
  for (let i = Math.floor(pos) - rows; i <= Math.ceil(pos) + rows; i++) {
    if (i < min || i > max) continue;
    const d = i - pos;
    const dist = Math.abs(d);
    items.push(
      <div
        key={i}
        className="absolute inset-x-0 flex items-center justify-center font-mono font-semibold pointer-events-none"
        style={{
          height: itemH,
          transform: `translateY(${h / 2 + d * itemH - itemH / 2}px) scale(${clamp(1 - dist * 0.16, 0.55, 1)})`,
          opacity: clamp(1 - dist * 0.3, 0.12, 1),
          fontSize: 21,
          color: dist < 0.5 ? accent : "var(--ink-2)",
          transition: "color .15s",
        }}
      >
        {format ? format(i) : i}
        {unit && <span className="ms-1.5 text-[10px] font-body font-medium" style={{ color: "var(--ink-3)" }}>{unit}</span>}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        {...drag.handlers}
        className="relative cursor-ns-resize select-none"
        style={{
          height: h,
          width: 150,
          touchAction: "none",
          maskImage: "linear-gradient(180deg, transparent, black 26%, black 74%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black 26%, black 74%, transparent)",
        }}
      >
        {items}
        <div className="absolute inset-x-2 pointer-events-none rounded-lg" style={{ top: h / 2 - itemH / 2, height: itemH, border: `1px solid ${accent}55`, background: `${accent}10` }} />
        <div className="absolute left-0 pointer-events-none" style={{ top: h / 2 - 5, width: 5, height: 10, background: accent, borderRadius: 2 }} />
        <div className="absolute right-0 pointer-events-none" style={{ top: h / 2 - 5, width: 5, height: 10, background: accent, borderRadius: 2 }} />
      </div>
    </div>
  );
}

/* ================= HTape (horizontal ruler with momentum + snap) ================= */

export function HTape({
  min, max, value, onChange, accent, ppu, major, labelEvery, height = 92, format, detent = 1,
}: {
  min: number; max: number; value: number; onChange: (v: number) => void; accent: string;
  ppu: number; major: number; labelEvery: number; height?: number; format?: (v: number) => string; detent?: number;
}) {
  const [ref, w] = useWidth<HTMLDivElement>();
  const [pos, setPos] = useState(value);
  const posR = useRef(value);
  const velR = useRef(0);
  const animR = useRef(0);
  const dragR = useRef(false);
  const lastInt = useRef(value);
  const chRef = useRef(onChange);
  chRef.current = onChange;

  useEffect(() => {
    if (!dragR.current) {
      cancelAnimationFrame(animR.current);
      posR.current = value;
      lastInt.current = value;
      setPos(value);
    }
  }, [value]);
  useEffect(() => () => cancelAnimationFrame(animR.current), []);

  const snapTo = (target: number) => {
    target = clamp(target, min, max);
    const from = posR.current;
    const start = performance.now();
    const dur = 220;
    const step = (now: number) => {
      const k = clamp((now - start) / dur, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      const p = from + (target - from) * e;
      posR.current = p;
      setPos(p);
      if (k < 1) animR.current = requestAnimationFrame(step);
      else chRef.current(target);
    };
    animR.current = requestAnimationFrame(step);
  };
  const inertia = () => {
    const step = () => {
      let p = posR.current + velR.current;
      velR.current *= 0.935;
      if (p < min) { p = min; velR.current = 0; }
      if (p > max) { p = max; velR.current = 0; }
      posR.current = p;
      setPos(p);
      const ri = clamp(Math.round(p / detent) * detent, min, max);
      if (ri !== lastInt.current) { lastInt.current = ri; chRef.current(ri); }
      if (Math.abs(velR.current) > 0.05) animR.current = requestAnimationFrame(step);
      else snapTo(ri);
    };
    animR.current = requestAnimationFrame(step);
  };
  const drag = usePointerDrag(
    ({ dx }) => {
      cancelAnimationFrame(animR.current);
      let p = posR.current - dx / ppu;
      if (p < min) p = min + (p - min) * 0.2;
      if (p > max) p = max + (p - max) * 0.2;
      velR.current = velR.current * 0.55 + (-dx / ppu) * 0.45;
      posR.current = p;
      setPos(p);
      const ri = clamp(Math.round(p / detent) * detent, min, max);
      if (ri !== lastInt.current) { lastInt.current = ri; chRef.current(ri); }
    },
    {
      onStart: () => { dragR.current = true; cancelAnimationFrame(animR.current); },
      onEnd: () => {
        dragR.current = false;
        const ri = clamp(Math.round(posR.current / detent) * detent, min, max);
        if (Math.abs(velR.current) > 0.18) inertia();
        else snapTo(ri);
      },
    }
  );

  const ticks: React.ReactNode[] = [];
  if (w > 0) {
    const span = Math.ceil(w / 2 / ppu) + 1;
    for (let i = Math.floor(pos) - span; i <= Math.ceil(pos) + span; i++) {
      if (i < min || i > max) continue;
      const x = w / 2 + (i - pos) * ppu;
      if (x < -20 || x > w + 20) continue;
      const isLabel = ((i % labelEvery) + labelEvery) % labelEvery === 0;
      const isMajor = ((i % major) + major) % major === 0;
      ticks.push(
        <React.Fragment key={i}>
          <span
            className="absolute bottom-3 rounded-full pointer-events-none"
            style={{ left: x, width: isMajor ? 2 : 1.5, height: isLabel ? 26 : isMajor ? 18 : 10, background: isLabel ? accent : "rgba(255,255,255,0.22)", opacity: isLabel ? 0.9 : 1, transform: "translateX(-50%)" }}
          />
          {isLabel && (
            <span className="absolute top-2.5 font-mono text-[10px] pointer-events-none" style={{ left: x, transform: "translateX(-50%)", color: "var(--ink-2)" }}>
              {format ? format(i) : i}
            </span>
          )}
        </React.Fragment>
      );
    }
  }

  return (
    <div
      ref={ref}
      {...drag.handlers}
      className="relative w-full cursor-ew-resize select-none overflow-hidden rounded-lg"
      style={{ height, background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.06)", touchAction: "none" }}
    >
      {ticks}
      <span className="absolute inset-y-1.5 pointer-events-none" style={{ left: "50%", width: 2, transform: "translateX(-50%)", background: accent, boxShadow: `0 0 10px ${accent}88` }} />
      <span className="absolute top-0 pointer-events-none" style={{ left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `6px solid ${accent}` }} />
    </div>
  );
}

/* ================= Segmented ================= */

export function Segmented<T extends string>({
  options, value, onChange, accent, className,
}: {
  options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; accent: string; className?: string;
}) {
  const idx = Math.max(0, options.findIndex((x) => x.id === value));
  const n = options.length;
  return (
    <div dir="ltr" className={`seg ${className ?? ""}`} style={{ "--acc": accent } as React.CSSProperties}>
      <div className="seg-thumb" style={{ width: `calc(${100 / n}% - 4px)`, left: `calc(${(idx * 100) / n}% + 2px)` }} />
      {options.map((x) => (
        <button key={x.id} type="button" className={`seg-btn ${x.id === value ? "on" : ""}`} onClick={() => onChange(x.id)}>
          {x.label}
        </button>
      ))}
    </div>
  );
}

/* ================= Stepper ================= */

export function Stepper({
  value, min, max, onChange, step = 1, format, accent, compact,
}: {
  value: number; min: number; max: number; onChange: (v: number) => void; step?: number;
  format?: (v: number) => string; accent: string; compact?: boolean;
}) {
  const vRef = useRef(value);
  vRef.current = value;
  const dec = useHold(() => onChange(clamp(vRef.current - step, min, max)));
  const inc = useHold(() => onChange(clamp(vRef.current + step, min, max)));
  return (
    <div dir="ltr" className="flex items-center gap-1.5">
      <button type="button" className="btn-icon" aria-label="decrease" {...dec}>
        <Icon name="minus" size={compact ? 12 : 14} />
      </button>
      <span className={`font-mono font-semibold text-center ${compact ? "text-[13px] min-w-10" : "text-[15px] min-w-14"}`} style={{ color: accent }}>
        {format ? format(value) : value}
      </span>
      <button type="button" className="btn-icon" aria-label="increase" {...inc}>
        <Icon name="plus" size={compact ? 12 : 14} />
      </button>
    </div>
  );
}

/* ================= Waveform ================= */

export function Wave({ peaks, accent, opacity = 0.9, className }: { peaks: number[]; accent: string; opacity?: number; className?: string }) {
  const n = peaks.length;
  return (
    <svg viewBox={`0 0 ${n * 2} 100`} preserveAspectRatio="none" className={className} style={{ width: "100%", height: "100%", display: "block" }}>
      {peaks.map((p, i) => (
        <rect key={i} x={i * 2} y={50 - p * 47} width={1.3} height={p * 94} rx={0.65} fill={accent} opacity={opacity} />
      ))}
    </svg>
  );
}

/* ================= ModelPanel ================= */

const stateFa: Record<string, string> = {
  Idle: "آماده",
  Pressed: "فشرده",
  Dragging: "کشیدن",
  Focused: "متمرکز",
  Changed: "تغییر کرد",
  Active: "فعال",
};

export function ModelPanel({
  letter, name, tag, note, accent, value, onReset, children, height = 250, flash = true, delay = 0,
}: {
  letter: string; name: string; tag: string; note: string; accent: string;
  value: string; onReset: () => void; children: React.ReactNode; height?: number; flash?: boolean; delay?: number;
}) {
  const [state, setState] = useState("Idle");
  const [spin, setSpin] = useState(0);
  const [flashN, setFlashN] = useState(0);
  const prevVal = useRef(value);
  const movedR = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (prevVal.current !== value) {
      prevVal.current = value;
      if (flash) setFlashN((f) => f + 1);
    }
  }, [value, flash]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const settle = (s: string, hold = 900) => {
    setState(s);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("Idle"), hold);
  };

  const live = state === "Dragging" || state === "Pressed";

  return (
    <section className="panel" style={{ "--acc": accent, animationDelay: `${delay}ms` } as React.CSSProperties}>
      <header className="flex items-start gap-3 px-4 pt-4">
        <div className="font-disp font-bold text-[13px] w-7 h-7 flex-none flex items-center justify-center rounded-lg border" style={{ borderColor: `${accent}44`, color: accent, background: `${accent}0f` }}>
          {letter}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-disp font-semibold text-[15px] leading-tight truncate" dir="ltr" style={{ textAlign: "left" }}>{name}</h3>
            <button
              type="button"
              className="btn-icon"
              aria-label="reset"
              title="Reset"
              onClick={() => { onReset(); setSpin((s) => s + 1); }}
            >
              <Icon name="reset" size={14} className={spin ? "spin-once" : undefined} key={spin} />
            </button>
          </div>
          <span className="inline-block mt-1 text-[10.5px] font-medium px-2 py-0.5 rounded-md" style={{ color: "var(--ink-2)", background: "rgba(255,255,255,0.045)", border: "1px solid var(--line)" }}>
            {tag}
          </span>
        </div>
      </header>

      <div className="px-4 pt-2.5 flex items-baseline gap-2" dir="ltr">
        <span key={flash ? flashN : "static"} className="value-pop font-mono font-bold text-[22px] leading-none" style={{ color: accent }}>
          {value}
        </span>
      </div>

      <p className="px-4 pt-2 pb-3 text-[11.5px] leading-5 text-[var(--ink-3)]">{note}</p>

      <div
        className="stage"
        dir="ltr"
        data-live={live ? "1" : "0"}
        style={{ height }}
        onPointerDownCapture={() => { movedR.current = false; setState("Pressed"); }}
        onPointerMoveCapture={(e) => {
          if (e.buttons > 0 || e.pointerType === "touch") {
            if (state === "Pressed" || state === "Dragging") {
              movedR.current = true;
              setState("Dragging");
            }
          }
        }}
        onPointerUpCapture={() => settle(movedR.current ? "Changed" : "Active", movedR.current ? 900 : 450)}
        onFocusCapture={() => { if (state === "Idle") setState("Focused"); }}
        onBlurCapture={() => { if (state === "Focused") setState("Idle"); }}
      >
        <div className="relative w-full h-full flex items-center justify-center">{children}</div>
      </div>

      <footer className="px-4 pb-3.5 -mt-1 flex items-center gap-2">
        <span
          className="w-1.5 h-1.5 rounded-full transition-colors"
          style={{ background: state === "Idle" ? "var(--ink-3)" : state === "Changed" ? accent : "#e8c15a" }}
        />
        <span className="text-[10.5px] font-medium" style={{ color: "var(--ink-3)" }}>
          {stateFa[state]}
        </span>
        <span className="ms-auto font-mono text-[9.5px] tracking-widest uppercase" style={{ color: "var(--ink-3)", opacity: 0.7 }}>
          model {letter}
        </span>
      </footer>
    </section>
  );
}

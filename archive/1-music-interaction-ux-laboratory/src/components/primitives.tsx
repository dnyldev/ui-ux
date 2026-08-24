import { useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as RKE, PointerEvent as RPE, ReactNode } from "react";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  useDrag,
  useHoldPress,
  clamp,
  lerp,
  norm,
  describeArc,
  polar,
  roundTo,
  wrap,
  haptic,
} from "@/lib/controls";

const angleOf = (px: number, py: number, cx: number, cy: number) =>
  wrap((Math.atan2(px - cx, cy - py) * 180) / Math.PI, 360);
const signedDelta = (a: number, b: number) => wrap(b - a + 180, 360) - 180;

/* --------------------------------------------------------------- Knob */
export interface KnobProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  def?: number;
  size?: number;
  color?: string;
  sensitivity?: number;
  format?: (v: number) => string;
  label?: string;
  sub?: string;
  start?: number;
  sweep?: number;
  detents?: number[];
  centerValue?: boolean;
}
export function Knob({
  value,
  min = 0,
  max = 1,
  step = 0,
  onChange,
  def,
  size = 108,
  color = "var(--color-accent)",
  sensitivity = 200,
  format,
  label,
  sub,
  start = 140,
  sweep = 260,
  detents,
  centerValue = true,
}: KnobProps) {
  const t = norm(value, min, max);
  const angle = start + t * sweep;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 9;
  const capR = r - 7;

  const drag = useDrag({
    onMove: ({ dy, shift }) => {
      const s = shift ? sensitivity * 5 : sensitivity;
      let nv = value + (-dy / s) * (max - min);
      nv = clamp(nv, min, max);
      if (step) nv = clamp(roundTo(nv, step), min, max);
      if (detents)
        for (const d of detents)
          if (Math.abs(nv - d) < (max - min) * 0.02) {
            nv = d;
            haptic(4);
            break;
          }
      if (nv !== value) onChange(nv);
    },
    onEnd: () => haptic(6),
  });

  const onKey = (e: RKE<HTMLDivElement>) => {
    const big = (max - min) / 20;
    const small = step || (max - min) / 100;
    if (["ArrowUp", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      onChange(clamp(value + (e.shiftKey ? small : big), min, max));
    } else if (["ArrowDown", "ArrowLeft"].includes(e.key)) {
      e.preventDefault();
      onChange(clamp(value - (e.shiftKey ? small : big), min, max));
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(min);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(max);
    } else if ((e.key === "Enter" || e.key === " ") && def !== undefined) {
      e.preventDefault();
      onChange(def);
    }
  };

  const p0 = polar(cx, cy, capR - 3, angle);
  const p1 = polar(cx, cy, r - 1, angle);

  return (
    <div className="flex flex-col items-center gap-2.5">
      <motion.div
        animate={{ scale: drag.dragging ? 1.04 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="relative grab outline-none"
        style={{ width: size, height: size }}
        onPointerDown={drag.onPointerDown}
        onDoubleClick={() => def !== undefined && onChange(def)}
        onKeyDown={onKey}
        tabIndex={0}
        role="slider"
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={label}
      >
        <svg width={size} height={size} className="absolute inset-0 overflow-visible">
          <path
            d={describeArc(cx, cy, r, start, start + sweep)}
            stroke="var(--color-line2)"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={describeArc(cx, cy, r, start, angle)}
            stroke={color}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={capR} fill="var(--color-raised)" stroke="var(--color-line2)" strokeWidth={1} />
          <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke={color} strokeWidth={3} strokeLinecap="round" />
        </svg>
        {centerValue && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            {format ? (
              <span className="tnum font-medium tracking-tight text-fg" style={{ fontSize: Math.max(15, size * 0.19) }}>
                {format(value)}
              </span>
            ) : label ? (
              <span className="text-[10px] uppercase tracking-[0.16em] text-faint">
                {label}
              </span>
            ) : null}
          </div>
        )}
      </motion.div>
      {sub && <span className="text-[11px] tnum text-faint">{sub}</span>}
    </div>
  );
}

/* ------------------------------------------------------------ ArcSlider */
export interface ArcSliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  def?: number;
  size?: number;
  start?: number;
  sweep?: number;
  color?: string;
  format?: (v: number) => string;
  label?: string;
}
export function ArcSlider({
  value,
  min = 0,
  max = 1,
  onChange,
  def,
  size = 156,
  start = 150,
  sweep = 260,
  color = "var(--color-accent)",
  format,
  label,
}: ArcSliderProps) {
  const t = norm(value, min, max);
  const angle = start + t * sweep;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;
  const ref = useRef<HTMLDivElement>(null);

  const drag = useDrag({
    onMove: ({ px, py }) => {
      const el = ref.current;
      if (!el) return;
      const rc = el.getBoundingClientRect();
      const cx2 = rc.left + rc.width / 2;
      const cy2 = rc.top + rc.height / 2;
      let rel = wrap(angleOf(px, py, cx2, cy2) - start, 360);
      if (rel > sweep) rel = rel < (sweep + 360) / 2 ? sweep : 0;
      onChange(lerp(min, max, clamp(rel / sweep, 0, 1)));
    },
    onEnd: () => haptic(6),
  });

  const hp = polar(cx, cy, r, angle);
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={ref}
        className="relative grab"
        style={{ width: size, height: size }}
        onPointerDown={drag.onPointerDown}
        onDoubleClick={() => def !== undefined && onChange(def)}
      >
        <svg width={size} height={size} className="absolute inset-0 overflow-visible">
          <path
            d={describeArc(cx, cy, r, start, start + sweep)}
            stroke="var(--color-line2)"
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={describeArc(cx, cy, r, start, angle)}
            stroke={color}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={hp.x} cy={hp.y} r={10} fill="var(--color-fg)" stroke={color} strokeWidth={3} />
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            {format && (
              <span className="tnum text-2xl font-semibold tracking-tight text-fg">
                {format(value)}
              </span>
            )}
            {label && (
              <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-faint">
                {label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Fader */
export interface FaderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  def?: number;
  orientation?: "v" | "h";
  length?: number;
  color?: string;
  label?: string;
  unit?: string;
  ticks?: { pos: number; label: string }[];
  thumb?: number;
}
export function Fader({
  value,
  min = 0,
  max = 1,
  onChange,
  def,
  orientation = "v",
  length = 184,
  color = "var(--color-accent)",
  unit,
  ticks,
  thumb = 40,
}: FaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const v = orientation === "v";
  const t = norm(value, min, max);
  const rect = useRef<DOMRect | null>(null);

  const fromPointer = (px: number, py: number) => {
    const r = rect.current!;
    if (v) return lerp(max, min, clamp((py - r.top) / r.height, 0, 1));
    return lerp(min, max, clamp((px - r.left) / r.width, 0, 1));
  };
  const drag = useDrag({
    onStart: () => {
      rect.current = ref.current!.getBoundingClientRect();
    },
    onMove: ({ px, py }) => onChange(fromPointer(px, py)),
  });
  const onDown = (e: RPE) => {
    rect.current = ref.current!.getBoundingClientRect();
    onChange(fromPointer(e.clientX, e.clientY));
    drag.onPointerDown(e);
  };

  if (v) {
    return (
      <div className="flex items-stretch gap-3">
        {ticks && (
          <div className="flex flex-col justify-between py-1 text-right">
            {ticks.map((tk, i) => (
              <span
                key={i}
                className="text-[9px] tnum leading-none text-faint"
                style={{ color: Math.abs(tk.pos - t) < 0.06 ? "var(--color-fg)" : undefined }}
              >
                {tk.label}
              </span>
            ))}
          </div>
        )}
        <div
          ref={ref}
          className="relative grab w-9"
          style={{ height: length }}
          onPointerDown={onDown}
          onDoubleClick={() => def !== undefined && onChange(def)}
          role="slider"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        >
          <div className="absolute bottom-0 left-1/2 top-0 w-[5px] -translate-x-1/2 rounded-full bg-hi" />
          <div
            className="absolute bottom-0 left-1/2 w-[5px] -translate-x-1/2 rounded-full"
            style={{ height: `${t * 100}%`, background: color }}
          />
          <motion.div
            animate={{ scale: drag.dragging ? 1.06 : 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line2 bg-raised shadow-lg shadow-black/50"
            style={{ width: thumb, height: 24, top: `${(1 - t) * 100}%` }}
          >
            <div className="flex h-full items-center justify-center gap-[2px]">
              <span className="h-3 w-px bg-line2" />
              <span className="h-3 w-px bg-line2" />
            </div>
          </motion.div>
        </div>
        {unit && <span className="self-center -ml-1 text-[10px] tnum text-faint">{unit}</span>}
      </div>
    );
  }
  return (
    <div className="w-full">
      <div
        ref={ref}
        className="relative grab h-9 w-full"
        onPointerDown={onDown}
        onDoubleClick={() => def !== undefined && onChange(def)}
      >
        <div className="absolute left-0 right-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full bg-hi" />
        <div
          className="absolute left-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full"
          style={{ width: `${t * 100}%`, background: color }}
        />
        <motion.div
          animate={{ scale: drag.dragging ? 1.08 : 1 }}
          className="absolute top-1/2 h-7 w-5 -translate-x-1/2 -translate-y-1/2 rounded-md border border-line2 bg-raised"
          style={{ left: `${t * 100}%` }}
        />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- XYPad */
export interface XYPadProps {
  x?: number;
  y?: number;
  onChange: (x: number, y: number) => void;
  size?: number;
  color?: string;
  grid?: boolean;
  snap?: boolean;
  snapStep?: number;
  labels?: { x0?: string; x1?: string };
}
export function XYPad({
  x = 0.5,
  y = 0.5,
  onChange,
  size = 176,
  color = "var(--color-accent)",
  grid = true,
  snap = false,
  snapStep = 0.1,
  labels,
}: XYPadProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fromP = (px: number, py: number) => {
    const r = ref.current!.getBoundingClientRect();
    return {
      x: clamp((px - r.left) / r.width, 0, 1),
      y: clamp((py - r.top) / r.height, 0, 1),
    };
  };
  const snapXY = (gx: number, gy: number) =>
    snap
      ? { x: roundTo(gx, snapStep), y: roundTo(gy, snapStep) }
      : { x: gx, y: gy };
  const drag = useDrag({
    onMove: ({ px, py }) => {
      const g = snapXY(...Object.values(fromP(px, py)) as [number, number]);
      onChange(g.x, g.y);
    },
  });
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        ref={ref}
        className="relative grab overflow-hidden rounded-2xl border border-line bg-surface"
        style={{ width: size, height: size }}
        onPointerDown={(e) => {
          const g = snapXY(...Object.values(fromP(e.clientX, e.clientY)) as [number, number]);
          onChange(g.x, g.y);
          drag.onPointerDown(e);
        }}
      >
        {grid && (
          <>
            <div className="absolute bottom-3 top-3 left-1/2 w-px bg-line" />
            <div className="absolute left-3 right-3 top-1/2 h-px bg-line" />
          </>
        )}
        <div className="pointer-events-none absolute bottom-0 top-0 w-px" style={{ left: `${x * 100}%`, background: color, opacity: 0.35 }} />
        <div className="pointer-events-none absolute left-0 right-0 h-px" style={{ top: `${y * 100}%`, background: color, opacity: 0.35 }} />
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            background: "var(--color-fg)",
            borderColor: color,
          }}
        />
      </div>
      {labels && (
        <div className="flex w-full justify-between px-1 text-[9px] uppercase tracking-wider text-faint">
          <span>{labels.x0}</span>
          <span>{labels.x1}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- JogWheel */
export interface JogWheelProps {
  position?: number;
  onChange: (p: number) => void;
  size?: number;
  color?: string;
  format?: (p: number) => string;
  fullTurns?: number;
}
export function JogWheel({
  position = 0,
  onChange,
  size = 180,
  color = "var(--color-accent)",
  format,
  fullTurns = 1,
}: JogWheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(position * 360 * fullTurns);
  const ang = useRef(position * 360 * fullTurns);
  const vel = useRef(0);
  const raf = useRef<number | undefined>(undefined);
  const center = useRef({ x: 0, y: 0 });
  const last = useRef(0);

  const stop = () => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = undefined;
    }
  };
  const apply = (a: number) => {
    ang.current = a;
    setAngle(a);
    onChange(wrap(a / (360 * fullTurns), 1));
  };
  const loop = () => {
    const v = vel.current;
    if (Math.abs(v) < 0.02) {
      vel.current = 0;
      raf.current = undefined;
      return;
    }
    apply(ang.current + v * 16);
    vel.current *= 0.945;
    raf.current = requestAnimationFrame(loop);
  };

  const drag = useDrag({
    onStart: (e) => {
      stop();
      const rc = ref.current!.getBoundingClientRect();
      center.current = { x: rc.left + rc.width / 2, y: rc.top + rc.height / 2 };
      last.current = angleOf(e.clientX, e.clientY, center.current.x, center.current.y);
    },
    onMove: ({ px, py, shift }) => {
      const a = angleOf(px, py, center.current.x, center.current.y);
      const d = signedDelta(last.current, a);
      last.current = a;
      const f = shift ? 0.22 : 1;
      apply(ang.current + d * f);
      vel.current = d * 0.06;
    },
    onEnd: () => {
      if (Math.abs(vel.current) > 0.04) raf.current = requestAnimationFrame(loop);
      haptic(6);
    },
  });

  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 2;
  const ticks = Array.from({ length: 24 });
  const pos = wrap(ang.current / (360 * fullTurns), 1);
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={ref}
        className="relative grab rounded-full"
        style={{ width: size, height: size }}
        onPointerDown={drag.onPointerDown}
      >
        <div className="absolute inset-0 rounded-full border border-line bg-surface" />
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {ticks.map((_, i) => {
            const a = (i / ticks.length) * 360;
            const big = i % 6 === 0;
            const p1 = polar(cx, cy, R - 6, a);
            const p0 = polar(cx, cy, R - (big ? 20 : 14), a);
            return (
              <line
                key={i}
                x1={p0.x}
                y1={p0.y}
                x2={p1.x}
                y2={p1.y}
                stroke={big ? "var(--color-muted)" : "var(--color-line2)"}
                strokeWidth={big ? 2 : 1}
              />
            );
          })}
          <circle cx={cx} cy={cy} r={R - 26} fill="none" stroke="var(--color-line)" strokeWidth={1} />
        </svg>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <div
            className="h-0 w-0 border-x-[6px] border-x-transparent border-t-[9px]"
            style={{ borderTopColor: color }}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="tnum text-lg font-medium text-fg">
            {format ? format(pos) : `${Math.round(pos * 100)}%`}
          </span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Stepper */
export interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  def?: number;
  format?: (v: number) => string;
  unit?: string;
  editable?: boolean;
}
export function Stepper({
  value,
  onChange,
  step = 1,
  min = -Infinity,
  max = Infinity,
  def,
  format,
  unit,
  editable = true,
}: StepperProps) {
  const dec = useHoldPress(() => onChange(clamp(value - step, min, max)));
  const inc = useHoldPress(() => onChange(clamp(value + step, min, max)));
  const [edit, setEdit] = useState(false);
  const [draft, setDraft] = useState("");
  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n)) onChange(clamp(n, min, max));
    setEdit(false);
  };
  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="decrease"
        onPointerDown={(e) => {
          e.preventDefault();
          dec.start();
        }}
        onPointerUp={dec.stop}
        onPointerLeave={dec.stop}
        onPointerCancel={dec.stop}
        className="tap grid h-11 w-11 place-items-center rounded-xl border border-line bg-raised text-muted transition hover:border-line2 hover:text-fg active:scale-95"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="min-w-[4.5rem] text-center" onDoubleClick={() => def !== undefined && onChange(def)}>
        {edit ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEdit(false);
            }}
            className="w-20 rounded-md border border-line2 bg-surface px-2 py-1 text-center tnum text-lg text-fg outline-none"
          />
        ) : (
          <button
            onClick={() => {
              if (editable) {
                setDraft(String(value));
                setEdit(true);
              }
            }}
            className="tnum text-2xl font-semibold tracking-tight text-fg transition hover:text-accent"
          >
            {format ? format(value) : value}
            {unit}
          </button>
        )}
      </div>
      <button
        aria-label="increase"
        onPointerDown={(e) => {
          e.preventDefault();
          inc.start();
        }}
        onPointerUp={inc.stop}
        onPointerLeave={inc.stop}
        onPointerCancel={inc.stop}
        className="tap grid h-11 w-11 place-items-center rounded-xl border border-line bg-raised text-muted transition hover:border-line2 hover:text-fg active:scale-95"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

/* --------------------------------------------------------------- Region */
export interface RegionProps {
  start: number;
  end: number;
  onChange: (s: number, e: number) => void;
  minSpan?: number;
  color?: string;
  height?: number;
  className?: string;
  fillStyle?: CSSProperties;
  children?: ReactNode;
}
export function Region({
  start,
  end,
  onChange,
  minSpan = 0.02,
  color = "var(--color-amber)",
  height = 120,
  className,
  fillStyle,
  children,
}: RegionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mode = useRef<null | "a" | "b" | "move">(null);
  const grab = useRef(0);
  const fx = (px: number) => {
    const r = ref.current!.getBoundingClientRect();
    return clamp((px - r.left) / r.width, 0, 1);
  };
  const drag = useDrag({
    onMove: ({ px }) => {
      if (mode.current === "a") onChange(clamp(fx(px), 0, end - minSpan), end);
      else if (mode.current === "b") onChange(start, clamp(fx(px), start + minSpan, 1));
      else if (mode.current === "move") {
        const w = end - start;
        const ns = clamp(fx(px) - grab.current, 0, 1 - w);
        onChange(ns, ns + w);
      }
    },
    onEnd: () => {
      mode.current = null;
    },
  });
  const begin = (m: "a" | "b" | "move") => (e: RPE) => {
    mode.current = m;
    if (m === "move") grab.current = fx(e.clientX) - start;
    drag.onPointerDown(e);
  };
  return (
    <div ref={ref} className={cn("relative w-full select-none", className)} style={{ height }}>
      {children}
      <div className="absolute bottom-0 top-0" style={{ left: `${start * 100}%`, right: `${(1 - end) * 100}%` }}>
        <div
          className="absolute inset-0 rounded-md"
          style={{
            background: `color-mix(in oklab, ${color} 16%, transparent)`,
            borderLeft: `2px solid ${color}`,
            borderRight: `2px solid ${color}`,
            ...fillStyle,
          }}
        />
        <div className="absolute inset-0 grab" onPointerDown={begin("move")} />
      </div>
      <div
        onPointerDown={begin("a")}
        className="grab absolute bottom-0 top-0"
        style={{ left: `${start * 100}%`, width: 16, transform: "translateX(-50%)" }}
      >
        <div className="mx-auto h-full w-[3px] rounded-full" style={{ background: color }} />
      </div>
      <div
        onPointerDown={begin("b")}
        className="grab absolute bottom-0 top-0"
        style={{ left: `${end * 100}%`, width: 16, transform: "translateX(-50%)" }}
      >
        <div className="mx-auto h-full w-[3px] rounded-full" style={{ background: color }} />
      </div>
    </div>
  );
}

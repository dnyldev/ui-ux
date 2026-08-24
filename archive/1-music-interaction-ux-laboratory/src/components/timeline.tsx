import { useRef } from "react";
import type { PointerEvent as RPE, ReactNode } from "react";
import { useDrag, clamp } from "@/lib/controls";

export const formatTime = (sec: number) => {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
};

export function ScrubRail({
  pos,
  onChange,
  children,
  height = 88,
  tone = "var(--color-accent)",
  showHandle = true,
}: {
  pos: number;
  onChange: (p: number) => void;
  children?: ReactNode;
  height?: number;
  tone?: string;
  showHandle?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fx = (px: number) => {
    const r = ref.current!.getBoundingClientRect();
    return clamp((px - r.left) / r.width, 0, 1);
  };
  const drag = useDrag({ onMove: ({ px }) => onChange(fx(px)) });
  const onDown = (e: RPE) => {
    onChange(fx(e.clientX));
    drag.onPointerDown(e);
  };
  return (
    <div
      ref={ref}
      className="relative w-full grab"
      style={{ height }}
      onPointerDown={onDown}
    >
      {children}
      <div
        className="pointer-events-none absolute inset-y-0 w-px"
        style={{ left: `${pos * 100}%`, background: tone }}
      />
      {showHandle && (
        <div
          className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ left: `${pos * 100}%`, background: "var(--color-fg)", borderColor: tone }}
        />
      )}
    </div>
  );
}

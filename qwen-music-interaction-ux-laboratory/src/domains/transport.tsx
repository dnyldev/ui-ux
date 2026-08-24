import React, { useEffect, useRef, useState } from "react";
import {
  clamp, Dial, DomainDef, Icon, ModelPanel, Segmented, Stepper, Wave, fmtTime, genPeaks,
  snap, useBeatClock, usePlayer, usePointerDrag, useWidth,
} from "../lib/core";

const DUR = 154;
const PEAKS = genPeaks(7, 170);

/* ================= 04 · PLAYBACK / SEEK ================= */

function ScrubMomentum({ accent }: { accent: string }) {
  const { time, playing, toggle, seek } = usePlayer(DUR);
  const tRef = useRef(time);
  tRef.current = time;
  const [ref, w] = useWidth<HTMLDivElement>();
  const vel = useRef(0);
  const anim = useRef(0);

  useEffect(() => () => cancelAnimationFrame(anim.current), []);
  const momentum = () => {
    const step = () => {
      seek(tRef.current + vel.current);
      vel.current *= 0.9;
      if (Math.abs(vel.current) > 0.004) anim.current = requestAnimationFrame(step);
    };
    anim.current = requestAnimationFrame(step);
  };
  const drag = usePointerDrag(
    ({ dx }) => {
      cancelAnimationFrame(anim.current);
      if (w > 0) {
        const d = (dx / w) * DUR;
        vel.current = d * 0.85;
        seek(tRef.current + d);
      }
    },
    { onEnd: () => { if (Math.abs(vel.current) > 0.02) momentum(); } }
  );

  const pct = (time / DUR) * 100;
  return (
    <ModelPanel
      letter="A" name="Scrub + Momentum" tag="خطی · اینرسی" accent={accent} flash={false}
      note="درگ روی موج با نگاشت مستقیم؛ بعد از رهاکردن، اینرسی با اصطکاک ادامه می‌یابد — مثل نوار کاست."
      value={`${fmtTime(time)} / ${fmtTime(DUR)}`} onReset={() => { seek(0); }}
    >
      <div className="w-full px-4 flex flex-col justify-center gap-3.5 h-full">
        <div ref={ref} {...drag.handlers} className="relative h-20 cursor-ew-resize">
          <Wave peaks={PEAKS} accent="#5a6170" opacity={0.55} />
          <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
            <div className="h-full" style={{ width: w }}>
              <Wave peaks={PEAKS} accent={accent} />
            </div>
          </div>
          <span className="absolute inset-y-0 w-[2px] rounded-full" style={{ left: `${pct}%`, background: accent, boxShadow: `0 0 10px ${accent}` }} />
        </div>
        <div className="flex items-center justify-between">
          <button type="button" className="btn-icon" style={{ width: 38, height: 38, borderRadius: 19, borderColor: `${accent}55`, color: accent }} onClick={toggle} aria-label="play/pause">
            <Icon name={playing ? "pause" : "play"} size={17} />
          </button>
          <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--ink-3)" }}>{playing ? "playing" : "paused"} · release for glide</span>
        </div>
      </div>
    </ModelPanel>
  );
}

function JogWheel({ accent }: { accent: string }) {
  const { time, playing, toggle, seek } = usePlayer(DUR);
  const tRef = useRef(time);
  tRef.current = time;
  const [rot, setRot] = useState(0);
  const rotR = useRef(0);
  const angR = useRef<number | null>(null);
  const discRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      rotR.current += ((now - last) / 1000) * 42;
      last = now;
      setRot(rotR.current);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const angleOf = (e: React.PointerEvent) => {
    const el = discRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  const drag = usePointerDrag(
    ({ x, y }) => {
      if (angR.current == null || !discRef.current) return;
      const r = discRef.current.getBoundingClientRect();
      const a = (Math.atan2(y - (r.top + r.height / 2), x - (r.left + r.width / 2)) * 180) / Math.PI;
      let d = a - angR.current;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      angR.current = a;
      rotR.current += d;
      setRot(rotR.current);
      seek(tRef.current + (d / 360) * 12);
    }
  );
  const down = (e: React.PointerEvent<HTMLElement>) => {
    angR.current = angleOf(e);
    drag.handlers.onPointerDown?.(e);
  };

  const pct = (time / DUR) * 100;
  return (
    <ModelPanel
      letter="B" name="Jog Wheel" tag="چرخشی · نسبی" accent={accent} flash={false}
      note="الگوی Serato و rekordbox؛ هر دور کامل ۱۲ ثانیه. هنگام پخش، دیسک مثل وینیل می‌چرخد."
      value={`${fmtTime(time)} · ±12s/rev`} onReset={() => { seek(0); rotR.current = 0; setRot(0); }}
    >
      <div className="flex flex-col items-center gap-3 py-1">
        <div
          ref={discRef}
          {...drag.handlers}
          onPointerDown={down}
          className="relative rounded-full cursor-grab active:cursor-grabbing"
          style={{ width: 158, height: 158, background: "radial-gradient(circle at 50% 34%, #2e323c, #17191e 70%)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 2px 12px rgba(255,255,255,0.05), 0 12px 30px -12px rgba(0,0,0,.8)" }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0">
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1" strokeDasharray="2 3" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </svg>
          <div className="absolute inset-0" style={{ transform: `rotate(${rot}deg)` }}>
            <span className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full" style={{ top: 7, background: accent, boxShadow: `0 0 8px ${accent}` }} />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, #22252d 0 26%, transparent 27%)" }}>
            <span className="font-mono font-semibold text-[13px]" style={{ color: accent }}>{fmtTime(time).slice(0, 4)}</span>
          </div>
          <div className="absolute inset-x-6 bottom-1.5 h-1 rounded-full overflow-hidden pointer-events-none" style={{ background: "rgba(255,255,255,0.08)" }}>
            <span className="block h-full" style={{ width: `${pct}%`, background: accent }} />
          </div>
        </div>
        <button type="button" className="btn-icon" style={{ width: 34, height: 34, borderRadius: 17, borderColor: `${accent}55`, color: accent }} onClick={toggle} aria-label="play/pause">
          <Icon name={playing ? "pause" : "play"} size={15} />
        </button>
      </div>
    </ModelPanel>
  );
}

function HoldScan({ accent }: { accent: string }) {
  const { time, playing, toggle, seek } = usePlayer(DUR);
  const tRef = useRef(time);
  tRef.current = time;
  const [ref, w] = useWidth<HTMLDivElement>();
  const [scanDir, setScanDir] = useState(0);
  const [speed, setSpeed] = useState(0);
  const downT = useRef(0);
  const downX = useRef(0);

  useEffect(() => {
    if (scanDir === 0) return;
    let raf = 0;
    let last = performance.now();
    const t0 = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const k = clamp((now - t0) / 1400, 0, 1);
      const sp = 2 + 14 * k * k;
      setSpeed(Math.round(sp));
      seek(tRef.current + scanDir * sp * dt);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [scanDir]);

  const pct = (time / DUR) * 100;
  return (
    <ModelPanel
      letter="C" name="Hold to Scan" tag="نگه‌داشتن · نرخ متغیر" accent={accent} flash={false}
      note="الگوی پلیرهای موبایل: تَپ برای پرش، نگه‌داشتن دو طرف برای اسکن با سرعت فزاینده — بدون جابه‌جایی انگشت."
      value={`${fmtTime(time)}${scanDir !== 0 ? ` · ×${speed} ${scanDir > 0 ? "≫" : "≪"}` : ""}`} onReset={() => seek(0)}
    >
      <div className="w-full px-4 flex flex-col justify-center gap-3 h-full">
        <div
          ref={ref}
          className="relative h-20 cursor-pointer"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            downT.current = performance.now();
            downX.current = e.clientX;
            const r = e.currentTarget.getBoundingClientRect();
            const fx = (e.clientX - r.left) / r.width;
            setScanDir(fx < 0.33 ? -1 : fx > 0.67 ? 1 : 0);
          }}
          onPointerUp={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const quick = performance.now() - downT.current < 240 && Math.abs(e.clientX - downX.current) < 8;
            setScanDir(0);
            setSpeed(0);
            if (quick) seek(((e.clientX - r.left) / r.width) * DUR);
          }}
          onPointerCancel={() => { setScanDir(0); setSpeed(0); }}
        >
          <Wave peaks={PEAKS} accent="#5a6170" opacity={0.55} />
          <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
            <div className="h-full" style={{ width: w }}>
              <Wave peaks={PEAKS} accent={accent} />
            </div>
          </div>
          <span className="absolute inset-y-0 w-[2px]" style={{ left: `${pct}%`, background: accent, boxShadow: `0 0 10px ${accent}` }} />
          {[0.33, 0.67].map((z) => (
            <span key={z} className="absolute inset-y-2 w-px pointer-events-none" style={{ left: `${z * 100}%`, background: "rgba(255,255,255,0.09)" }} />
          ))}
          {scanDir !== 0 && (
            <span className="absolute top-1.5 font-mono font-bold text-[11px] px-2 py-0.5 rounded-md fade-in" style={{ [scanDir > 0 ? "right" : "left"]: 6, background: `${accent}22`, color: accent, border: `1px solid ${accent}55` } as React.CSSProperties}>
              ×{speed}
            </span>
          )}
        </div>
        <div className="flex items-center justify-center">
          <button type="button" className="btn-icon" style={{ width: 40, height: 40, borderRadius: 20, borderColor: `${accent}55`, color: accent }} onClick={toggle} aria-label="play/pause">
            <Icon name={playing ? "pause" : "play"} size={17} />
          </button>
        </div>
      </div>
    </ModelPanel>
  );
}

export const playbackDomain: DomainDef = {
  id: "playback", num: "04", title: "Playback / Seek", fa: "پخش و جست‌وجو", accent: "#5fb2e8", group: "transport",
  note: "اسکراب با اینرسی برای تایم‌لاین طبیعی است، جاگ‌ویل از فرهنگ DJ می‌آید و برای Nudge دقیق، و Hold-to-scan سریع‌ترین الگوی موبایل است.",
  models: [
    { name: "Scrub + Momentum", tag: "", note: "", Comp: ScrubMomentum },
    { name: "Jog Wheel", tag: "", note: "", Comp: JogWheel },
    { name: "Hold to Scan", tag: "", note: "", Comp: HoldScan },
  ],
};

/* ================= 05 · LOOP A-B ================= */

const BARSEC = 2;
const BARS = 8;
const BEATS = BARS * 4;

function LoopHandles({ accent }: { accent: string }) {
  const [a, setA] = useState(8);
  const [b, setB] = useState(20);
  const [on, setOn] = useState(true);
  const [ref, w] = useWidth<HTMLDivElement>();
  const aR = useRef(a); aR.current = a;
  const bR = useRef(b); bR.current = b;
  const acc = useRef(0);
  const a0 = useRef(0);
  const len0 = useRef(0);
  const ppb = w > 0 ? w / BEATS : 10;

  const dragA = usePointerDrag(({ dx }) => {
    acc.current += dx / ppb;
    setA(clamp(a0.current + snap(acc.current, 0.5), 0, bR.current - 1));
  }, { onStart: () => { acc.current = 0; a0.current = aR.current; } });
  const dragB = usePointerDrag(({ dx }) => {
    acc.current += dx / ppb;
    setB(clamp(a0.current + snap(acc.current, 0.5), aR.current + 1, BEATS));
  }, { onStart: () => { acc.current = 0; a0.current = bR.current; } });
  const dragR = usePointerDrag(({ dx }) => {
    acc.current += dx / ppb;
    const d = snap(acc.current, 0.5);
    const na = clamp(a0.current + d, 0, BEATS - len0.current);
    setA(na);
    setB(na + len0.current);
  }, { onStart: () => { acc.current = 0; a0.current = aR.current; len0.current = bR.current - aR.current; } });

  return (
    <ModelPanel
      letter="A" name="Range Handles" tag="فضایی · مستقیم" accent={accent}
      note="دو دستگیره و ناحیه‌ی قابل‌درگ؛ الگوی کلاسیک ویرایشگرهای صوتی برای تعیین دقیق محدوده."
      value={`${(a / 4 + 1).toFixed(1)} → ${(b / 4).toFixed(1)} · ${((b - a) / 4).toFixed(1)} bar`} onReset={() => { setA(8); setB(20); setOn(true); }}
    >
      <div className="w-full px-4 flex flex-col justify-center gap-4 h-full">
        <div ref={ref} className="relative h-16 rounded-lg" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {Array.from({ length: BARS + 1 }, (_, i) => (
            <span key={i} className="absolute inset-y-2 w-px" style={{ left: `${(i / BARS) * 100}%`, background: i % 4 === 0 ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)" }} />
          ))}
          <div {...dragR.handlers} className="absolute inset-y-1 rounded-md cursor-grab active:cursor-grabbing" style={{ left: (a / BEATS) * 100 + "%", width: ((b - a) / BEATS) * 100 + "%", background: `${accent}1c`, border: `1px solid ${accent}66` }}>
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-[3px]">
              {[0, 1, 2].map((i) => <span key={i} className="w-[2px] h-3 rounded-full" style={{ background: `${accent}88` }} />)}
            </span>
          </div>
          <div onPointerDown={(e) => e.stopPropagation()} {...dragA.handlers} className="handle inset-y-0 w-3.5 rounded-l-md flex items-center justify-center" style={{ left: `calc(${(a / BEATS) * 100}% - 7px)`, background: accent }}>
            <span className="font-disp font-bold text-[9px]" style={{ color: "#141519" }}>A</span>
          </div>
          <div onPointerDown={(e) => e.stopPropagation()} {...dragB.handlers} className="handle inset-y-0 w-3.5 rounded-r-md flex items-center justify-center" style={{ left: `calc(${(b / BEATS) * 100}% - 7px)`, background: accent }}>
            <span className="font-disp font-bold text-[9px]" style={{ color: "#141519" }}>B</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button type="button" className={`chip font-disp font-bold text-[11px] ${on ? "on" : ""}`} style={{ "--acc": accent } as React.CSSProperties} onClick={() => setOn((v) => !v)}>
            <Icon name="reset" size={11} /> LOOP {on ? "ON" : "OFF"}
          </button>
          <span className="font-mono text-[10px]" style={{ color: "var(--ink-3)" }}>{Math.round((b - a) / 4 * BARSEC * 10) / 10}s</span>
        </div>
      </div>
    </ModelPanel>
  );
}

function LoopInOut({ accent }: { accent: string }) {
  const { time, playing, toggle, seek } = usePlayer(BARSEC * BARS, true);
  const [a, setA] = useState<number | null>(null);
  const [b, setB] = useState<number | null>(null);
  const [flashIn, setFlashIn] = useState(0);
  const [flashOut, setFlashOut] = useState(0);

  useEffect(() => {
    if (playing && a != null && b != null && (time >= b || time < a)) seek(a);
  }, [time, playing, a, b]);

  const setIn = () => { setA(snap(time, 0.5)); setB(null); setFlashIn((f) => f + 1); };
  const setOut = () => {
    if (a == null) { setA(0); }
    setB(Math.max(snap(time, 0.5), (a ?? 0) + 0.5));
    setFlashOut((f) => f + 1);
  };

  return (
    <ModelPanel
      letter="B" name="In / Out Capture" tag="رویدادی · اجرایی" accent={accent} flash={false}
      note="الگوی DJها: جای Playhead را با دو ضربه ثبت می‌کنید — بدون نگاه‌کردن به تایم‌لاین، وسط اجرا."
      value={a != null && b != null ? `IN ${(a / 4 + 1).toFixed(1)} · OUT ${(b / 4).toFixed(1)}` : a != null ? "IN set · waiting OUT" : "armed"} onReset={() => { setA(null); setB(null); }}
    >
      <div className="w-full px-4 flex flex-col justify-center gap-4 h-full">
        <div className="relative h-14 rounded-lg overflow-hidden" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {Array.from({ length: BARS + 1 }, (_, i) => (
            <span key={i} className="absolute inset-y-0 w-px" style={{ left: `${(i / BARS) * 100}%`, background: "rgba(255,255,255,0.07)" }} />
          ))}
          {a != null && b != null && (
            <span className="absolute inset-y-0 fade-in" style={{ left: `${(a / BEATS) * 100}%`, width: `${((b - a) / BEATS) * 100}%`, background: `${accent}26`, borderInline: `1.5px solid ${accent}` }} />
          )}
          <span className="absolute inset-y-0 w-[2px]" style={{ left: `${(time / (BARSEC * BARS)) * 100}%`, background: "#e9eaee", boxShadow: "0 0 8px rgba(255,255,255,0.5)" }} />
        </div>
        <div className="flex items-center justify-center gap-2.5">
          <button key={`i${flashIn}`} type="button" className="chip font-disp font-bold text-[12px] px-4 py-2 value-pop" style={{ "--acc": accent, borderColor: `${accent}55`, color: accent } as React.CSSProperties} onPointerDown={setIn}>IN</button>
          <button type="button" className="btn-icon" onClick={toggle} aria-label="play/pause" style={{ width: 36, height: 36, borderRadius: 18, borderColor: `${accent}55`, color: accent }}>
            <Icon name={playing ? "pause" : "play"} size={15} />
          </button>
          <button key={`o${flashOut}`} type="button" className="chip font-disp font-bold text-[12px] px-4 py-2 value-pop" style={{ "--acc": accent, borderColor: `${accent}55`, color: accent } as React.CSSProperties} onPointerDown={setOut}>OUT</button>
          <button type="button" className="btn-icon" onClick={() => { setA(null); setB(null); }} aria-label="clear loop"><Icon name="x" size={13} /></button>
        </div>
        <p className="text-center font-mono text-[9.5px] tracking-wider" style={{ color: "var(--ink-3)" }}>quantized to 1/8 · transport loops the region</p>
      </div>
    </ModelPanel>
  );
}

function LoopGrid({ accent }: { accent: string }) {
  const [start, setStart] = useState(2);
  const [len, setLen] = useState(2);
  const [ref, w] = useWidth<HTMLDivElement>();
  const sR = useRef(start); sR.current = start;
  const lenR = useRef(len); lenR.current = len;
  const acc = useRef(0);
  const s0 = useRef(0);

  const drag = usePointerDrag(({ dx }) => {
    if (w <= 0) return;
    acc.current += (dx / w) * BARS;
    setStart(clamp(s0.current + snap(acc.current, 1), 0, BARS - lenR.current));
  }, { onStart: () => { acc.current = 0; s0.current = sR.current; } });

  return (
    <ModelPanel
      letter="C" name="Bar Grid Window" tag="کوانتیزه · شبکه‌ای" accent={accent}
      note="پنجره‌ی لوپ فقط روی مرز بارها می‌نشیند؛ طول با چیپ و جایگاه با درگ — مناسب آرانژ و تمرین."
      value={`bar ${start + 1}–${start + len} · ${len} bar${len > 1 ? "s" : ""}`} onReset={() => { setStart(2); setLen(2); }}
    >
      <div className="w-full px-4 flex flex-col justify-center gap-4 h-full">
        <div ref={ref} className="relative h-14 rounded-lg" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {Array.from({ length: BARS }, (_, i) => (
            <button
              key={i}
              type="button"
              className="absolute inset-y-1.5 rounded-md flex items-end justify-center pb-1 cursor-pointer"
              style={{ left: `calc(${(i / BARS) * 100}% + 2px)`, width: `calc(${100 / BARS}% - 4px)`, background: i >= start && i < start + len ? `${accent}2e` : "rgba(255,255,255,0.03)", border: `1px solid ${i >= start && i < start + len ? accent + "77" : "rgba(255,255,255,0.05)"}`, transition: "background .25s, border-color .25s" }}
              onClick={() => setStart(clamp(i, 0, BARS - len))}
            >
              <span className="font-mono text-[9px]" style={{ color: i >= start && i < start + len ? accent : "var(--ink-3)" }}>{i + 1}</span>
            </button>
          ))}
          <div {...drag.handlers} className="absolute inset-y-0 cursor-grab active:cursor-grabbing rounded-lg" style={{ left: `${(start / BARS) * 100}%`, width: `${(len / BARS) * 100}%`, border: `1.5px solid ${accent}`, boxShadow: `0 0 16px ${accent}33, inset 0 0 20px ${accent}14`, transition: drag.dragging ? "width .28s cubic-bezier(.22,1,.36,1)" : "left .28s cubic-bezier(.22,1,.36,1), width .28s cubic-bezier(.22,1,.36,1)" }} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10.5px] font-medium me-1" style={{ color: "var(--ink-3)" }}>طول لوپ:</span>
          {[1, 2, 4].map((l) => (
            <button key={l} type="button" className={`chip font-mono ${len === l ? "on" : ""}`} style={{ "--acc": accent } as React.CSSProperties} onClick={() => { setLen(l); setStart((s) => clamp(s, 0, BARS - l)); }}>
              {l} bar{l > 1 ? "s" : ""}
            </button>
          ))}
        </div>
      </div>
    </ModelPanel>
  );
}

export const loopDomain: DomainDef = {
  id: "loop", num: "05", title: "Loop / A–B", fa: "لوپ", accent: "#f07b5c", group: "transport",
  note: "دستگیره‌های محدوده برای ویرایش دقیق فضایی، ثبت IN/OUT برای اجرای زنده، و پنجره‌ی کوانتیزه برای تمرین و آرانژ — سه نیاز متفاوت، سه مدل متفاوت.",
  models: [
    { name: "Range Handles", tag: "", note: "", Comp: LoopHandles },
    { name: "In / Out Capture", tag: "", note: "", Comp: LoopInOut },
    { name: "Bar Grid Window", tag: "", note: "", Comp: LoopGrid },
  ],
};

/* ================= 15 · METRONOME (visual only) ================= */

function MetroGrid({ accent }: { accent: string }) {
  const [cells, setCells] = useState([2, 1, 1, 1, 2, 1, 1, 1]);
  const [bpm, setBpm] = useState(120);
  const [playing, setPlaying] = useState(false);
  const { beat } = useBeatClock(bpm, playing);
  const idx = beat >= 0 ? beat % 8 : -1;

  return (
    <ModelPanel
      letter="A" name="Accent Grid" tag="شبکه‌ای · ویرایشی" accent={accent}
      note="ویرایش الگوی اکسنت با تَپ: خاموش ← روشن ← اکسنت. الگوی درام‌ماشین‌ها برای ساخت پترن."
      value={`${bpm} BPM · ${cells.filter((c) => c > 0).length}/8`} onReset={() => { setCells([2, 1, 1, 1, 2, 1, 1, 1]); setBpm(120); setPlaying(false); }}
    >
      <div className="w-full px-4 flex flex-col justify-center gap-4 h-full">
        <div className="grid grid-cols-8 gap-1.5">
          {cells.map((c, i) => {
            const hit = i === idx && c > 0;
            return (
              <button
                key={i}
                type="button"
                onPointerDown={(e) => { e.preventDefault(); setCells((arr) => arr.map((x, j) => (j === i ? ((x + 1) % 3) as 0 | 1 | 2 : x))); }}
                className="h-12 rounded-lg border cursor-pointer transition-all duration-150"
                style={{
                  background: hit ? accent : c === 2 ? `${accent}30` : c === 1 ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.3)",
                  borderColor: c === 2 ? `${accent}88` : c === 1 ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)",
                  transform: hit ? "scale(1.12)" : "scale(1)",
                  boxShadow: hit ? `0 0 18px ${accent}66` : undefined,
                }}
              >
                <span className="block w-1.5 h-1.5 mx-auto rounded-full" style={{ background: i === idx && c === 0 ? accent : c === 2 ? accent : "transparent" }} />
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <button type="button" className="btn-icon" style={{ width: 34, height: 34, borderRadius: 17, borderColor: `${accent}55`, color: accent }} onClick={() => setPlaying((p) => !p)} aria-label="play/pause">
            <Icon name={playing ? "pause" : "play"} size={15} />
          </button>
          <Stepper value={bpm} min={40} max={240} onChange={setBpm} accent={accent} compact format={(v) => `${v} bpm`} />
        </div>
      </div>
    </ModelPanel>
  );
}

function MetroPulse({ accent }: { accent: string }) {
  const [bpm, setBpm] = useState(120);
  const [playing, setPlaying] = useState(true);
  const [sub, setSub] = useState<"1/4" | "1/8" | "1/16">("1/4");
  const { beat, phase } = useBeatClock(bpm * (sub === "1/4" ? 1 : sub === "1/8" ? 2 : 4), playing);
  const taps = useRef<number[]>([]);
  const [tapN, setTapN] = useState(0);

  const isDown = beat >= 0 && beat % (sub === "1/4" ? 4 : sub === "1/8" ? 8 : 16) === 0;
  const s = playing ? 1 + (isDown ? 0.09 : 0.045) * Math.pow(1 - phase, 3) : 1;

  const tapTempo = () => {
    const now = performance.now();
    if (taps.current.length && now - taps.current[taps.current.length - 1] > 2000) taps.current = [];
    taps.current.push(now);
    if (taps.current.length > 6) taps.current.shift();
    if (taps.current.length >= 2) {
      const iv: number[] = [];
      for (let i = 1; i < taps.current.length; i++) iv.push(taps.current[i] - taps.current[i - 1]);
      setBpm(clamp(Math.round(60000 / (iv.reduce((a, b) => a + b, 0) / iv.length)), 40, 240));
    }
    setTapN((n) => n + 1);
  };

  return (
    <ModelPanel
      letter="B" name="Pulse Surface" tag="ضربه‌ای · Tap Tempo" accent={accent}
      note="سطح اجرا: ضرب با حلقه‌ی نور دیده می‌شود و خود سطح با ضربه‌های شما تمپو را یاد می‌گیرد."
      value={`${bpm} BPM · ${sub}`} onReset={() => { setBpm(120); setSub("1/4"); taps.current = []; }}
    >
      <div className="flex flex-col items-center gap-3 py-1">
        <div className="relative" style={{ width: 148, height: 148 }}>
          {playing && beat >= 0 && isDown && <span key={`${beat}-${tapN}`} className="ring-out absolute inset-0 rounded-full border-2 pointer-events-none" style={{ borderColor: accent }} />}
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); tapTempo(); }}
            className="absolute inset-0 rounded-full border cursor-pointer flex flex-col items-center justify-center gap-1"
            style={{
              transform: `scale(${s})`,
              transition: playing ? "none" : "transform .3s",
              borderColor: `${accent}66`,
              background: `radial-gradient(circle at 50% 32%, ${accent}26, ${accent}0a 62%, rgba(0,0,0,0.3))`,
              boxShadow: playing && isDown && phase < 0.25 ? `0 0 34px ${accent}44` : "0 10px 30px -14px rgba(0,0,0,.8)",
            }}
          >
            <span className="font-mono font-bold text-[30px] leading-none" style={{ color: accent }}>{bpm}</span>
            <span className="text-[9.5px] font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--ink-3)" }}>tap tempo</span>
          </button>
        </div>
        <div className="flex items-center gap-2.5">
          <Segmented options={[{ id: "1/4" as const, label: "♩" }, { id: "1/8" as const, label: "♪" }, { id: "1/16" as const, label: "♬" }]} value={sub} onChange={setSub} accent={accent} className="w-36" />
          <button type="button" className="btn-icon" style={{ borderColor: `${accent}55`, color: accent }} onClick={() => setPlaying((p) => !p)} aria-label="play/pause">
            <Icon name={playing ? "pause" : "play"} size={14} />
          </button>
        </div>
      </div>
    </ModelPanel>
  );
}

function MetroPattern({ accent }: { accent: string }) {
  const [steps, setSteps] = useState<boolean[]>(() => Array.from({ length: 16 }, (_, i) => i % 4 === 0 || i % 4 === 2));
  const [bpm, setBpm] = useState(120);
  const [swing, setSwing] = useState(0);
  const [playing, setPlaying] = useState(false);
  const { beat } = useBeatClock(bpm * 2, playing);
  const idx = beat >= 0 ? beat % 16 : -1;
  const painting = useRef<boolean | null>(null);

  return (
    <ModelPanel
      letter="C" name="Step Strip + Swing" tag="قدمی · نقاشی" accent={accent}
      note="استپ‌سیکوئنسر فشرده: درگ برای نقاشی روشن/خاموش، سوینگ برای جابه‌جایی قدم‌های فرد — حس گروو."
      value={`${bpm} BPM · swing ${swing}%`} onReset={() => { setSteps(Array.from({ length: 16 }, (_, i) => i % 4 === 0 || i % 4 === 2)); setBpm(120); setSwing(0); setPlaying(false); }}
    >
      <div className="w-full px-4 flex flex-col justify-center gap-4 h-full">
        <div
          className="flex gap-[3px]"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            const el = document.elementFromPoint(e.clientX, e.clientY);
            const i = Number((el as HTMLElement)?.dataset.i);
            if (Number.isInteger(i)) {
              painting.current = !steps[i];
              setSteps((arr) => arr.map((x, j) => (j === i ? painting.current! : x)));
            }
          }}
          onPointerMove={(e) => {
            if (painting.current == null) return;
            const el = document.elementFromPoint(e.clientX, e.clientY);
            const i = Number((el as HTMLElement)?.dataset.i);
            if (Number.isInteger(i)) setSteps((arr) => (arr[i] === painting.current ? arr : arr.map((x, j) => (j === i ? painting.current! : x))));
          }}
          onPointerUp={() => { painting.current = null; }}
        >
          {steps.map((on, i) => {
            const hit = i === idx && on;
            const sw = i % 2 === 1 ? swing * 0.12 : 0;
            return (
              <div
                key={i}
                data-i={i}
                className="flex-1 h-12 rounded-[5px] border cursor-pointer"
                style={{
                  background: hit ? accent : on ? (i % 4 === 0 ? `${accent}55` : `${accent}2a`) : "rgba(0,0,0,0.32)",
                  borderColor: hit ? accent : on ? `${accent}66` : "rgba(255,255,255,0.06)",
                  transform: `translateX(${sw}px) ${hit ? "scaleY(1.14)" : "scaleY(1)"}`,
                  transition: "transform .22s cubic-bezier(.22,1,.36,1), background .12s",
                  boxShadow: hit ? `0 0 14px ${accent}55` : undefined,
                }}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-2">
          <button type="button" className="btn-icon" style={{ width: 34, height: 34, borderRadius: 17, borderColor: `${accent}55`, color: accent }} onClick={() => setPlaying((p) => !p)} aria-label="play/pause">
            <Icon name={playing ? "pause" : "play"} size={15} />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[9.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>swing</span>
              <Dial value={swing} min={0} max={60} onChange={setSwing} accent={accent} size={52} sens={0.5} fineSens={0.1} step={1} format={(v) => `${Math.round(v)}`} />
            </div>
            <Stepper value={bpm} min={40} max={240} onChange={setBpm} accent={accent} compact format={(v) => `${v}`} />
          </div>
        </div>
      </div>
    </ModelPanel>
  );
}

export const metroDomain: DomainDef = {
  id: "metro", num: "15", title: "Metronome", fa: "مترونوم", accent: "#e86a6a", group: "transport",
  note: "سه سطح نیاز: ویرایش اکسنت مثل درام‌ماشین، سطح ضربِ زنده با Tap Tempo، و استپ‌استریپ با سوینگ برای گروو. همه‌ی پالس‌ها بصری‌اند — بدون صدا.",
  models: [
    { name: "Accent Grid", tag: "", note: "", Comp: MetroGrid },
    { name: "Pulse Surface", tag: "", note: "", Comp: MetroPulse },
    { name: "Step Strip + Swing", tag: "", note: "", Comp: MetroPattern },
  ],
};

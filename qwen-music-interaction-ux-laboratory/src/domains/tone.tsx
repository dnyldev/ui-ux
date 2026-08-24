import React, { useEffect, useRef, useState } from "react";
import {
  clamp, Dial, DomainDef, HTape, Icon, ModelPanel, Stepper, Wheel, fmtDb, usePointerDrag,
} from "../lib/core";

/* ================= 01 · TEMPO ================= */

function TempoDial({ accent }: { accent: string }) {
  const [bpm, setBpm] = useState(120);
  return (
    <ModelPanel
      letter="A" name="Rotary Dial" tag="چرخشی · نسبی" accent={accent}
      note="الگوی استاندارد Ableton و Logic برای مقدار دقیق؛ درگ نسبی، Shift برای گام ۰٫۱، اسکرول برای گام ۱ و دابل‌کلیک برای ریست."
      value={`${bpm.toFixed(1)} BPM`} onReset={() => setBpm(120)}
    >
      <Dial value={bpm} min={20} max={300} onChange={setBpm} onReset={() => setBpm(120)} accent={accent} size={150} sens={0.32} fineSens={0.035} step={0.5} format={(v) => v.toFixed(1)} unit="bpm" />
    </ModelPanel>
  );
}

function TempoTap({ accent }: { accent: string }) {
  const [bpm, setBpm] = useState(120);
  const [pulse, setPulse] = useState(0);
  const [beat, setBeat] = useState(0);
  const taps = useRef<number[]>([]);

  const tap = () => {
    const now = performance.now();
    if (taps.current.length && now - taps.current[taps.current.length - 1] > 2000) taps.current = [];
    taps.current.push(now);
    if (taps.current.length > 8) taps.current.shift();
    if (taps.current.length >= 2) {
      const iv: number[] = [];
      for (let i = 1; i < taps.current.length; i++) iv.push(taps.current[i] - taps.current[i - 1]);
      const avg = iv.reduce((a, b) => a + b, 0) / iv.length;
      setBpm(clamp(Math.round(60000 / avg), 20, 300));
    }
    setPulse((p) => p + 1);
    setBeat((b) => (b + 1) % 4);
  };

  return (
    <ModelPanel
      letter="B" name="Tap Tempo" tag="ریتمیک · رویدادی" accent={accent}
      note="الگوی استاندارد DJ؛ ریتمِ ورودی میانگین می‌گیرد. بعد از ۲ ثانیه مکث، زنجیره‌ی جدید شروع می‌شود."
      value={`${bpm} BPM`} onReset={() => { setBpm(120); taps.current = []; setBeat(0); }}
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <button
          type="button"
          onPointerDown={(e) => { e.preventDefault(); tap(); }}
          className="relative w-32 h-32 rounded-2xl border flex items-center justify-center cursor-pointer active:scale-[0.96] transition-transform"
          style={{ borderColor: `${accent}55`, background: `linear-gradient(180deg, ${accent}1f, ${accent}0a)` }}
        >
          <span key={pulse} className="ring-out absolute inset-0 rounded-2xl border-2 pointer-events-none" style={{ borderColor: accent }} />
          <span className="font-disp font-bold text-[15px] tracking-wide" style={{ color: accent }}>TAP</span>
        </button>
        <div dir="ltr" className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="w-2 h-2 rounded-full transition-all duration-150" style={{ background: i === beat ? accent : "rgba(255,255,255,0.14)", transform: i === beat ? "scale(1.35)" : "scale(1)" }} />
            ))}
          </div>
          <Stepper value={bpm} min={20} max={300} onChange={setBpm} accent={accent} compact format={(v) => `${v}`} />
        </div>
      </div>
    </ModelPanel>
  );
}

function TempoDrawer({ accent }: { accent: string }) {
  const [bpm, setBpm] = useState(120);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open]);

  return (
    <ModelPanel
      letter="C" name="Drawer Scrubber" tag="خطی · مطلق · موبایل" accent={accent}
      note="Bottom Drawer با اسکرابرِ خط‌کش؛ دتنت هر ۱۰ واحد و چیپ‌های سریع. Thumb-reach بهینه برای موبایل."
      value={`${bpm} BPM`} onReset={() => setBpm(120)} height={210}
    >
      <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
        <span className="text-[11px] font-medium" style={{ color: "var(--ink-3)" }}>Tempo</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full max-w-60 rounded-xl border px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all hover:brightness-125 active:scale-[0.985]"
          style={{ borderColor: `${accent}40`, background: `linear-gradient(180deg, ${accent}18, ${accent}08)` }}
        >
          <span className="font-mono font-bold text-[20px]" style={{ color: accent }}>{bpm}<span className="text-[11px] ms-1.5 font-semibold" style={{ color: "var(--ink-3)" }}>BPM</span></span>
          <Icon name="chevD" size={16} className="opacity-60" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50" dir="ltr">
          <div className="absolute inset-0 bg-black/55 fade-in" onClick={() => setOpen(false)} />
          <div
            className="sheet absolute inset-x-0 bottom-0 rounded-t-2xl border border-b-0 px-5 pt-3 pb-7"
            style={{ background: "linear-gradient(180deg, #24272f, #1b1d23)", borderColor: "var(--line-2)", transform: "translateY(0)" }}
          >
            <div className="mx-auto w-12 h-1.5 rounded-full mb-4" style={{ background: "rgba(255,255,255,0.16)" }} />
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-mono font-bold text-[34px] leading-none" style={{ color: accent }}>{bpm}</span>
                <span className="ms-2 text-[12px] font-semibold" style={{ color: "var(--ink-3)" }}>BPM</span>
              </div>
              <button type="button" className="btn-icon" onClick={() => setOpen(false)} aria-label="close"><Icon name="x" /></button>
            </div>
            <HTape min={20} max={300} value={bpm} onChange={setBpm} accent={accent} ppu={7} major={10} labelEvery={20} height={92} />
            <div className="flex items-center justify-center gap-2 mt-4">
              {[80, 100, 120, 140, 160].map((c) => (
                <button key={c} type="button" className={`chip font-mono ${bpm === c ? "on" : ""}`} style={{ "--acc": accent } as React.CSSProperties} onClick={() => setBpm(c)}>{c}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </ModelPanel>
  );
}

export const tempoDomain: DomainDef = {
  id: "tempo", num: "01", title: "Tempo / BPM", fa: "تمپو", accent: "#f2a93b", group: "control",
  note: "در Ableton و Logic مقدار دقیق با Dial گرفته می‌شود، در نرم‌افزارهای DJ زنجیره‌ی Tap استاندارد است و در موبایل، اسکرابرِ داخل Drawer بهترین Thumb-reach را دارد.",
  models: [
    { name: "Rotary Dial", tag: "", note: "", Comp: TempoDial },
    { name: "Tap Tempo", tag: "", note: "", Comp: TempoTap },
    { name: "Drawer Scrubber", tag: "", note: "", Comp: TempoDrawer },
  ],
};

/* ================= 02 · VOLUME ================= */

function VolFader({ accent }: { accent: string }) {
  const [v, setV] = useState(80);
  const [muted, setMuted] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const vRef = useRef(v);
  vRef.current = v;

  const fromY = (clientY: number) => {
    const el = trackRef.current;
    if (!el) return vRef.current;
    const r = el.getBoundingClientRect();
    let nv = 100 * (1 - (clientY - r.top) / r.height);
    if (Math.abs(nv - 100) < 2.5) nv = 100;
    if (nv < 1.5) nv = 0;
    return clamp(Math.round(nv), 0, 100);
  };
  const drag = usePointerDrag(({ y }) => setV(fromY(y)));

  const dbMarks = [0, -3, -6, -12, -20, -40];
  return (
    <ModelPanel
      letter="A" name="Console Fader" tag="عمودی · مطلق" accent={accent}
      note="نگاشت مطلق با مقیاس dB؛ نقطه‌ی Unity در بالا و -∞ در کف. الگوی کنسول‌های میکس."
      value={muted ? "MUTE" : `${v}% · ${fmtDb(muted ? 0 : v)}`} onReset={() => { setV(80); setMuted(false); }}
    >
      <div className="flex items-stretch gap-4 py-4">
        <div className="flex flex-col justify-between py-0.5 text-right">
          {dbMarks.map((d) => (
            <span key={d} className="font-mono text-[9px]" style={{ color: "var(--ink-3)" }}>{d === 0 ? "0" : d}</span>
          ))}
        </div>
        <div
          ref={trackRef}
          {...drag.handlers}
          onPointerDownCapture={(e) => setV(fromY(e.clientY))}
          className="relative w-11 rounded-lg cursor-ns-resize"
          style={{ height: 176, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="absolute inset-x-2.5 top-2 bottom-2 rounded-full" style={{ background: "rgba(255,255,255,0.09)" }} />
          <div
            className="absolute inset-x-2.5 bottom-2 rounded-full"
            style={{ height: `calc(${muted ? 0 : v}% - 8px)`, background: `linear-gradient(180deg, ${accent}, ${accent}88)`, transition: "height .08s linear" }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 w-9 h-4 rounded-[5px] border flex items-center justify-center"
            style={{ bottom: `calc(${muted ? 0 : v}% - 8px + 8px)`, transform: "translate(-50%, 50%)", background: "#2b2f38", borderColor: accent, boxShadow: drag.dragging ? `0 0 14px ${accent}66` : "0 3px 8px rgba(0,0,0,.5)" }}
          >
            <span className="w-6 h-[2px] rounded-full" style={{ background: accent }} />
          </div>
        </div>
        <div className="flex flex-col items-center justify-end pb-1">
          <button type="button" className={`chip font-disp font-bold text-[11px] ${muted ? "on" : ""}`} style={{ "--acc": "#e86a6a" } as React.CSSProperties} onClick={() => setMuted((m) => !m)}>M</button>
        </div>
      </div>
    </ModelPanel>
  );
}

function VolKnob({ accent }: { accent: string }) {
  const [v, setV] = useState(80);
  const [muted, setMuted] = useState(false);
  return (
    <ModelPanel
      letter="B" name="Relative Knob" tag="چرخشی · نسبی" accent={accent}
      note="نگاشت نسبی؛ برای تغییرات ظریف در فضای کوچک و درگ‌های بلند بدون از‌دست‌دادن مکان‌نما."
      value={muted ? "MUTE" : `${v}% · ${fmtDb(muted ? 0 : v)}`} onReset={() => { setV(80); setMuted(false); }}
    >
      <div className="flex flex-col items-center gap-3">
        <Dial value={v} min={0} max={100} onChange={setV} onReset={() => setV(80)} accent={accent} size={128} sens={0.42} fineSens={0.05} step={1} format={(x) => `${Math.round(x)}`} unit={muted ? "muted" : "level"} />
        <button type="button" className={`chip font-disp font-bold text-[11px] ${muted ? "on" : ""}`} style={{ "--acc": "#e86a6a" } as React.CSSProperties} onClick={() => setMuted((m) => !m)}>MUTE</button>
      </div>
    </ModelPanel>
  );
}

function VolStrip({ accent }: { accent: string }) {
  const [v, setV] = useState(80);
  const [muted, setMuted] = useState(false);
  const [mode, setMode] = useState<"idle" | "tap" | "drag">("idle");
  const vRef = useRef(v);
  vRef.current = v;
  const lastTap = useRef(0);
  const anchor = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const movedR = useRef(false);

  const drag = usePointerDrag(
    ({ dx, x }) => {
      if (!movedR.current && Math.abs(x - anchor.current) > 7) movedR.current = true;
      if (movedR.current) {
        setMode("drag");
        setV(clamp(Math.round(vRef.current + dx * 0.4), 0, 100));
      }
    },
    {
      onStart: () => { movedR.current = false; setMode("tap"); },
      onEnd: () => {
        if (!movedR.current) {
          const now = performance.now();
          if (now - lastTap.current < 320) { setMuted((m) => !m); lastTap.current = 0; }
          else {
            lastTap.current = now;
            const el = barRef.current;
            if (el) {
              const r = el.getBoundingClientRect();
              const ev = (lastX.current - r.left) / r.width;
              setV(clamp(Math.round(ev * 100), 0, 100));
            }
          }
        }
        setMode("idle");
      },
    }
  );
  const lastX = useRef(0);
  const wrapped = {
    ...drag.handlers,
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => { lastX.current = e.clientX; drag.handlers.onPointerMove?.(e); },
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => { lastX.current = e.clientX; drag.handlers.onPointerDown?.(e); },
  };

  return (
    <ModelPanel
      letter="C" name="Gesture Strip" tag="اشاره‌ای · ترکیبی" accent={accent}
      note="الگوی سیستم‌عامل‌های موبایل: تَپ برای مقدار مطلق، سوایپ برای نسبی، دابل‌تَپ برای Mute."
      value={muted ? "MUTE" : `${v}% · ${fmtDb(muted ? 0 : v)}`} onReset={() => { setV(80); setMuted(false); }} height={210}
    >
      <div className="w-full px-6 flex flex-col justify-center gap-5 h-full">
        <div
          ref={barRef}
          {...wrapped}
          className="relative h-11 rounded-full cursor-pointer"
          style={{ background: "rgba(0,0,0,0.42)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: mode === "drag" ? `0 0 0 3px ${accent}22` : undefined, transition: "box-shadow .2s" }}
        >
          <div className="absolute inset-y-2 left-2 rounded-full overflow-hidden" style={{ width: `calc(${muted ? 0 : v}% - 8px)`, maxWidth: "calc(100% - 16px)" }}>
            <div className="w-full h-full rounded-full" style={{ background: `linear-gradient(90deg, ${accent}77, ${accent})`, minWidth: barRef.current ? barRef.current.clientWidth - 16 : 0, transition: "width .08s linear" }} />
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 flex items-center justify-center"
            style={{ left: `calc(${muted ? 0 : v}% - 14px)`, background: "#262a32", borderColor: accent, transition: "left .08s linear", boxShadow: `0 2px 10px rgba(0,0,0,.5)` }}
          >
            {muted && <span className="w-3.5 h-[2px] rounded-full -rotate-45" style={{ background: "#e86a6a" }} />}
          </div>
          {[25, 50, 75].map((t) => (
            <span key={t} className="absolute top-1/2 -translate-y-1/2 w-[2px] h-2 rounded-full pointer-events-none" style={{ left: `${t}%`, background: "rgba(255,255,255,0.18)" }} />
          ))}
        </div>
        <div className="flex justify-between font-mono text-[9.5px]" style={{ color: "var(--ink-3)" }}>
          <span>-∞</span><span>-20</span><span>-10</span><span>0 dB</span>
        </div>
      </div>
    </ModelPanel>
  );
}

export const volumeDomain: DomainDef = {
  id: "volume", num: "02", title: "Volume", fa: "بلندی صدا", accent: "#f27059", group: "control",
  note: "فیدر کنسول نگاشت مطلق دارد و برای جایگاه ثابت عالی است؛ ناب نسبی برای تغییر ظریف؛ و نوار اشاره‌ای همان الگویی است که در پلیرهای موبایل استاندارد شده.",
  models: [
    { name: "Console Fader", tag: "", note: "", Comp: VolFader },
    { name: "Relative Knob", tag: "", note: "", Comp: VolKnob },
    { name: "Gesture Strip", tag: "", note: "", Comp: VolStrip },
  ],
};

/* ================= 03 · PITCH ================= */

const stFmt = (v: number) => `${v > 0 ? "+" : ""}${v} st`;

function PitchWheel({ accent }: { accent: string }) {
  const [st, setSt] = useState(0);
  return (
    <ModelPanel
      letter="A" name="Number Wheel" tag="چرخ · اینرسی" accent={accent}
      note="چرخ انتخاب لمسی با اینرسی و اسنپ؛ اسکرول سریع برای محدوده‌ی وسیع، دقت بالا نزدیک مرکز."
      value={stFmt(st)} onReset={() => setSt(0)}
    >
      <Wheel min={-12} max={12} value={st} onChange={setSt} accent={accent} format={(v) => `${v > 0 ? "+" : ""}${v}`} />
    </ModelPanel>
  );
}

function PitchTape({ accent }: { accent: string }) {
  const [st, setSt] = useState(0);
  return (
    <ModelPanel
      letter="B" name="Semitone Ruler" tag="خط‌کش · اسنپ" accent={accent}
      note="خط‌کش نیم‌پرده‌ای با اسنپ؛ برای پرش سریع بین اکتاو، با اینرسی و ترمز روی اعداد صحیح."
      value={stFmt(st)} onReset={() => setSt(0)} height={220}
    >
      <div className="w-full px-4 flex flex-col items-center gap-4">
        <span className="font-mono font-bold text-[30px] pt-3" style={{ color: accent }}>{st > 0 ? "+" : ""}{st}<span className="text-[12px] ms-2 font-semibold" style={{ color: "var(--ink-3)" }}>semitone</span></span>
        <HTape min={-12} max={12} value={st} onChange={setSt} accent={accent} ppu={15} major={2} labelEvery={4} height={84} format={(v) => `${v > 0 ? "+" : ""}${v}`} />
      </div>
    </ModelPanel>
  );
}

function PitchDragNum({ accent }: { accent: string }) {
  const [st, setSt] = useState(0);
  const [cents, setCents] = useState(0);
  const stRef = useRef(0);
  const ceRef = useRef(0);
  stRef.current = st;
  ceRef.current = cents;

  const drag = usePointerDrag(({ dx, dy, shiftKey }) => {
    const s = shiftKey ? 0.05 : 1;
    setSt(clamp(Math.round((stRef.current + (dx * s) / 12) / s) * s, -12, 12));
    setCents(clamp(Math.round(ceRef.current - dy * 0.6), -50, 50));
  });

  return (
    <ModelPanel
      letter="C" name="Drag Value" tag="مستقیم · دوبُعدی" accent={accent}
      note="الگوی رایج DAWها: درگ افقی = نیم‌پرده، درگ عمودی = سنت؛ Shift برای گام ریز. دابل‌کلیک ریست."
      value={`${st > 0 ? "+" : ""}${st.toFixed(st % 1 ? 2 : 0)} st · ${cents > 0 ? "+" : ""}${cents}¢`} onReset={() => { setSt(0); setCents(0); }}
    >
      <div
        {...drag.handlers}
        onDoubleClick={() => { setSt(0); setCents(0); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setSt((x) => clamp(x + 1, -12, 12));
          if (e.key === "ArrowLeft") setSt((x) => clamp(x - 1, -12, 12));
          if (e.key === "ArrowUp") setCents((x) => clamp(x + 5, -50, 50));
          if (e.key === "ArrowDown") setCents((x) => clamp(x - 5, -50, 50));
        }}
        tabIndex={0}
        className="flex flex-col items-center justify-center gap-2 cursor-ew-resize select-none w-full h-full"
      >
        <span className="font-mono font-bold text-[44px] leading-none tabular-nums" style={{ color: accent }}>
          {st > 0 ? "+" : ""}{st.toFixed(st % 1 ? 2 : 0)}
          <span className="text-[16px] ms-2" style={{ color: "var(--ink-3)" }}>st</span>
        </span>
        <div className="flex items-center gap-2">
          <div className="w-28 h-1 rounded-full relative" style={{ background: "rgba(255,255,255,0.1)" }}>
            <span className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full" style={{ left: `calc(${(cents + 50)}% - 5px)`, background: accent, transition: "left .1s" }} />
          </div>
          <span className="font-mono text-[11px] w-10" style={{ color: "var(--ink-2)" }}>{cents > 0 ? "+" : ""}{cents}¢</span>
        </div>
      </div>
    </ModelPanel>
  );
}

export const pitchDomain: DomainDef = {
  id: "pitch", num: "03", title: "Pitch / Transpose", fa: "گام صدا", accent: "#4cc9a6", group: "control",
  note: "چرخ اعداد برای لمس دقیق است، خط‌کش نیم‌پرده برای پرش سریع، و درگ روی خود عدد سریع‌ترین الگوی DAWها — با بُعد عمودی برای تنظیم سنت.",
  models: [
    { name: "Number Wheel", tag: "", note: "", Comp: PitchWheel },
    { name: "Semitone Ruler", tag: "", note: "", Comp: PitchTape },
    { name: "Drag Value", tag: "", note: "", Comp: PitchDragNum },
  ],
};

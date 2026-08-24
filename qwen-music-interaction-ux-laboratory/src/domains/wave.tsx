import { useEffect, useRef, useState } from "react";
import {
  clamp, Dial, DomainDef, ModelPanel, Segmented, Wave, fmtTime, genPeaks, snap, usePointerDrag, useSpring, useWidth,
} from "../lib/core";

const PK = genPeaks(5, 220);
const N = PK.length;
const DUR = 32;

/* ================= 09 · WAVEFORM INTERACTION ================= */

function WaveOverview({ accent }: { accent: string }) {
  const [win, setWin] = useState({ a: 0.28, b: 0.55 });
  const [ref, w] = useWidth<HTMLDivElement>();
  const winR = useRef(win);
  winR.current = win;

  const dragRegion = usePointerDrag(({ dx }) => {
    if (w <= 0) return;
    const d = dx / w;
    const len = winR.current.b - winR.current.a;
    const a = clamp(winR.current.a + d, 0, 1 - len);
    setWin({ a, b: a + len });
  });
  const dragA = usePointerDrag(({ dx }) => {
    if (w <= 0) return;
    setWin((v) => ({ ...v, a: clamp(v.a + dx / w, 0, v.b - 0.04) }));
  });
  const dragB = usePointerDrag(({ dx }) => {
    if (w <= 0) return;
    setWin((v) => ({ ...v, b: clamp(v.b + dx / w, v.a + 0.04, 1) }));
  });

  const i0 = Math.floor(win.a * N);
  const i1 = Math.max(i0 + 8, Math.ceil(win.b * N));
  const slice = PK.slice(i0, i1);
  const zoom = 1 / (win.b - win.a);

  return (
    <ModelPanel
      letter="A" name="Overview + Focus" tag="دوسطحی · brush" accent={accent}
      note="الگوی Ableton: نقشه‌ی کلی همیشه دیده می‌شود و brush روی آن، پنجره‌ی_focus_ را جابه‌جا و اندازه می‌کند."
      value={`zoom ${zoom.toFixed(1)}× · ${(win.a * DUR).toFixed(1)}–${(win.b * DUR).toFixed(1)}s`} onReset={() => setWin({ a: 0.28, b: 0.55 })}
    >
      <div ref={ref} className="w-full px-4 flex flex-col justify-center gap-2.5 h-full">
        <div className="relative h-9 rounded-md overflow-hidden" style={{ background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Wave peaks={PK} accent="#565d6b" opacity={0.8} />
          <div className="absolute inset-y-0 rounded-sm cursor-grab active:cursor-grabbing" {...dragRegion.handlers} style={{ left: `${win.a * 100}%`, width: `${(win.b - win.a) * 100}%`, background: `${accent}1f`, border: `1px solid ${accent}88` }}>
            <span onPointerDown={(e) => e.stopPropagation()} {...dragA.handlers} className="handle inset-y-0 -left-1.5 w-3 rounded-l-sm" style={{ background: accent }} />
            <span onPointerDown={(e) => e.stopPropagation()} {...dragB.handlers} className="handle inset-y-0 -right-1.5 w-3 rounded-r-sm" style={{ background: accent }} />
          </div>
        </div>
        <div className="relative h-24 rounded-md overflow-hidden" style={{ background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Wave peaks={slice} accent={accent} opacity={0.9} />
          <span className="absolute top-1.5 right-2 font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${accent}1c`, color: accent }}>{zoom.toFixed(1)}×</span>
        </div>
      </div>
    </ModelPanel>
  );
}

function WaveZoom({ accent }: { accent: string }) {
  const [z, setZ] = useState(2.5);
  const [off, setOff] = useState(0.3);
  const [ref, w] = useWidth<HTMLDivElement>();
  const st = useRef({ z, off });
  st.current = { z, off };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fn = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const frac = clamp((e.clientX - r.left) / r.width, 0, 1);
      const { z: cz, off: co } = st.current;
      const nz = clamp(cz * (e.deltaY < 0 ? 1.25 : 0.8), 1, 32);
      const anchor = co + frac / cz;
      setZ(nz);
      setOff(clamp(anchor - frac / nz, 0, 1 - 1 / nz));
    };
    el.addEventListener("wheel", fn, { passive: false });
    return () => el.removeEventListener("wheel", fn);
  }, []);

  const drag = usePointerDrag(({ dx }) => {
    if (w <= 0) return;
    const { z: cz, off: co } = st.current;
    setOff(clamp(co - dx / w / cz, 0, 1 - 1 / cz));
  });

  const i0 = Math.floor(off * N);
  const i1 = Math.max(i0 + 8, Math.ceil((off + 1 / z) * N));
  const zoomAt = (f: number) => {
    const { z: cz, off: co } = st.current;
    const nz = clamp(f > 0 ? cz * 1.6 : cz / 1.6, 1, 32);
    const anchor = co + 0.5 / cz;
    setZ(nz);
    setOff(clamp(anchor - 0.5 / nz, 0, 1 - 1 / nz));
  };

  return (
    <ModelPanel
      letter="B" name="Wheel Zoom + Pan" tag="لنگری · لگاریتمی" accent={accent}
      note="اسکرول دقیقاً زیر نشانگر زوم می‌کند (لنگر ثابت) و درگ، پن‌ می‌کند — همان حس نقشه‌های دیجیتال."
      value={`${z.toFixed(1)}× · off ${(off * DUR).toFixed(1)}s`} onReset={() => { setZ(2.5); setOff(0.3); }}
    >
      <div className="w-full px-4 flex flex-col justify-center gap-2.5 h-full">
        <div ref={ref} {...drag.handlers} className="relative h-24 rounded-md cursor-grab active:cursor-grabbing overflow-hidden" style={{ background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Wave peaks={PK.slice(i0, i1)} accent={accent} opacity={0.9} />
          <span className="absolute top-1.5 left-2 font-mono text-[9px] px-1.5 py-0.5 rounded pointer-events-none" style={{ background: "rgba(0,0,0,0.5)", color: "var(--ink-2)" }}>{z.toFixed(1)}×</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button type="button" className="chip font-mono" style={{ "--acc": accent } as React.CSSProperties} onClick={() => zoomAt(-1)}>−</button>
          <button type="button" className={`chip font-mono ${z === 1 ? "on" : ""}`} style={{ "--acc": accent } as React.CSSProperties} onClick={() => { setZ(1); setOff(0); }}>fit</button>
          <button type="button" className="chip font-mono" style={{ "--acc": accent } as React.CSSProperties} onClick={() => zoomAt(1)}>+</button>
          <span className="text-[10px] ms-2" style={{ color: "var(--ink-3)" }}>mouse wheel / trackpad</span>
        </div>
      </div>
    </ModelPanel>
  );
}

function WaveTools({ accent }: { accent: string }) {
  const [tool, setTool] = useState<"scrub" | "select">("scrub");
  const [ph, setPh] = useState(0.18);
  const [sel, setSel] = useState<{ a: number; b: number } | null>(null);
  const [ref] = useWidth<HTMLDivElement>();
  const start = useRef(0);
  const toolR = useRef(tool);
  toolR.current = tool;

  const drag = usePointerDrag(({ x }) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const f = clamp((x - r.left) / r.width, 0, 1);
    if (toolR.current === "scrub") setPh(f);
    else setSel({ a: Math.min(start.current, f), b: Math.max(start.current, f) });
  });
  const down = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (el) start.current = clamp((e.clientX - el.getBoundingClientRect().left) / el.getBoundingClientRect().width, 0, 1);
    drag.handlers.onPointerDown?.(e);
  };

  return (
    <ModelPanel
      letter="C" name="Tool Modes" tag="حالت‌محور · ابزاری" accent={accent} flash={false}
      note="الگوی حرفه‌ای‌ها: یک سطح، دو ابزار. Scrub برای شنیدن، Select برای برداشتن محدوده؛ دابل‌کلیک پاک می‌کند."
      value={tool === "scrub" ? fmtTime(ph * DUR) : sel ? `${((sel.b - sel.a) * DUR).toFixed(1)}s selected` : "no selection"}
      onReset={() => { setPh(0.18); setSel(null); }}
    >
      <div className="w-full px-4 flex flex-col justify-center gap-3 h-full">
        <Segmented options={[{ id: "scrub" as const, label: "Scrub" }, { id: "select" as const, label: "Select" }]} value={tool} onChange={setTool} accent={accent} className="w-44 self-center" />
        <div
          ref={ref}
          {...drag.handlers}
          onPointerDown={down}
          onDoubleClick={() => setSel(null)}
          className="relative h-20 rounded-md cursor-crosshair overflow-hidden"
          style={{ background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Wave peaks={PK} accent="#5a6170" opacity={0.7} />
          {sel && (
            <span className="absolute inset-y-0" style={{ left: `${sel.a * 100}%`, width: `${(sel.b - sel.a) * 100}%`, background: `${accent}22`, borderInline: `1.5px solid ${accent}` }}>
              <span className="absolute inset-y-0 -left-1 w-2" style={{ background: accent, borderRadius: 2 }} />
              <span className="absolute inset-y-0 -right-1 w-2" style={{ background: accent, borderRadius: 2 }} />
            </span>
          )}
          <span className="absolute inset-y-0 w-[2px]" style={{ left: `${ph * 100}%`, background: tool === "scrub" ? accent : "rgba(255,255,255,0.5)", boxShadow: tool === "scrub" ? `0 0 10px ${accent}` : undefined, transition: "background .2s" }} />
        </div>
      </div>
    </ModelPanel>
  );
}

export const waveDomain: DomainDef = {
  id: "wave", num: "09", title: "Waveform", fa: "موج صدا", accent: "#6fa8dc", group: "edit",
  note: "Overview+Focus جهت‌یابی را حل می‌کند، زومِ لنگری برای جراحی دقیق است، و حالت‌های ابزاری همان الگوی ویرایشگرهای حرفه‌ای.",
  models: [
    { name: "Overview + Focus", tag: "", note: "", Comp: WaveOverview },
    { name: "Wheel Zoom + Pan", tag: "", note: "", Comp: WaveZoom },
    { name: "Tool Modes", tag: "", note: "", Comp: WaveTools },
  ],
};

/* ================= 10 · BEAT GRID ================= */

const BEATS = 32;

function BeatTapDown({ accent }: { accent: string }) {
  const [off, setOff] = useState(0);
  const [pop, setPop] = useState(0);
  return (
    <ModelPanel
      letter="A" name="Tap Downbeat" tag="رویدادی · فاز" accent={accent}
      note="الگوی rekordbox: روی اولین ضربِ بارِ واقعی تَپ کنید تا کل شبکه فاز بگیرد — یک ضربه، کل گرید."
      value={`offset +${off} beat${off !== 1 ? "s" : ""}`} onReset={() => setOff(0)}
    >
      <div key={pop} className="w-full px-4 flex flex-col justify-center gap-3 h-full">
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: "repeat(16, 1fr)" }}>
          {Array.from({ length: BEATS }, (_, i) => {
            const isDown = ((i - off) % 4 + 4) % 4 === 0;
            const bar = Math.floor((((i - off) % 32) + 32) / 4) % 8;
            return (
              <button
                key={i}
                type="button"
                onPointerDown={(e) => { e.preventDefault(); setOff(((i % 4) + 4) % 4); setPop((p) => p + 1); }}
                className="h-11 rounded-[4px] border cursor-pointer transition-all duration-300 relative"
                style={{
                  background: isDown ? `${accent}38` : i % 4 === 2 ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.3)",
                  borderColor: isDown ? `${accent}99` : "rgba(255,255,255,0.05)",
                }}
              >
                {isDown && <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 font-mono text-[7.5px]" style={{ color: accent }}>{bar + 1}</span>}
              </button>
            );
          })}
        </div>
        <p className="text-center font-mono text-[9.5px] tracking-wider" style={{ color: "var(--ink-3)" }}>tap any beat → becomes the downbeat</p>
      </div>
    </ModelPanel>
  );
}

function BeatOffset({ accent }: { accent: string }) {
  const [off, setOff] = useState(0);
  const [ref, w] = useWidth<HTMLDivElement>();
  const offR = useRef(off);
  offR.current = off;
  const drag = usePointerDrag(
    ({ dx }) => {
      if (w <= 0) return;
      setOff(clamp(offR.current + (dx / w) * BEATS, -4, 4));
    },
    { onEnd: () => setOff((o) => snap(o, 0.25)) }
  );
  const bw = w > 0 ? w / BEATS : 8;
  return (
    <ModelPanel
      letter="B" name="Grid Nudge" tag="پیوسته · اسنپ 1/16" accent={accent}
      note="شبکه را با انگشت بلغزانید؛ رها کنید تا روی نزدیک‌ترین شانزدهم بنشیند — برای ترک‌هایی که دقیق ضبط نشده‌اند."
      value={`${off >= 0 ? "+" : ""}${off.toFixed(2)} beats`} onReset={() => setOff(0)}
    >
      <div className="w-full px-4 flex flex-col justify-center gap-3 h-full">
        <div ref={ref} {...drag.handlers} onDoubleClick={() => setOff(0)} className="relative h-20 rounded-md cursor-ew-resize overflow-hidden" style={{ background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="absolute inset-y-0" style={{ transform: `translateX(${off * bw}px)`, transition: "transform .06s linear" }}>
            {Array.from({ length: BEATS + 8 }, (_, i) => i - 4).map((i) => (
              <span
                key={i}
                className="absolute inset-y-2 rounded-full"
                style={{ left: i * bw, width: ((i % 4) + 4) % 4 === 0 ? 2.5 : 1, background: ((i % 4) + 4) % 4 === 0 ? accent : "rgba(255,255,255,0.16)" }}
              />
            ))}
          </div>
          <span className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 pointer-events-none" style={{ background: "#e9eaee", boxShadow: "0 0 8px rgba(255,255,255,0.4)" }} />
        </div>
        <div className="flex justify-center gap-1.5">
          {[-1, -0.25, 0.25, 1].map((d) => (
            <button key={d} type="button" className="chip font-mono" style={{ "--acc": accent } as React.CSSProperties} onClick={() => setOff((o) => clamp(snap(o + d, 0.25), -4, 4))}>
              {d > 0 ? `+${d}` : d}
            </button>
          ))}
        </div>
      </div>
    </ModelPanel>
  );
}

function BeatDensity({ accent }: { accent: string }) {
  const [den, setDen] = useState<"1/4" | "1/8" | "1/16">("1/8");
  const [swing, setSwing] = useState(0);
  const [ref, w] = useWidth<HTMLDivElement>();
  const sub = den === "1/4" ? 1 : den === "1/8" ? 2 : 4;
  const total = BEATS * sub;
  const cellW = w > 0 ? w / total : 6;
  return (
    <ModelPanel
      letter="C" name="Density + Swing" tag="شبکه‌ای · گروو" accent={accent}
      note="تراکم شبکه با انیمیشن بازچینی می‌شود و سوینگ، قدم‌های فرد را هل می‌دهد — تنظیم گروو بدون لمسِ موج."
      value={`${den} · swing ${swing}%`} onReset={() => { setDen("1/8"); setSwing(0); }}
    >
      <div className="w-full px-4 flex flex-col justify-center gap-3.5 h-full">
        <div ref={ref} className="relative h-16 rounded-md overflow-hidden" style={{ background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {Array.from({ length: total }, (_, i) => {
            const beat = i / sub;
            const isSubOdd = i % 2 === 1;
            const shift = isSubOdd ? (swing / 100) * cellW * 0.9 : 0;
            const isDown = i % (4 * sub) === 0;
            const isBeat = i % sub === 0;
            return (
              <span
                key={`${den}-${i}`}
                className="absolute top-2 bottom-2 rounded-[3px]"
                style={{
                  left: beat * cellW + 1 + shift,
                  width: Math.max(1.5, cellW - 2),
                  background: isDown ? accent : isBeat ? `${accent}55` : `${accent}26`,
                  transition: "left .35s cubic-bezier(.22,1,.36,1), width .35s cubic-bezier(.22,1,.36,1), background .3s",
                }}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-3">
          <Segmented options={[{ id: "1/4" as const, label: "1/4" }, { id: "1/8" as const, label: "1/8" }, { id: "1/16" as const, label: "1/16" }]} value={den} onChange={setDen} accent={accent} className="w-40" />
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>swing</span>
            <Dial value={swing} min={0} max={60} onChange={(v) => setSwing(Math.round(v))} onReset={() => setSwing(0)} accent={accent} size={56} sens={0.5} fineSens={0.1} step={1} format={(v) => `${Math.round(v)}`} />
          </div>
        </div>
      </div>
    </ModelPanel>
  );
}

export const beatDomain: DomainDef = {
  id: "beat", num: "10", title: "Beat Grid", fa: "شبکه ضرب", accent: "#e8d24c", group: "edit",
  note: "تَنزِیت با یک ضربه، جابه‌جایی پیوسته با اسنپ، و کنترل تراکم/سوینگ — سه عمق متفاوت از یک مسئله‌ی ریتم.",
  models: [
    { name: "Tap Downbeat", tag: "", note: "", Comp: BeatTapDown },
    { name: "Grid Nudge", tag: "", note: "", Comp: BeatOffset },
    { name: "Density + Swing", tag: "", note: "", Comp: BeatDensity },
  ],
};

/* ================= 13 · AUDIO SELECTION ================= */

type Clip = { id: string; name: string; x: number; w: number; color: string };
const CLIPS0: Clip[] = [
  { id: "vox", name: "Vox", x: 1, w: 7, color: "#e884b0" },
  { id: "drm", name: "Drums", x: 5, w: 11, color: "#e89a5c" },
  { id: "bas", name: "Bass", x: 13, w: 9, color: "#5fb2e8" },
  { id: "key", name: "Keys", x: 20, w: 8, color: "#9cc15e" },
  { id: "fx", name: "FX", x: 27, w: 4, color: "#b08ae8" },
];
const LANES = [0, 1, 2];
const laneOf = (i: number) => LANES[i % 3];

function ClipBlock({ c, lane, selected, onDown, accent, ppb }: { c: Clip; lane: number; selected: boolean; onDown: (e: React.PointerEvent<HTMLElement>, c: Clip) => void; accent: string; ppb: number }) {
  return (
    <div
      onPointerDown={(e) => onDown(e, c)}
      className="absolute rounded-md border cursor-pointer select-none overflow-hidden"
      style={{
        left: c.x * ppb,
        width: c.w * ppb,
        top: 6 + lane * 30,
        height: 26,
        background: `${c.color}${selected ? "3a" : "22"}`,
        borderColor: selected ? accent : `${c.color}66`,
        boxShadow: selected ? `0 0 0 1.5px ${accent}66, 0 4px 14px -6px ${c.color}88` : undefined,
        transition: "box-shadow .18s, background .18s, border-color .18s",
        touchAction: "none",
      }}
    >
      <span className="absolute left-1.5 top-0.5 font-disp font-semibold text-[9px] tracking-wide" style={{ color: c.color }}>{c.name}</span>
      <Wave peaks={genPeaks(c.x * 3 + 1, 40)} accent={c.color} opacity={selected ? 0.9 : 0.55} className="absolute inset-x-0 bottom-0" />
    </div>
  );
}

function SelMarquee({ accent }: { accent: string }) {
  const [clips] = useState(CLIPS0);
  const [sel, setSel] = useState<Set<string>>(new Set(["drm"]));
  const [mq, setMq] = useState<{ a: number; b: number } | null>(null);
  const [ref, w] = useWidth<HTMLDivElement>();
  const ppb = w > 0 ? w / 32 : 8;
  const startB = useRef(0);
  const movedR = useRef(false);
  const onClipR = useRef(false);

  const toBeat = (clientX: number) => {
    const el = ref.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return clamp(((clientX - r.left) / r.width) * 32, 0, 32);
  };
  const drag = usePointerDrag(
    ({ x }) => {
      const b = toBeat(x);
      movedR.current = true;
      const a = Math.min(startB.current, b);
      const bb = Math.max(startB.current, b);
      setMq({ a, b: bb });
      setSel(new Set(clips.filter((c) => c.x < bb && c.x + c.w > a).map((c) => c.id)));
    },
    {
      onStart: () => { movedR.current = false; },
      onEnd: () => {
        if (!movedR.current && !onClipR.current) setSel(new Set());
        setMq(null);
      },
    }
  );

  return (
    <ModelPanel
      letter="A" name="Marquee Select" tag="محدوده‌ای · چندتایی" accent={accent}
      note="کشیدن روی فضای خالی، هر کلیپی را که لمس شود انتخاب می‌کند — الگوی DAWها برای انتخابِ گروهی."
      value={`${sel.size} clip${sel.size !== 1 ? "s" : ""} selected`} onReset={() => { setSel(new Set(["drm"])); setMq(null); }}
    >
      <div
        ref={ref}
        {...drag.handlers}
        onPointerDown={(e) => { onClipR.current = e.target !== e.currentTarget; startB.current = toBeat(e.clientX); drag.handlers.onPointerDown?.(e); }}
        className="relative w-full mx-0 rounded-md overflow-hidden"
        style={{ height: 104, margin: "auto 16px", width: "calc(100% - 0px)", background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="absolute inset-y-0 w-px pointer-events-none" style={{ left: i * 4 * ppb, background: "rgba(255,255,255,0.05)" }} />
        ))}
        {clips.map((c, i) => (
          <ClipBlock key={c.id} c={c} lane={laneOf(i)} selected={sel.has(c.id)} accent={accent} ppb={ppb} onDown={(e, cc) => { onClipR.current = true; startB.current = toBeat(e.clientX); setSel(new Set([cc.id])); drag.handlers.onPointerDown?.(e); }} />
        ))}
        {mq && <span className="absolute inset-y-0 pointer-events-none rounded-sm" style={{ left: mq.a * ppb, width: (mq.b - mq.a) * ppb, background: `${accent}1a`, border: `1px dashed ${accent}aa` }} />}
      </div>
    </ModelPanel>
  );
}

function SelMove({ accent }: { accent: string }) {
  const [clips, setClips] = useState<Clip[]>(CLIPS0.map((c) => ({ ...c })));
  const [sel, setSel] = useState<Set<string>>(new Set(["drm"]));
  const [ref, w] = useWidth<HTMLDivElement>();
  const ppb = w > 0 ? w / 32 : 8;
  const clipsR = useRef(clips);
  clipsR.current = clips;
  const selR = useRef(sel);
  selR.current = sel;
  const moving = useRef(false);

  const drag = usePointerDrag(
    ({ dx }) => {
      if (!moving.current) return;
      const d = dx / ppb;
      setClips((cs) => {
        const selected = cs.filter((c) => selR.current.has(c.id));
        const minX = Math.min(...selected.map((c) => c.x));
        const maxX = Math.max(...selected.map((c) => c.x + c.w));
        const dd = clamp(d, -minX, 32 - maxX);
        return cs.map((c) => (selR.current.has(c.id) ? { ...c, x: c.x + dd } : c));
      });
    },
    { onEnd: () => { moving.current = false; setClips((cs) => cs.map((c) => ({ ...c, x: snap(c.x, 0.5) }))); } }
  );

  return (
    <ModelPanel
      letter="B" name="Multi-Select + Move" tag="انتخابی · جابه‌جایی" accent={accent}
      note="Shift+کلیک برای افزودن به انتخاب، درگ برای جابه‌جایی گروه با اسنپ روی نیم‌ضرب — آرانژ واقعی."
      value={`${sel.size} clip${sel.size !== 1 ? "s" : ""} · drag to move`} onReset={() => { setClips(CLIPS0.map((c) => ({ ...c }))); setSel(new Set(["drm"])); }}
    >
      <div
        ref={ref}
        className="relative rounded-md overflow-hidden"
        style={{ height: 104, margin: "auto 16px", width: "calc(100% - 0px)", background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)" }}
        {...drag.handlers}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) setSel(new Set());
        }}
      >
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="absolute inset-y-0 w-px pointer-events-none" style={{ left: i * 4 * ppb, background: "rgba(255,255,255,0.05)" }} />
        ))}
        {clips.map((c, i) => (
          <ClipBlock key={c.id} c={c} lane={laneOf(i)} selected={sel.has(c.id)} accent={accent} ppb={ppb} onDown={(e, cc) => {
            if (e.shiftKey) setSel((s) => { const n = new Set(s); if (n.has(cc.id)) n.delete(cc.id); else n.add(cc.id); return n; });
            else if (!sel.has(cc.id)) setSel(new Set([cc.id]));
            moving.current = true;
            e.stopPropagation();
            drag.handlers.onPointerDown?.(e);
          }} />
        ))}
      </div>
    </ModelPanel>
  );
}

function SelTrim({ accent }: { accent: string }) {
  const [c, setC] = useState({ x: 8, w: 12 });
  const [ref, w] = useWidth<HTMLDivElement>();
  const ppb = w > 0 ? w / 32 : 8;
  const cR = useRef(c);
  cR.current = c;

  const dragBody = usePointerDrag(({ dx }) => {
    const d = dx / ppb;
    setC((v) => ({ ...v, x: clamp(v.x + d, 0, 32 - v.w) }));
    void cR;
  });
  const dragL = usePointerDrag(({ dx }) => {
    const d = dx / ppb;
    setC((v) => {
      const nx = clamp(v.x + d, 0, v.x + v.w - 1);
      return { x: nx, w: v.w - (nx - v.x) };
    });
  });
  const dragRt = usePointerDrag(({ dx }) => {
    const d = dx / ppb;
    setC((v) => ({ ...v, w: clamp(v.w + d, 1, 32 - v.x) }));
  });

  return (
    <ModelPanel
      letter="C" name="Trim Handles" tag="لبه‌ای · دقیق" accent={accent}
      note="دو لبه برای برش، بدنه برای جابه‌جایی؛ اسنپ روی نیم‌ضرب هنگام رهاکردن — ویرایش طول، نه محتوا."
      value={`start ${(c.x / 4).toFixed(1)} · len ${(c.w / 4).toFixed(1)} bars`} onReset={() => setC({ x: 8, w: 12 })}
    >
      <div ref={ref} className="relative rounded-md overflow-hidden" style={{ height: 104, margin: "auto 16px", width: "calc(100% - 0px)", background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="absolute inset-y-0 w-px" style={{ left: i * 4 * ppb, background: "rgba(255,255,255,0.05)" }} />
        ))}
        <div
          {...dragBody.handlers}
          onPointerUp={() => setC((v) => ({ x: snap(v.x, 0.5), w: snap(v.w, 0.5) }))}
          className="absolute rounded-md border cursor-grab active:cursor-grabbing overflow-hidden"
          style={{ left: c.x * ppb, width: c.w * ppb, top: 22, height: 58, background: `${accent}24`, borderColor: `${accent}88`, touchAction: "none" }}
        >
          <Wave peaks={genPeaks(9, 70)} accent={accent} opacity={0.85} className="absolute inset-x-0 bottom-0 h-10" />
          <span className="absolute left-2 top-1 font-disp font-semibold text-[9.5px] tracking-wide" style={{ color: accent }}>Region A</span>
          <span onPointerDown={(e) => e.stopPropagation()} {...dragL.handlers} className="handle inset-y-0 -left-1.5 w-3.5 rounded-l-md flex items-center justify-center" style={{ background: accent }}>
            <span className="w-[2px] h-5 rounded-full bg-black/50" />
          </span>
          <span onPointerDown={(e) => e.stopPropagation()} {...dragRt.handlers} className="handle inset-y-0 -right-1.5 w-3.5 rounded-r-md flex items-center justify-center" style={{ background: accent }}>
            <span className="w-[2px] h-5 rounded-full bg-black/50" />
          </span>
        </div>
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 font-mono text-[9px] px-1.5 py-0.5 rounded pointer-events-none" style={{ background: "rgba(0,0,0,0.55)", color: "var(--ink-2)" }}>
          {(c.w / 4).toFixed(2)} bars · snap 1/8 on release
        </span>
      </div>
    </ModelPanel>
  );
}

export const selDomain: DomainDef = {
  id: "sel", num: "13", title: "Audio Selection", fa: "انتخاب صدا", accent: "#e89a5c", group: "edit",
  note: "Marquee برای انتخابِ سریعِ محدوده‌ای، چندانتخابی برای آرانژ، و Trim برای جراحیِ طول — سه ابزارِ سه سبکِ کاری.",
  models: [
    { name: "Marquee Select", tag: "", note: "", Comp: SelMarquee },
    { name: "Multi-Select + Move", tag: "", note: "", Comp: SelMove },
    { name: "Trim Handles", tag: "", note: "", Comp: SelTrim },
  ],
};

/* ================= 14 · FADE IN / OUT ================= */

const shapes = {
  lin: (t: number) => t,
  smooth: (t: number) => t * t * (3 - 2 * t),
  exp: (t: number) => t * t * t,
  log: (t: number) => 1 - Math.pow(1 - t, 3),
};
type ShapeId = keyof typeof shapes;
const SHAPE_LIST: ShapeId[] = ["lin", "smooth", "exp", "log"];

function fadePoly(len: number, W: number, H: number, shape: (t: number) => number, side: "in" | "out") {
  const L = Math.min(len, W * 0.48);
  const pts: string[] = [];
  const steps = 26;
  if (side === "in") {
    pts.push(`0,0`, `${L.toFixed(1)},0`);
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      pts.push(`${(L * t).toFixed(1)},${(H * (1 - shape(t))).toFixed(1)}`);
    }
  } else {
    pts.push(`${W},0`, `${(W - L).toFixed(1)},0`);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      pts.push(`${(W - L * t).toFixed(1)},${(H * (1 - shape(t))).toFixed(1)}`);
    }
  }
  return pts.join(" ");
}

function FadeHandles({ accent }: { accent: string }) {
  const [fi, setFi] = useState(46);
  const [fo, setFo] = useState(30);
  const [ref, w] = useWidth<HTMLDivElement>();
  const W = Math.max(w, 10);
  const H = 96;
  const fiR = useRef(fi); fiR.current = fi;
  const foR = useRef(fo); foR.current = fo;

  const dragIn = usePointerDrag(({ dx }) => setFi(clamp(Math.round(fiR.current + (dx / W) * 100), 0, 48)));
  const dragOut = usePointerDrag(({ dx }) => setFo(clamp(Math.round(foR.current - (dx / W) * 100), 0, 48)));

  const secs = (pct: number) => ((pct / 100) * 8).toFixed(1);
  return (
    <ModelPanel
      letter="A" name="Edge Handles" tag="مستقیم · لبه‌ای" accent={accent}
      note="دستگیره‌ی گوشه را بگیرید و بکشید — همان الگوی Audition و RX؛ طول فید همان‌قدر است که می‌کشید."
      value={`in ${secs(fi)}s · out ${secs(fo)}s`} onReset={() => { setFi(46); setFo(30); }}
    >
      <div ref={ref} className="relative w-full h-full overflow-hidden">
        <Wave peaks={PK.slice(0, 120)} accent="#5a6170" opacity={0.75} />
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <polygon points={fadePoly((fi / 100) * W, W, H, shapes.smooth, "in")} fill="rgba(10,11,14,0.78)" />
          <polygon points={fadePoly((fo / 100) * W, W, H, shapes.smooth, "out")} fill="rgba(10,11,14,0.78)" />
          <polyline points={`0,${H} ` + Array.from({ length: 27 }, (_, i) => { const t = i / 26; return `${((fi / 100) * W * t).toFixed(1)},${(H * (1 - shapes.smooth(t))).toFixed(1)}`; }).join(" ")} fill="none" stroke={accent} strokeWidth={1.6} />
          <polyline points={`${W},${H} ` + Array.from({ length: 27 }, (_, i) => { const t = i / 26; return `${(W - (fo / 100) * W * t).toFixed(1)},${(H * (1 - shapes.smooth(t))).toFixed(1)}`; }).join(" ")} fill="none" stroke={accent} strokeWidth={1.6} />
        </svg>
        <span {...dragIn.handlers} className="handle w-4 h-4 rounded-full border-2" style={{ left: `calc(${fi}% - 8px)`, top: 5, background: "#22252d", borderColor: accent, cursor: "ew-resize", boxShadow: `0 2px 8px rgba(0,0,0,.6)` }} />
        <span {...dragOut.handlers} className="handle w-4 h-4 rounded-full border-2" style={{ left: `calc(${100 - fo}% - 8px)`, top: 5, background: "#22252d", borderColor: accent, cursor: "ew-resize", boxShadow: `0 2px 8px rgba(0,0,0,.6)` }} />
      </div>
    </ModelPanel>
  );
}

function FadeShapes({ accent }: { accent: string }) {
  const [shape, setShape] = useState<ShapeId>("smooth");
  const [lenIn, setLenIn] = useState(35);
  const [lenOut, setLenOut] = useState(25);
  const k = useSpring(SHAPE_LIST.indexOf(shape), 220, 26);
  const [ref, w] = useWidth<HTMLDivElement>();
  const W = Math.max(w, 10);
  const H = 120;

  const blended = (t: number) => {
    const i = clamp(Math.floor(k), 0, 2);
    const j = clamp(i + 1, 0, 3);
    const f = clamp(k - i, 0, 1);
    return shapes[SHAPE_LIST[i]](t) * (1 - f) + shapes[SHAPE_LIST[j]](t) * f;
  };

  const curvePts = (side: "in" | "out") =>
    Array.from({ length: 27 }, (_, i) => {
      const t = i / 26;
      const len = ((side === "in" ? lenIn : lenOut) / 100) * W;
      const x = side === "in" ? len * t : W - len * t;
      return `${x.toFixed(1)},${(H * (1 - blended(t))).toFixed(1)}`;
    }).join(" ");

  return (
    <ModelPanel
      letter="B" name="Shape Morph" tag="انتخابی · مورف" accent={accent}
      note="انتخاب کاراکتر منحنی — Linear تا Log — و فنر بین شکل‌ها مورف می‌کند تا رابطه‌ی قبل/بعد گم نشود."
      value={`${shape} · in ${(lenIn / 100 * 8).toFixed(1)}s / out ${(lenOut / 100 * 8).toFixed(1)}s`} onReset={() => { setShape("smooth"); setLenIn(35); setLenOut(25); }}
      height={262}
    >
      <div className="w-full h-full px-4 py-3 flex flex-col justify-center gap-3">
        <div ref={ref} className="relative rounded-md overflow-hidden" style={{ height: 118, background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            <polygon points={`0,0 ${((lenIn / 100) * W).toFixed(1)},0 ` + curvePts("in")} fill="rgba(10,11,14,0.7)" />
            <polygon points={`${W},0 ${(W - (lenOut / 100) * W).toFixed(1)},0 ` + curvePts("out")} fill="rgba(10,11,14,0.7)" />
            <polyline points={`0,${H} ` + curvePts("in")} fill="none" stroke={accent} strokeWidth={1.8} />
            <polyline points={`${W},${H} ` + curvePts("out")} fill="none" stroke={accent} strokeWidth={1.8} />
          </svg>
        </div>
        <Segmented
          options={SHAPE_LIST.map((s) => ({ id: s, label: s === "lin" ? "Lin" : s === "smooth" ? "Smooth" : s === "exp" ? "Exp" : "Log" }))}
          value={shape}
          onChange={setShape}
          accent={accent}
        />
        <div className="flex items-center gap-3">
          {([["in", lenIn, setLenIn], ["out", lenOut, setLenOut]] as const).map(([lbl, val, set]) => (
            <label key={lbl} className="flex-1 flex items-center gap-2">
              <span className="font-mono text-[9.5px] w-7" style={{ color: "var(--ink-3)" }}>{lbl}</span>
              <input
                type="range" min={5} max={48} value={val}
                onChange={(e) => set(Number(e.target.value))}
                className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(90deg, ${accent} ${((val - 5) / 43) * 100}%, rgba(255,255,255,0.12) 0)`, accentColor: accent }}
              />
            </label>
          ))}
        </div>
      </div>
    </ModelPanel>
  );
}

function FadeCurves({ accent }: { accent: string }) {
  const [pts, setPts] = useState({ inX: 0.45, inY: 0.5, outX: 0.45, outY: 0.5 });
  const [ref, w] = useWidth<HTMLDivElement>();
  const W = Math.max(w, 10);
  const H = 130;
  const active = useRef<"in" | "out" | null>(null);

  const drag = usePointerDrag(({ x, y }) => {
    const el = ref.current;
    if (!el || !active.current) return;
    const r = el.getBoundingClientRect();
    const fx = clamp((x - r.left) / r.width, 0.06, 0.94);
    const fy = clamp((y - r.top) / r.height, 0.04, 0.96);
    setPts((p) => (active.current === "in" ? { ...p, inX: fx, inY: fy } : { ...p, outX: fx, outY: fy }));
  });

  const quad = (side: "in" | "out") => {
    const L = (side === "in" ? 0.46 : 0.46) * W;
    const cx = side === "in" ? pts.inX * L : W - pts.outX * L;
    const cy = pts[side === "in" ? "inY" : "outY"] * H;
    const p0 = side === "in" ? { x: L, y: 0 } : { x: W - L, y: 0 };
    const p1 = side === "in" ? { x: 0, y: H } : { x: W, y: H };
    return Array.from({ length: 25 }, (_, i) => {
      const t = i / 24;
      const bx = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * cx + t ** 2 * p1.x;
      const by = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * cy + t ** 2 * p1.y;
      return `${bx.toFixed(1)},${by.toFixed(1)}`;
    }).join(" ");
  };

  return (
    <ModelPanel
      letter="C" name="Curve Points" tag="آزاد · بزیه" accent={accent}
      note="یک نقطه‌ی کنترل، کل شخصیت فید را می‌سازد — منحنی دلخواه بدون منوی شکل، فقط با کشیدن."
      value={`in (${Math.round(pts.inX * 100)},${Math.round(pts.inY * 100)}) · out (${Math.round(pts.outX * 100)},${Math.round(pts.outY * 100)})`}
      onReset={() => setPts({ inX: 0.45, inY: 0.5, outX: 0.45, outY: 0.5 })}
      height={262}
    >
      <div
        ref={ref}
        {...drag.handlers}
        onPointerDownCapture={(e) => {
          const el = ref.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          const fx = (e.clientX - r.left) / r.width;
          active.current = fx < 0.5 ? "in" : "out";
        }}
        onPointerUp={() => { active.current = null; }}
        className="relative w-full h-full overflow-hidden"
      >
        <Wave peaks={PK.slice(0, 130)} accent="#5a6170" opacity={0.65} />
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <polygon points={`0,0 ${(0.46 * W).toFixed(1)},0 ` + quad("in")} fill="rgba(10,11,14,0.75)" />
          <polygon points={`${W},0 ${(W - 0.46 * W).toFixed(1)},0 ` + quad("out")} fill="rgba(10,11,14,0.75)" />
          <polyline points={`${(0.46 * W).toFixed(1)},0 ` + quad("in")} fill="none" stroke={accent} strokeWidth={1.8} />
          <polyline points={`${(W - 0.46 * W).toFixed(1)},0 ` + quad("out")} fill="none" stroke={accent} strokeWidth={1.8} />
        </svg>
        {(["in", "out"] as const).map((s) => {
          const L = 0.46 * W;
          const cx = s === "in" ? pts.inX * L : W - pts.outX * L;
          const cy = pts[s === "in" ? "inY" : "outY"] * H;
          return (
            <span
              key={s}
              className="absolute w-4 h-4 rounded-full border-2 pointer-events-none"
              style={{ left: (cx / W) * 100 + "%", top: (cy / H) * 100 + "%", transform: "translate(-50%,-50%)", background: active.current === s ? accent : "#22252d", borderColor: accent, boxShadow: `0 0 12px ${accent}66` }}
            />
          );
        })}
      </div>
    </ModelPanel>
  );
}

export const fadeDomain: DomainDef = {
  id: "fade", num: "14", title: "Fade In / Out", fa: "فید", accent: "#7fb8a8", group: "edit",
  note: "دستگیره‌ی لبه سریع‌ترین راه است، Shape Morph شخصیتِ فید را انتخاب می‌کند، و نقطه‌ی بزیه آزادی کامل می‌دهد — هرکدام برای یک لحظه‌ی کاری.",
  models: [
    { name: "Edge Handles", tag: "", note: "", Comp: FadeHandles },
    { name: "Shape Morph", tag: "", note: "", Comp: FadeShapes },
    { name: "Curve Points", tag: "", note: "", Comp: FadeCurves },
  ],
};

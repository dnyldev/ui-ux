import { useEffect, useRef, useState } from "react";
import {
  clamp, Dial, DomainDef, ModelPanel, Segmented, Wave, genPeaks, smoothPath, snap, usePointerDrag, useSpring,
} from "../lib/core";

const STEMS = [
  { id: "vocals", label: "Vocals", color: "#e884b0" },
  { id: "drums", label: "Drums", color: "#e89a5c" },
  { id: "bass", label: "Bass", color: "#5fb2e8" },
  { id: "other", label: "Other", color: "#9cc15e" },
];
const DEF_LEVELS: Record<string, number> = { vocals: 82, drums: 76, bass: 80, other: 68 };

/* live level meter — decorative pulse derived from level */
function Meter({ level, accent, seed }: { level: number; accent: string; seed: number }) {
  const [h, setH] = useState(20);
  const last = useRef(0);
  useEffect(() => {
    let raf = 0;
    const step = (now: number) => {
      const t = now / 1000;
      const v = (level / 100) * (0.5 + 0.5 * Math.abs(Math.sin(t * 2.2 + seed) * 0.65 + Math.sin(t * 3.9 + seed * 2.3) * 0.35));
      if (Math.abs(v * 100 - last.current) > 1.4) {
        last.current = v * 100;
        setH(v * 100);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [level, seed]);
  return (
    <div className="w-[5px] h-full rounded-full relative overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
      <span className="absolute bottom-0 inset-x-0 rounded-full" style={{ height: `${h}%`, background: `linear-gradient(180deg, ${accent}, ${accent}77)`, transition: "height .12s linear" }} />
    </div>
  );
}

function MiniFader({ value, onChange, accent }: { value: number; onChange: (v: number) => void; accent: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = usePointerDrag(({ y }) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    onChange(clamp(Math.round(100 * (1 - (y - r.top) / r.height)), 0, 100));
  });
  return (
    <div
      ref={trackRef}
      {...drag.handlers}
      onPointerDownCapture={(e) => {
        const el = trackRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        onChange(clamp(Math.round(100 * (1 - (e.clientY - r.top) / r.height)), 0, 100));
      }}
      className="relative w-7 rounded-md cursor-ns-resize"
      style={{ height: 132, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="absolute inset-x-2 top-1.5 bottom-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.09)" }} />
      <div className="absolute inset-x-2 bottom-1.5 rounded-full" style={{ height: `calc(${value}% - 6px)`, background: `linear-gradient(180deg, ${accent}, ${accent}66)` }} />
      <div
        className="absolute left-1/2 w-6 h-3 rounded-[4px] border"
        style={{ bottom: `calc(${value}% - 6px)`, transform: "translate(-50%, 50%)", background: "#2b2f38", borderColor: accent, boxShadow: "0 2px 6px rgba(0,0,0,.5)" }}
      />
    </div>
  );
}

/* ================= 06 · STEM MIXER ================= */

function StemConsole({ accent }: { accent: string }) {
  const [levels, setLevels] = useState<Record<string, number>>({ ...DEF_LEVELS });
  const [mutes, setMutes] = useState<Record<string, boolean>>({ vocals: false, drums: false, bass: false, other: false });
  return (
    <ModelPanel
      letter="A" name="Mini Console" tag="فیدر · مطلق" accent={accent}
      note="چهار فیدر مطلق با متر زنده و Mute مستقل — همان چیدمانی که در استودیو استاندارد شده."
      value={`V ${mutes.vocals ? "×" : levels.vocals} · D ${mutes.drums ? "×" : levels.drums} · B ${mutes.bass ? "×" : levels.bass} · O ${mutes.other ? "×" : levels.other}`}
      onReset={() => { setLevels({ ...DEF_LEVELS }); setMutes({ vocals: false, drums: false, bass: false, other: false }); }}
      height={252}
    >
      <div className="flex items-end gap-4 py-4">
        {STEMS.map((s, i) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div className="flex items-end gap-1.5" style={{ height: 132 }}>
              <Meter level={mutes[s.id] ? 0 : levels[s.id]} accent={s.color} seed={i * 3.1} />
              <MiniFader value={mutes[s.id] ? 0 : levels[s.id]} onChange={(v) => setLevels((l) => ({ ...l, [s.id]: v }))} accent={s.color} />
            </div>
            <button
              type="button"
              className="w-7 h-6 rounded-md border text-[10px] font-disp font-bold cursor-pointer transition-all"
              style={{
                borderColor: mutes[s.id] ? "#e86a6a" : "rgba(255,255,255,0.1)",
                background: mutes[s.id] ? "#e86a6a22" : "rgba(255,255,255,0.03)",
                color: mutes[s.id] ? "#e86a6a" : "var(--ink-3)",
              }}
              onClick={() => setMutes((m) => ({ ...m, [s.id]: !m[s.id] }))}
            >
              M
            </button>
            <span className="text-[9.5px] font-semibold" style={{ color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>
    </ModelPanel>
  );
}

function StemFocus({ accent }: { accent: string }) {
  const [focus, setFocus] = useState<string | null>(null);
  const [levels] = useState<Record<string, number>>({ ...DEF_LEVELS });
  return (
    <ModelPanel
      letter="B" name="Focus Mode" tag="انتخابی · داک خودکار" accent={accent}
      note="الگوی اپ‌های جداسازی: با انتخاب هر استم، بقیه نرم پایین می‌آیند — بدون لمس چهار فیدر."
      value={focus ? `focus: ${STEMS.find((s) => s.id === focus)?.label}` : "balanced"} onReset={() => setFocus(null)}
    >
      <div className="grid grid-cols-2 gap-2.5 w-full px-4 py-4">
        {STEMS.map((s) => {
          const focused = focus === s.id;
          const dimmed = focus != null && !focused;
          const eff = focus == null ? levels[s.id] : focused ? 100 : 14;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setFocus((f) => (f === s.id ? null : s.id))}
              className="relative rounded-xl border p-3 cursor-pointer text-start overflow-hidden"
              style={{
                borderColor: focused ? s.color : "rgba(255,255,255,0.07)",
                background: focused ? `${s.color}16` : "rgba(0,0,0,0.25)",
                opacity: dimmed ? 0.55 : 1,
                transform: focused ? "scale(1.03)" : "scale(1)",
                transition: "all .38s cubic-bezier(.22,1,.36,1)",
                boxShadow: focused ? `0 8px 24px -10px ${s.color}66` : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-disp font-semibold text-[12.5px]" style={{ color: focused ? s.color : "var(--ink-2)" }}>{s.label}</span>
                <span className="w-2 h-2 rounded-full" style={{ background: s.color, opacity: focused ? 1 : 0.45, boxShadow: focused ? `0 0 8px ${s.color}` : undefined, transition: "all .3s" }} />
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <span className="block h-full rounded-full" style={{ width: `${eff}%`, background: s.color, transition: "width .5s cubic-bezier(.22,1,.36,1)" }} />
              </div>
              <span className="absolute -bottom-1 -left-1 font-mono font-bold text-[34px] leading-none pointer-events-none" style={{ color: s.color, opacity: 0.1 }}>{eff}</span>
            </button>
          );
        })}
      </div>
    </ModelPanel>
  );
}

function StemKnobs({ accent }: { accent: string }) {
  const [levels, setLevels] = useState<Record<string, number>>({ ...DEF_LEVELS });
  return (
    <ModelPanel
      letter="C" name="Quad Knobs" tag="چرخشی · نسبی" accent={accent}
      note="چهار ناب نسبی فشرده؛ دابل‌کلیک هر ناب آن را به پیش‌فرض برمی‌گرداند — مناسب سطحِ کانال."
      value={`V ${levels.vocals} · D ${levels.drums} · B ${levels.bass} · O ${levels.other}`}
      onReset={() => setLevels({ ...DEF_LEVELS })}
    >
      <div className="grid grid-cols-4 gap-2 px-4 py-5 w-full place-items-center">
        {STEMS.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-1.5">
            <Dial value={levels[s.id]} min={0} max={100} onChange={(v) => setLevels((l) => ({ ...l, [s.id]: Math.round(v) }))} onReset={() => setLevels((l) => ({ ...l, [s.id]: DEF_LEVELS[s.id] }))} accent={s.color} size={68} sens={0.5} fineSens={0.08} step={1} format={(v) => `${Math.round(v)}`} />
            <span className="text-[9.5px] font-semibold" style={{ color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>
    </ModelPanel>
  );
}

export const stemDomain: DomainDef = {
  id: "stems", num: "06", title: "Stem Mixer", fa: "میکسر استم‌ها", accent: "#45c4b0", group: "mix",
  note: "کنسول برای کنترل هم‌زمان و دقیق، Focus برای شنیدنِ یک استم بدون درگیرکردن دست‌ها، و ناب‌ها برای تنظیم نسبی سریع — سه جواب به یک سؤال.",
  models: [
    { name: "Mini Console", tag: "", note: "", Comp: StemConsole },
    { name: "Focus Mode", tag: "", note: "", Comp: StemFocus },
    { name: "Quad Knobs", tag: "", note: "", Comp: StemKnobs },
  ],
};

/* ================= 07 · VOCAL ISOLATION ================= */

const VOC_PEAKS = genPeaks(3, 140);
const INS_PEAKS = genPeaks(11, 140);

function VocalBalance({ accent }: { accent: string }) {
  const [mix, setMix] = useState(0); // -100 inst .. +100 vocals
  const barRef = useRef<HTMLDivElement>(null);
  const vR = useRef(mix);
  vR.current = mix;
  const drag = usePointerDrag(({ x, dx }) => {
    const el = barRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let nv = vR.current + (dx / r.width) * 220;
    if (Math.abs(nv) < 8) nv = 0;
    void x;
    setMix(clamp(Math.round(nv), -100, 100));
  });

  const vocalPct = (mix + 100) / 2;
  return (
    <ModelPanel
      letter="A" name="Balance Fader" tag="دوقطبی · دتنت مرکز" accent={accent}
      note="یک دستگیره بین دو دنیا؛ دتنت قوی در مرکز تا حالت Balanced همیشه یک حرکتِ کوتاه باشد."
      value={mix === 0 ? "balanced" : mix > 0 ? `vocals +${mix}` : `instr ${-mix}`} onReset={() => setMix(0)}
    >
      <div className="w-full px-5 flex flex-col justify-center gap-4 h-full">
        <div className="relative h-16 rounded-lg overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="absolute inset-0 opacity-70" style={{ opacity: 0.25 + 0.5 * (1 - vocalPct / 100) }}>
            <Wave peaks={INS_PEAKS} accent="#5fb2e8" opacity={0.9} />
          </div>
          <div className="absolute inset-0" style={{ opacity: 0.25 + 0.55 * (vocalPct / 100) }}>
            <Wave peaks={VOC_PEAKS} accent={accent} opacity={0.9} />
          </div>
        </div>
        <div
          ref={barRef}
          {...drag.handlers}
          className="relative h-9 rounded-full cursor-ew-resize"
          style={{ background: "rgba(0,0,0,0.42)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="absolute left-1/2 top-1.5 bottom-1.5 w-px -translate-x-1/2" style={{ background: "rgba(255,255,255,0.25)" }} />
          <span className="absolute inset-y-1.5 rounded-full" style={{ left: mix >= 0 ? "50%" : `${50 + mix / 2}%`, width: `${Math.abs(mix) / 2}%`, background: `${accent}55`, transition: "width .1s linear" }} />
          <span
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2"
            style={{ left: `calc(${50 + mix / 2}% - 12px)`, background: "#262a32", borderColor: accent, boxShadow: drag.dragging ? `0 0 14px ${accent}77` : "0 2px 8px rgba(0,0,0,.5)", transition: drag.dragging ? "none" : "left .1s linear" }}
          />
        </div>
        <div className="flex justify-between font-disp font-semibold text-[10px] tracking-wide" style={{ color: "var(--ink-3)" }}>
          <span>INSTRUMENTAL</span>
          <span style={{ color: accent }}>VOCALS</span>
        </div>
      </div>
    </ModelPanel>
  );
}

function VocalModes({ accent }: { accent: string }) {
  const [mode, setMode] = useState<"orig" | "instr" | "voc" | "aca">("orig");
  const target = mode === "orig" ? 50 : mode === "instr" ? 0 : mode === "voc" ? 100 : 82;
  const amt = useSpring(target, 120, 20);
  const vocalO = 0.2 + 0.6 * (amt / 100);
  const instrO = 0.2 + 0.6 * (1 - amt / 100);
  return (
    <ModelPanel
      letter="B" name="Mode Switcher" tag="انتخابی · قطعی" accent={accent}
      note="انتخاب قطعی بین چهار حالت — بدون ابهام؛ منحنی پاسخ با فنر بین حالت‌ها مورف می‌شود."
      value={mode === "orig" ? "original" : mode === "instr" ? "instrumental" : mode === "voc" ? "vocals" : "acapella"} onReset={() => setMode("orig")}
    >
      <div className="w-full px-5 flex flex-col justify-center gap-4 h-full">
        <div className="relative h-16 rounded-lg overflow-hidden" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="absolute inset-0" style={{ opacity: instrO }}>
            <Wave peaks={INS_PEAKS} accent="#5fb2e8" />
          </div>
          <div className="absolute inset-0" style={{ opacity: vocalO }}>
            <Wave peaks={VOC_PEAKS} accent={accent} />
          </div>
          <span className="absolute top-1.5 right-2 font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${accent}1c`, color: accent }}>
            stem {Math.round(amt)}%
          </span>
        </div>
        <Segmented
          options={[
            { id: "orig" as const, label: "Original" },
            { id: "instr" as const, label: "Instr" },
            { id: "voc" as const, label: "Vocals" },
            { id: "aca" as const, label: "Acapella" },
          ]}
          value={mode}
          onChange={setMode}
          accent={accent}
        />
      </div>
    </ModelPanel>
  );
}

function VocalSplit({ accent }: { accent: string }) {
  const [mix, setMix] = useState(50);
  const boxRef = useRef<HTMLDivElement>(null);
  const mR = useRef(mix);
  mR.current = mix;
  const drag = usePointerDrag(({ dy }) => {
    const el = boxRef.current;
    if (!el) return;
    setMix(clamp(Math.round(mR.current + (dy / el.clientHeight) * 130), 6, 94));
  });
  return (
    <ModelPanel
      letter="C" name="Layer Split" tag="مستقیم · بصری" accent={accent}
      note="نسبتِ لایه‌ها همان چیزی است که می‌بینید؛ مرز را بگیرید و بکشید — بازخورد، خودِ تصویر است."
      value={`vocals ${mix}% · instr ${100 - mix}%`} onReset={() => setMix(50)}
    >
      <div ref={boxRef} className="relative w-full h-full overflow-hidden">
        <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: `${mix}%`, transition: "height .08s linear" }}>
          <Wave peaks={VOC_PEAKS} accent={accent} opacity={0.85} />
          <span className="absolute top-2 left-3 font-disp font-bold text-[10px] tracking-[0.15em]" style={{ color: accent }}>VOCALS</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: `${100 - mix}%`, transition: "height .08s linear" }}>
          <Wave peaks={INS_PEAKS} accent="#5fb2e8" opacity={0.8} />
          <span className="absolute bottom-2 left-3 font-disp font-bold text-[10px] tracking-[0.15em]" style={{ color: "#5fb2e8" }}>INSTRUMENTAL</span>
        </div>
        <div {...drag.handlers} className="absolute inset-x-0 h-5 -translate-y-1/2 cursor-ns-resize flex items-center justify-center" style={{ top: `${mix}%`, transition: "top .08s linear" }}>
          <span className="w-full h-[2px]" style={{ background: "rgba(255,255,255,0.35)" }} />
          <span className="absolute w-8 h-4 rounded-md border flex items-center justify-center" style={{ background: "#262a32", borderColor: "rgba(255,255,255,0.3)", boxShadow: drag.dragging ? `0 0 12px ${accent}66` : "0 2px 8px rgba(0,0,0,.5)" }}>
            <span className="w-4 h-[2px] rounded-full" style={{ background: accent }} />
          </span>
        </div>
      </div>
    </ModelPanel>
  );
}

export const vocalDomain: DomainDef = {
  id: "vocal", num: "07", title: "Vocal Isolation", fa: "جداسازی وکال", accent: "#e884b0", group: "mix",
  note: "Balance برای کنترل پیوسته، Mode برای خروجی قطعی و قابل‌اتکا، و Layer Split برای درک بصریِ نسبت — مثل Moises اما با سه منطق متفاوت.",
  models: [
    { name: "Balance Fader", tag: "", note: "", Comp: VocalBalance },
    { name: "Mode Switcher", tag: "", note: "", Comp: VocalModes },
    { name: "Layer Split", tag: "", note: "", Comp: VocalSplit },
  ],
};

/* ================= 08 · EQ ================= */

const FMIN = 40;
const FMAX = 16000;
const fx = (f: number, w: number) => (Math.log(f / FMIN) / Math.log(FMAX / FMIN)) * w;
const fy = (g: number, h: number) => h / 2 - (g / 12) * (h / 2 - 10);
const invF = (x: number, w: number) => clamp(FMIN * Math.pow(FMAX / FMIN, x / w), 60, 12000);
const invG = (y: number, h: number) => clamp(((h / 2 - y) / (h / 2 - 10)) * 12, -12, 12);
const fmtF = (f: number) => (f >= 1000 ? `${(f / 1000).toFixed(1)}k` : `${Math.round(f)}`);

function eqCurve(bands: { f: number; g: number }[], w: number, h: number) {
  const [b0, b1, b2] = bands;
  const pts: [number, number][] = [
    [0, fy(b0.g, h)],
    [fx(b0.f, w) * 0.55, fy(b0.g, h)],
    [fx(b0.f, w), fy(b0.g, h)],
    [fx(b1.f, w), fy(b1.g, h)],
    [fx(b2.f, w), fy(b2.g, h)],
    [fx(b2.f, w) + (w - fx(b2.f, w)) * 0.45, fy(b2.g, h)],
    [w, fy(b2.g, h)],
  ];
  return smoothPath(pts);
}

function EQPoints({ accent }: { accent: string }) {
  const [bands, setBands] = useState([
    { f: 120, g: 0 },
    { f: 1000, g: 0 },
    { f: 6400, g: 0 },
  ]);
  const [sel, setSel] = useState(1);
  const svgRef = useRef<SVGSVGElement>(null);
  const active = useRef<number | null>(null);
  const W = 300;
  const H = 150;

  const drag = usePointerDrag(({ x, y }) => {
    const el = svgRef.current;
    if (el == null || active.current == null) return;
    const r = el.getBoundingClientRect();
    const px = ((x - r.left) / r.width) * W;
    const py = ((y - r.top) / r.height) * H;
    const i = active.current;
    setBands((bs) =>
      bs.map((b, j) => {
        if (j !== i) return b;
        let g = invG(py, H);
        if (Math.abs(g) < 0.7) g = 0;
        else g = snap(g, 0.5);
        const f = clamp(invF(px, W), j === 0 ? 60 : bs[j - 1].f * 1.4, j === 2 ? 12000 : bs[j + 1].f / 1.4);
        return { f: Math.round(f), g };
      })
    );
  });

  const d = eqCurve(bands, W, H);
  return (
    <ModelPanel
      letter="A" name="Parametric Curve" tag="منحنی · مستقیم" accent={accent}
      note="هر نقطه خودش فرکانس و گین است؛ منحنی Catmull-Rom پاسخ را زنده نشان می‌دهد — الگوی FabFilter."
      value={`${fmtF(bands[sel].f)} Hz · ${bands[sel].g > 0 ? "+" : ""}${bands[sel].g.toFixed(1)} dB`} onReset={() => setBands([{ f: 120, g: 0 }, { f: 1000, g: 0 }, { f: 6400, g: 0 }])}
      height={252}
    >
      <div className="w-full h-full px-3 py-3 flex flex-col justify-center">
        <div
          className="relative"
          {...drag.handlers}
          onPointerDownCapture={(e) => {
            const el = svgRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            const px = ((e.clientX - r.left) / r.width) * W;
            const py = ((e.clientY - r.top) / r.height) * H;
            let best = -1;
            let bd = 26;
            bands.forEach((b, i) => {
              const dd = Math.hypot(fx(b.f, W) - px, fy(b.g, H) - py);
              if (dd < bd) { bd = dd; best = i; }
            });
            active.current = best >= 0 ? best : null;
            if (best >= 0) setSel(best);
          }}
          onPointerUp={() => { active.current = null; }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="w-full block cursor-crosshair rounded-lg"
            style={{ height: 190, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", touchAction: "none" }}
          >
          {[0.25, 0.5, 0.75].map((k) => (
            <line key={k} x1={0} x2={W} y1={H * k} y2={H * k} stroke="rgba(255,255,255,0.05)" />
          ))}
          {[100, 1000, 10000].map((f) => (
            <line key={f} x1={fx(f, W)} x2={fx(f, W)} y1={0} y2={H} stroke="rgba(255,255,255,0.05)" />
          ))}
          <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 4" />
          <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill={`${accent}14`} />
          <path d={d} fill="none" stroke={accent} strokeWidth={2.2} />
          {bands.map((b, i) => (
            <g key={i}>
              <circle cx={fx(b.f, W)} cy={fy(b.g, H)} r={i === sel ? 8 : 6} fill={i === sel ? accent : "#22252d"} stroke={accent} strokeWidth={2} />
              <text x={fx(b.f, W)} y={fy(b.g, H) - 12} textAnchor="middle" fontSize={9} fill={i === sel ? accent : "rgba(255,255,255,0.35)"} fontFamily="JetBrains Mono">
                {["LOW", "MID", "HIGH"][i]}
              </text>
            </g>
          ))}
          </svg>
        </div>
      </div>
    </ModelPanel>
  );
}

function VSlider({ value, onChange, accent, label }: { value: number; onChange: (v: number) => void; accent: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = usePointerDrag(({ y }) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let g = invG(((y - r.top) / r.height) * 150, 150);
    if (Math.abs(g) < 0.6) g = 0;
    onChange(snap(g, 0.5));
  });
  const pct = ((value + 12) / 24) * 100;
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={ref}
        {...drag.handlers}
        onPointerDownCapture={(e) => {
          const el = ref.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          let g = invG(((e.clientY - r.top) / r.height) * 150, 150);
          if (Math.abs(g) < 0.6) g = 0;
          onChange(snap(g, 0.5));
        }}
        className="relative w-9 rounded-md cursor-ns-resize"
        style={{ height: 150, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {[-12, -6, 0, 6, 12].map((t) => (
          <span key={t} className="absolute inset-x-1 h-px" style={{ bottom: `${((t + 12) / 24) * 100}%`, background: t === 0 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.07)" }} />
        ))}
        <span
          className="absolute inset-x-2 rounded-full"
          style={{
            bottom: value >= 0 ? "50%" : `${pct}%`,
            height: `${Math.abs(value) / 24 * 100}%`,
            background: `${accent}66`,
          }}
        />
        <span
          className="absolute left-1/2 w-7 h-3 rounded-[4px] border"
          style={{ bottom: `${pct}%`, transform: "translate(-50%, 50%)", background: "#2b2f38", borderColor: accent, boxShadow: drag.dragging ? `0 0 10px ${accent}66` : "0 2px 6px rgba(0,0,0,.5)" }}
        />
      </div>
      <span className="font-disp font-semibold text-[10px] tracking-wide" style={{ color: "var(--ink-3)" }}>{label}</span>
      <span className="font-mono text-[10.5px]" style={{ color: value === 0 ? "var(--ink-3)" : accent }}>{value > 0 ? "+" : ""}{value.toFixed(1)}</span>
    </div>
  );
}

function EQSliders({ accent }: { accent: string }) {
  const [g, setG] = useState([0, 0, 0]);
  return (
    <ModelPanel
      letter="B" name="Band Sliders" tag="اسلایدر · قطعی" accent={accent}
      note="هر باند یک اسلایدر دوقطبی با دتنت صفر — certainty کامل برای میکس سریع، مثل EQ کنسول."
      value={`L ${g[0] > 0 ? "+" : ""}${g[0]} · M ${g[1] > 0 ? "+" : ""}${g[1]} · H ${g[2] > 0 ? "+" : ""}${g[2]}`} onReset={() => setG([0, 0, 0])}
      height={252}
    >
      <div className="flex items-start justify-center gap-7 py-4">
        {["LOW", "MID", "HIGH"].map((l, i) => (
          <VSlider key={l} value={g[i]} onChange={(v) => setG((arr) => arr.map((x, j) => (j === i ? v : x)))} accent={accent} label={l} />
        ))}
      </div>
    </ModelPanel>
  );
}

function EQTilt({ accent }: { accent: string }) {
  const [tilt, setTilt] = useState(0);
  const [pres, setPres] = useState(20);
  const W = 300;
  const H = 150;
  const pts: [number, number][] = [];
  for (let k = 0; k <= 40; k++) {
    const f = FMIN * Math.pow(FMAX / FMIN, k / 40);
    let g = (tilt / 100) * 7 * Math.log2(f / 700);
    g += (pres / 100) * 8 / (1 + Math.exp(-2.4 * Math.log2(f / 4000)));
    g = clamp(g, -12, 12);
    pts.push([(k / 40) * W, fy(g, H)]);
  }
  const d = smoothPath(pts);
  return (
    <ModelPanel
      letter="C" name="Tilt + Presence" tag="تک‌کنترل · سراسری" accent={accent}
      note="یک ناب کل طیف را کج می‌کند و یکی دیگر هوای بالا را می‌سازد — EQ بدون هیچ پارامتر ترسناک."
      value={`tilt ${tilt > 0 ? "+" : ""}${tilt} · air ${pres}`} onReset={() => { setTilt(0); setPres(20); }}
      height={252}
    >
      <div className="w-full h-full px-3 py-3 flex items-center gap-4">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="flex-1 rounded-lg" style={{ height: 170, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="rgba(255,255,255,0.12)" strokeDasharray="3 4" />
          <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill={`${accent}12`} />
          <path d={d} fill="none" stroke={accent} strokeWidth={2.2} style={{ transition: "d .15s" }} />
        </svg>
        <div className="flex flex-col items-center gap-3 flex-none">
          <Dial value={tilt} min={-100} max={100} onChange={(v) => setTilt(Math.round(v))} onReset={() => setTilt(0)} accent={accent} size={72} sens={0.8} fineSens={0.15} step={1} format={(v) => `${Math.round(v) > 0 ? "+" : ""}${Math.round(v)}`} unit="tilt" />
          <Dial value={pres} min={0} max={100} onChange={(v) => setPres(Math.round(v))} onReset={() => setPres(20)} accent="#5fb2e8" size={72} sens={0.8} fineSens={0.15} step={1} format={(v) => `${Math.round(v)}`} unit="air" />
        </div>
      </div>
    </ModelPanel>
  );
}

export const eqDomain: DomainDef = {
  id: "eq", num: "08", title: "EQ", fa: "اکولایزر", accent: "#9cc15e", group: "mix",
  note: "منحنی پارامتریک سریع‌ترین راهِ دیدنِ صداست، اسلایدرها قطعیت می‌دهند، و Tilt نشان می‌دهد گاهی یک کنترلِ درست از ده کنترل بهتر است.",
  models: [
    { name: "Parametric Curve", tag: "", note: "", Comp: EQPoints },
    { name: "Band Sliders", tag: "", note: "", Comp: EQSliders },
    { name: "Tilt + Presence", tag: "", note: "", Comp: EQTilt },
  ],
};

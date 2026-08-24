import { useEffect, useRef, useState } from "react";
import {
  clamp, DomainDef, Icon, ModelPanel, Wave, fmtTime, genPeaks, snap, usePlayer, usePointerDrag, useWidth,
} from "../lib/core";

/* ================= 11 · CHORD TIMELINE ================= */

const CHORD_COLORS: Record<string, string> = {
  C: "#4cc9a6", Dm: "#e89a5c", Em: "#b08ae8", F: "#5fb2e8", G: "#f2a93b", Am: "#e884b0",
};
type Chord = { id: number; start: number; len: number; name: string };
const CHORDS0: Chord[] = [
  { id: 0, start: 0, len: 2, name: "Am" },
  { id: 1, start: 2, len: 2, name: "F" },
  { id: 2, start: 4, len: 2, name: "C" },
  { id: 3, start: 6, len: 2, name: "G" },
];

function ChordBlocks({ accent }: { accent: string }) {
  const [chords, setChords] = useState<Chord[]>(CHORDS0.map((c) => ({ ...c })));
  const [ref, w] = useWidth<HTMLDivElement>();
  const ppb = w > 0 ? w / 8 : 30;
  const info = useRef<{ id: number; mode: "move" | "resize"; x0: number; start0: number; len0: number } | null>(null);
  const chordsR = useRef(chords);
  chordsR.current = chords;

  const drag = usePointerDrag(({ x }) => {
    const inf = info.current;
    if (!inf) return;
    const d = snap((x - inf.x0) / ppb, 0.5);
    setChords((cs) => {
      const sorted = [...cs].sort((a, b) => a.start - b.start);
      const idx = sorted.findIndex((c) => c.id === inf.id);
      const prevEnd = idx > 0 ? sorted[idx - 1].start + sorted[idx - 1].len : 0;
      const nextStart = idx < sorted.length - 1 ? sorted[idx + 1].start : 8;
      return cs.map((c) => {
        if (c.id !== inf.id) return c;
        if (inf.mode === "move") {
          const ns = clamp(inf.start0 + d, prevEnd, nextStart - c.len);
          return { ...c, start: ns };
        }
        const nl = clamp(inf.len0 + d, 0.5, nextStart - c.start);
        return { ...c, len: nl };
      });
    });
    void chordsR;
  });

  return (
    <ModelPanel
      letter="A" name="Block Editor" tag="مستقیم · بلوکی" accent={accent}
      note="بدنه‌ی هر آکورد جابه‌جا می‌شود و لبه‌ی راست، طولش را می‌برد — اسنپ روی نیم‌بار و برخورد با همسایه ممنوع."
      value={`${chords.length} chords · ${chords.map((c) => c.name).join(" · ")}`} onReset={() => setChords(CHORDS0.map((c) => ({ ...c })))}
    >
      <div ref={ref} className="relative w-full rounded-md overflow-hidden" style={{ height: 130, margin: "auto 16px", background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)" }}>
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="absolute inset-y-0 w-px pointer-events-none" style={{ left: i * ppb, background: i % 2 === 0 ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)" }} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <span key={`n${i}`} className="absolute top-1 font-mono text-[8.5px] pointer-events-none" style={{ left: i * ppb + 3, color: "var(--ink-3)" }}>{i + 1}</span>
        ))}
        {chords.map((c) => {
          const col = CHORD_COLORS[c.name] ?? accent;
          return (
            <div
              key={c.id}
              onPointerDown={(e) => {
                e.preventDefault();
                info.current = { id: c.id, mode: "move", x0: e.clientX, start0: c.start, len0: c.len };
                drag.handlers.onPointerDown?.(e);
              }}
              className="absolute rounded-lg border cursor-grab active:cursor-grabbing flex items-end justify-center pb-1"
              style={{
                left: c.start * ppb + 2,
                width: c.len * ppb - 4,
                top: 22,
                height: 82,
                background: `linear-gradient(180deg, ${col}33, ${col}14)`,
                borderColor: `${col}77`,
                touchAction: "none",
                transition: "left .07s linear, width .07s linear",
              }}
            >
              <span className="font-disp font-bold text-[15px] absolute top-2 left-2.5" style={{ color: col }}>{c.name}</span>
              <span className="font-mono text-[8.5px]" style={{ color: "var(--ink-3)" }}>{c.len} bar{c.len !== 1 ? "s" : ""}</span>
              <span
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  info.current = { id: c.id, mode: "resize", x0: e.clientX, start0: c.start, len0: c.len };
                  drag.handlers.onPointerDown?.(e);
                }}
                className="handle inset-y-0 -right-2 w-4 flex items-center justify-center"
              >
                <span className="w-[3px] h-7 rounded-full" style={{ background: col }} />
              </span>
            </div>
          );
        })}
      </div>
    </ModelPanel>
  );
}

function ChordSlots({ accent }: { accent: string }) {
  const [slots, setSlots] = useState<(string | null)[]>(["Am", "F", "C", "G", "Am", "F", null, null]);
  const [cur, setCur] = useState(6);
  const [flashK, setFlashK] = useState(0);
  const palette = ["C", "Dm", "Em", "F", "G", "Am"];

  return (
    <ModelPanel
      letter="B" name="Slot + Palette" tag="انتخابی · ورودی سریع" accent={accent}
      note="اول جایگاه، بعد آکورد — دو ضربه برای هر بارِ خالی، بدون درگ و بدون هدف‌گیری دقیق. مناسب موبایل."
      value={`bar ${cur + 1}: ${slots[cur] ?? "—"}`} onReset={() => { setSlots(["Am", "F", "C", "G", "Am", "F", null, null]); setCur(6); }}
    >
      <div className="w-full px-4 flex flex-col justify-center gap-3 h-full">
        <div className="grid grid-cols-8 gap-1">
          {slots.map((s, i) => {
            const col = s ? CHORD_COLORS[s] : undefined;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setCur(i)}
                className="h-14 rounded-lg border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all duration-200"
                style={{
                  borderColor: i === cur ? accent : col ? `${col}55` : "rgba(255,255,255,0.07)",
                  background: col ? `${col}1c` : "rgba(0,0,0,0.28)",
                  transform: i === cur ? "translateY(-3px)" : "none",
                  boxShadow: i === cur ? `0 6px 16px -8px ${accent}88` : undefined,
                }}
              >
                <span key={`${i}-${s}`} className={`font-disp font-bold text-[13px] ${s ? "value-pop" : ""}`} style={{ color: col ?? "var(--ink-3)" }}>{s ?? "·"}</span>
                <span className="font-mono text-[7.5px]" style={{ color: "var(--ink-3)" }}>{i + 1}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {palette.map((p) => (
            <button
              key={p}
              type="button"
              className="chip font-disp font-bold text-[12.5px] px-3.5"
              style={{ "--acc": CHORD_COLORS[p], borderColor: `${CHORD_COLORS[p]}55`, color: CHORD_COLORS[p] } as React.CSSProperties}
              onClick={() => { setSlots((sl) => sl.map((s, i) => (i === cur ? p : s))); setFlashK((k) => k + 1); }}
            >
              {p}
            </button>
          ))}
          <button key={`clr${flashK}`} type="button" className="btn-icon" onClick={() => setSlots((sl) => sl.map((s, i) => (i === cur ? null : s)))} aria-label="clear slot">
            <Icon name="x" size={12} />
          </button>
        </div>
      </div>
    </ModelPanel>
  );
}

function ChordScrub({ accent }: { accent: string }) {
  const [pos, setPos] = useState(0);
  const [ref, w] = useWidth<HTMLDivElement>();
  const posR = useRef(pos);
  posR.current = pos;
  const drag = usePointerDrag(
    ({ dx }) => {
      if (w <= 0) return;
      setPos(clamp(posR.current + (dx / w) * 8, 0, 7.99));
    },
    { onEnd: () => setPos((p) => clamp(Math.floor(p), 0, 7)) }
  );
  const cur = clamp(Math.floor(pos), 0, 7);
  const chordAt = (bar: number) => CHORDS0.find((c) => bar >= c.start && bar < c.start + c.len)?.name ?? "—";

  return (
    <ModelPanel
      letter="C" name="Scrub Strip" tag="مروری · خواندنی" accent={accent}
      note="نوار آکوردها را ورق بزنید؛ آکوردِ زیر انگشت بزرگ می‌شود — برای تمرین و مرورِ پیشرفت آکورد."
      value={`bar ${cur + 1} · ${chordAt(cur)}`} onReset={() => setPos(0)}
    >
      <div className="w-full h-full flex flex-col justify-center gap-3 px-4">
        <div className="text-center">
          <span key={cur} className="value-pop inline-block font-disp font-bold text-[40px] leading-none" style={{ color: CHORD_COLORS[chordAt(cur)] ?? accent }}>
            {chordAt(cur)}
          </span>
          <span className="block font-mono text-[10px] mt-1" style={{ color: "var(--ink-3)" }}>bar {cur + 1} / 8</span>
        </div>
        <div ref={ref} {...drag.handlers} className="relative h-14 rounded-lg cursor-ew-resize overflow-hidden" style={{ background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {Array.from({ length: 8 }, (_, i) => {
            const name = chordAt(i);
            const col = CHORD_COLORS[name] ?? "#5a6170";
            const isCur = i === cur;
            return (
              <span
                key={i}
                className="absolute inset-y-1.5 rounded-md flex items-center justify-center font-disp font-bold text-[11px]"
                style={{
                  left: `calc(${i * 12.5}% + 2px)`,
                  width: "calc(12.5% - 4px)",
                  background: `${col}${isCur ? "44" : "18"}`,
                  border: `1px solid ${col}${isCur ? "bb" : "44"}`,
                  color: isCur ? col : "var(--ink-3)",
                  transform: isCur ? "scale(1.08)" : "scale(1)",
                  transition: "transform .22s cubic-bezier(.22,1,.36,1), background .2s, color .2s",
                  boxShadow: isCur ? `0 4px 14px -6px ${col}` : undefined,
                }}
              >
                {name}
              </span>
            );
          })}
        </div>
      </div>
    </ModelPanel>
  );
}

export const chordDomain: DomainDef = {
  id: "chord", num: "11", title: "Chord Timeline", fa: "تایم‌لاین آکورد", accent: "#b08ae8", group: "timeline",
  note: "بلوک‌ها برای ویرایش ساختار، جایگاه+پالت برای ورودی سریعِ لمسی، و نوار مروری برای تمرین — سه فازِ کار با هارمونی.",
  models: [
    { name: "Block Editor", tag: "", note: "", Comp: ChordBlocks },
    { name: "Slot + Palette", tag: "", note: "", Comp: ChordSlots },
    { name: "Scrub Strip", tag: "", note: "", Comp: ChordScrub },
  ],
};

/* ================= 12 · LYRICS SYNC ================= */

const LINES = [
  "شب کوک شد رویِ نتِ سکوت",
  "ضربانِ شهر تویِ مشتِ ماست",
  "هر نفس یک سکوی تازه است",
  "صدا از میانِ ما رد می‌شود",
  "دست‌ها رویِ شانه‌های ریتم",
  "و این سازِ خسته بیدار شد",
  "نت‌ها از نفسِ تو می‌چرخند",
  "تا صبح با طنین می‌رقصند",
];
const STAMPS0 = [0, 4, 8, 12, 16, 20, 24, 28];
const LYR_PEAKS = genPeaks(13, 160);
const LDUR = 32;

const activeLine = (stamps: number[], t: number) => {
  let a = -1;
  stamps.forEach((s, i) => { if (s <= t + 0.001) a = i; });
  return a;
};

function LyricsTap({ accent }: { accent: string }) {
  const [stamps, setStamps] = useState([...STAMPS0]);
  const { time, playing, toggle } = usePlayer(LDUR);
  const act = activeLine(stamps, time);

  return (
    <ModelPanel
      letter="A" name="Tap Sync" tag="رویدادی · برچسب‌زنی" accent={accent} flash={false}
      note="پخش کنید و هم‌خوانی کنید؛ با تَپ روی هر خط، زمانِ همان لحظه ثبت می‌شود — سریع‌ترین راه سینک."
      value={`${fmtTime(time)} · line ${act >= 0 ? act + 1 : "—"}`} onReset={() => setStamps([...STAMPS0])} height={280}
    >
      <div className="w-full h-full px-3 py-2.5 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <button type="button" className="btn-icon" style={{ width: 32, height: 32, borderRadius: 16, borderColor: `${accent}55`, color: accent }} onClick={toggle} aria-label="play/pause">
            <Icon name={playing ? "pause" : "play"} size={14} />
          </button>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <span className="block h-full" style={{ width: `${(time / LDUR) * 100}%`, background: accent }} />
          </div>
          <span className="font-mono text-[10px]" style={{ color: "var(--ink-3)" }}>{fmtTime(time)}</span>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-[3px]" dir="rtl">
          {LINES.map((l, i) => (
            <button
              key={i}
              type="button"
              onPointerDown={(e) => { e.preventDefault(); setStamps((s) => s.map((x, j) => (j === i ? Math.round(time * 10) / 10 : x))); }}
              className="flex items-center gap-2 px-2.5 py-[5px] rounded-lg text-start cursor-pointer transition-all duration-150"
              style={{
                background: act === i ? `${accent}1a` : "transparent",
                border: `1px solid ${act === i ? accent + "55" : "transparent"}`,
              }}
            >
              <span className="font-mono text-[9px] w-9 flex-none text-end" style={{ color: act === i ? accent : "var(--ink-3)" }}>{fmtTime(stamps[i]).slice(0, 4)}</span>
              <span className="text-[12.5px] leading-5 truncate" style={{ color: act === i ? accent : i < act || act === -1 ? "var(--ink-2)" : "var(--ink-3)", fontWeight: act === i ? 700 : 400, transition: "color .2s" }}>
                {l}
              </span>
            </button>
          ))}
        </div>
      </div>
    </ModelPanel>
  );
}

function LyricsMarkers({ accent }: { accent: string }) {
  const [stamps, setStamps] = useState([...STAMPS0]);
  const { time, playing, toggle } = usePlayer(LDUR);
  const [ref, w] = useWidth<HTMLDivElement>();
  const idxR = useRef<number | null>(null);
  const stampsR = useRef(stamps);
  stampsR.current = stamps;
  const act = activeLine(stamps, time);

  const drag = usePointerDrag(({ x }) => {
    const el = ref.current;
    if (el == null || idxR.current == null || w <= 0) return;
    const r = el.getBoundingClientRect();
    const t = clamp(((x - r.left) / r.width) * LDUR, 0, LDUR - 0.1);
    const i = idxR.current;
    setStamps((s) => s.map((v, j) => {
      if (j !== i) return v;
      const lo = j > 0 ? s[j - 1] + 0.25 : 0;
      const hi = j < s.length - 1 ? s[j + 1] - 0.25 : LDUR;
      return clamp(snap(t, 0.25), lo, hi);
    }));
  });

  return (
    <ModelPanel
      letter="B" name="Marker Drag" tag="فضایی · تراز" accent={accent} flash={false}
      note="هر خط یک مارکر روی موج دارد؛ بکشید تا با تصویر تراز شود — اسنپ روی ربع‌ثانیه و ترتیب محفوظ."
      value={`${fmtTime(time)} · ${stamps.map((s) => s.toFixed(1)).length} markers`} onReset={() => setStamps([...STAMPS0])} height={280}
    >
      <div className="w-full h-full px-3 py-3 flex flex-col justify-center gap-3">
        <div className="flex items-center gap-2">
          <button type="button" className="btn-icon" style={{ width: 32, height: 32, borderRadius: 16, borderColor: `${accent}55`, color: accent }} onClick={toggle} aria-label="play/pause">
            <Icon name={playing ? "pause" : "play"} size={14} />
          </button>
          <span className="font-mono text-[11px]" style={{ color: accent }}>{fmtTime(time)}</span>
          <span className="text-[11px] truncate flex-1 text-end" dir="rtl" style={{ color: act >= 0 ? "var(--ink)" : "var(--ink-3)", fontWeight: 600 }}>
            {act >= 0 ? LINES[act] : "…"}
          </span>
        </div>
        <div
          ref={ref}
          {...drag.handlers}
          className="relative h-24 rounded-lg overflow-hidden"
          style={{ background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Wave peaks={LYR_PEAKS} accent="#565d6b" opacity={0.7} />
          <span className="absolute inset-y-0 w-[2px] z-10 pointer-events-none" style={{ left: `${(time / LDUR) * 100}%`, background: "#e9eaee", boxShadow: "0 0 8px rgba(255,255,255,0.5)" }} />
          {stamps.map((s, i) => (
            <span
              key={i}
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); idxR.current = i; drag.handlers.onPointerDown?.(e); }}
              className="absolute inset-y-0 w-4 -translate-x-1/2 cursor-ew-resize flex flex-col items-center"
              style={{ left: `${(s / LDUR) * 100}%`, touchAction: "none" }}
            >
              <span
                className="w-3 h-3 rounded-full border-2 mt-1"
                style={{ background: act === i ? accent : "#22252d", borderColor: act === i ? accent : "rgba(255,255,255,0.4)", boxShadow: act === i ? `0 0 10px ${accent}` : undefined, transition: "background .2s, border-color .2s" }}
              />
              <span className="w-[1.5px] flex-1" style={{ background: act === i ? accent : "rgba(255,255,255,0.25)" }} />
              <span className="font-mono text-[7.5px] mb-0.5 px-1 rounded" style={{ color: act === i ? accent : "var(--ink-3)", background: "rgba(0,0,0,0.5)" }}>{i + 1}</span>
            </span>
          ))}
        </div>
      </div>
    </ModelPanel>
  );
}

function LyricsNudge({ accent }: { accent: string }) {
  const [stamps, setStamps] = useState([...STAMPS0]);
  const [picked, setPicked] = useState(2);
  const { time, playing, toggle } = usePlayer(LDUR, true);
  const act = activeLine(stamps, time);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el || act < 0) return;
    const child = el.children[act] as HTMLElement | undefined;
    if (child) el.scrollTo({ top: child.offsetTop - el.clientHeight / 2 + child.clientHeight / 2, behavior: "smooth" });
  }, [act]);

  return (
    <ModelPanel
      letter="C" name="Nudge Panel" tag="اصلاحی · حین پخش" accent={accent} flash={false}
      note="حین پخش، خطِ انتخابی را با گامِ ربع‌ثانیه جلو/عقب کنید — برای سینکِ نهایی بدون توقفِ موسیقی."
      value={`line ${picked + 1} @ ${stamps[picked].toFixed(2)}s`} onReset={() => { setStamps([...STAMPS0]); setPicked(2); }} height={280}
    >
      <div className="w-full h-full px-3 py-2.5 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <button type="button" className="btn-icon" style={{ width: 32, height: 32, borderRadius: 16, borderColor: `${accent}55`, color: accent }} onClick={toggle} aria-label="play/pause">
            <Icon name={playing ? "pause" : "play"} size={14} />
          </button>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <span className="block h-full" style={{ width: `${(time / LDUR) * 100}%`, background: accent }} />
          </div>
          <button type="button" className="chip font-mono text-[10.5px] px-2" style={{ "--acc": accent } as React.CSSProperties} onClick={() => setStamps((s) => s.map((v, i) => (i === picked ? Math.max(0, v - 0.25) : v)))}>−0.25s</button>
          <button type="button" className="chip font-mono text-[10.5px] px-2" style={{ "--acc": accent } as React.CSSProperties} onClick={() => setStamps((s) => s.map((v, i) => (i === picked ? Math.min(LDUR - 0.1, v + 0.25) : v)))}>+0.25s</button>
        </div>
        <div ref={listRef} className="flex-1 overflow-hidden relative" dir="rtl">
          <div className="flex flex-col gap-[3px]">
            {LINES.map((l, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPicked(i)}
                className="flex items-center gap-2 px-2.5 py-[5px] rounded-lg text-start cursor-pointer transition-all duration-300"
                style={{
                  background: act === i ? `${accent}16` : picked === i ? "rgba(255,255,255,0.04)" : "transparent",
                  border: `1px solid ${picked === i ? accent + "44" : "transparent"}`,
                  transform: act === i ? "scale(1.02)" : "scale(1)",
                }}
              >
                <span className="font-mono text-[9px] w-9 flex-none text-end" style={{ color: picked === i ? accent : "var(--ink-3)" }}>{stamps[i].toFixed(2)}</span>
                <span className="text-[12.5px] leading-5 truncate" style={{ color: act === i ? accent : "var(--ink-2)", fontWeight: act === i ? 700 : 400 }}>
                  {l}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ModelPanel>
  );
}

export const lyricsDomain: DomainDef = {
  id: "lyrics", num: "12", title: "Lyrics Sync", fa: "سینک متن", accent: "#56c2b8", group: "timeline",
  note: "Tap Sync برای ثبت زنده، Marker Drag برای تراز بصری با موج، و Nudge برای اصلاح ظریف حین پخش — یک قیف کامل از خشن به دقیق.",
  models: [
    { name: "Tap Sync", tag: "", note: "", Comp: LyricsTap },
    { name: "Marker Drag", tag: "", note: "", Comp: LyricsMarkers },
    { name: "Nudge Panel", tag: "", note: "", Comp: LyricsNudge },
  ],
};

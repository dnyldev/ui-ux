import { useEffect, useState } from "react";
import { DomainDef } from "./lib/core";
import { tempoDomain, volumeDomain, pitchDomain } from "./domains/tone";
import { playbackDomain, loopDomain, metroDomain } from "./domains/transport";
import { stemDomain, vocalDomain, eqDomain } from "./domains/mix";
import { waveDomain, beatDomain, selDomain, fadeDomain } from "./domains/wave";
import { chordDomain, lyricsDomain } from "./domains/timeline";

const DOMAINS: DomainDef[] = [
  tempoDomain, volumeDomain, pitchDomain,
  playbackDomain, loopDomain, stemDomain, vocalDomain, eqDomain,
  waveDomain, beatDomain, chordDomain, lyricsDomain, selDomain, fadeDomain, metroDomain,
];

const GROUPS = [
  { id: "control", fa: "کنترل پارامتر", en: "CONTROL" },
  { id: "transport", fa: "پخش و زمان", en: "TRANSPORT" },
  { id: "mix", fa: "میکس و تفکیک", en: "MIX" },
  { id: "edit", fa: "ویرایش موج", en: "EDIT" },
  { id: "timeline", fa: "تایم‌لاین و سینک", en: "TIMELINE" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-9 h-9 rounded-xl flex items-end justify-center gap-[3px] pb-2 border" style={{ background: "linear-gradient(180deg, #23262e, #191b21)", borderColor: "rgba(242,169,59,0.35)" }}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="eqbar w-[3px] rounded-full" style={{ height: 18, background: i % 2 ? "#45c4b0" : "#f2a93b", animationDelay: `${i * 0.18}s` }} />
        ))}
      </span>
      <div className="leading-none">
        <span className="font-disp font-bold text-[16px] tracking-tight block">RESONANCE<span style={{ color: "#f2a93b" }}>·</span>LAB</span>
        <span className="text-[10px] mt-1 block" style={{ color: "var(--ink-3)" }}>آزمایشگاه تعاملِ موسیقی</span>
      </div>
    </div>
  );
}

export default function App() {
  const [id, setId] = useState("tempo");
  const d = DOMAINS.find((x) => x.id === id) ?? DOMAINS[0];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  return (
    <div className="min-h-screen">
      {/* ===== top bar ===== */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-md" style={{ background: "rgba(20,21,25,0.82)", borderColor: "var(--line)" }}>
        <div className="max-w-[1460px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex chip font-mono text-[10.5px] cursor-default">15 domains · 45 models</span>
            <span className="inline-flex chip font-mono text-[10.5px] cursor-default" style={{ borderColor: "rgba(76,201,166,0.4)", color: "#4cc9a6", background: "rgba(76,201,166,0.08)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#4cc9a6", boxShadow: "0 0 6px #4cc9a6" }} />
              frontend-only · mock data
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[1460px] mx-auto px-4 sm:px-6 flex gap-6">
        {/* ===== sidebar (desktop) ===== */}
        <aside className="hidden lg:block w-60 flex-none sticky top-16 self-start py-6 pe-1" style={{ maxHeight: "calc(100vh - 64px)", overflowY: "auto" }}>
          {GROUPS.map((g) => (
            <div key={g.id} className="mb-5">
              <div className="flex items-baseline gap-2 px-2 mb-1.5">
                <span className="text-[10px] font-bold tracking-[0.16em] font-disp" style={{ color: "var(--ink-3)" }}>{g.en}</span>
                <span className="text-[10.5px]" style={{ color: "var(--ink-3)" }}>{g.fa}</span>
              </div>
              <nav className="flex flex-col gap-0.5">
                {DOMAINS.filter((x) => x.group === g.id).map((x) => {
                  const active = x.id === id;
                  return (
                    <button
                      key={x.id}
                      type="button"
                      onClick={() => setId(x.id)}
                      className="nav-item group flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-start cursor-pointer"
                      style={{
                        background: active ? `${x.accent}14` : "transparent",
                        borderInlineStart: `2.5px solid ${active ? x.accent : "transparent"}`,
                      }}
                    >
                      <span className="font-mono text-[10px] w-5 flex-none" style={{ color: active ? x.accent : "var(--ink-3)" }}>{x.num}</span>
                      <span className="w-1.5 h-1.5 rounded-full flex-none transition-transform group-hover:scale-125" style={{ background: x.accent, opacity: active ? 1 : 0.5 }} />
                      <span className="font-disp font-semibold text-[12.5px] leading-tight" style={{ color: active ? "var(--ink)" : "var(--ink-2)" }}>{x.title}</span>
                      <span className="ms-auto text-[10px]" style={{ color: "var(--ink-3)" }}>{x.fa}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </aside>

        {/* ===== main ===== */}
        <main className="flex-1 min-w-0 py-6">
          {/* mobile chips */}
          <nav className="lg:hidden -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {DOMAINS.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setId(x.id)}
                className={`chip font-disp text-[11.5px] flex-none ${x.id === id ? "on" : ""}`}
                style={{ "--acc": x.accent } as React.CSSProperties}
              >
                <span className="font-mono text-[9.5px] opacity-70">{x.num}</span> {x.fa}
              </button>
            ))}
          </nav>

          {/* domain header */}
          <header key={`h-${d.id}`} className="fade-in relative mb-6">
            <div className="flex items-end gap-4 sm:gap-6 flex-wrap">
              <span className="ghost-num text-[74px] sm:text-[96px] select-none">{d.num}</span>
              <div className="flex-1 min-w-52 pb-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-disp font-bold text-[24px] sm:text-[28px] leading-none tracking-tight" dir="ltr" style={{ textAlign: "start" }}>{d.title}</h1>
                  <span className="chip on cursor-default" style={{ "--acc": d.accent } as React.CSSProperties}>{d.fa}</span>
                </div>
                <p className="text-[12.5px] leading-6 mt-2.5 max-w-2xl" style={{ color: "var(--ink-2)" }}>{d.note}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(90deg, ${d.accent}, transparent)` }} />
                  <span className="font-mono text-[9.5px] tracking-[0.2em] uppercase" style={{ color: "var(--ink-3)" }}>3 interaction models · compare</span>
                </div>
              </div>
            </div>
          </header>

          {/* models stage */}
          <div key={d.id} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {d.models.map((m) => {
              const C = m.Comp;
              return <C key={m.name} accent={d.accent} />;
            })}
          </div>

          {/* footer */}
          <footer className="mt-10 pb-8 border-t pt-5 flex flex-wrap items-center gap-x-6 gap-y-2" style={{ borderColor: "var(--line)" }}>
            <span className="font-disp font-bold text-[12px] tracking-wide">RESONANCE<span style={{ color: "#f2a93b" }}>·</span>LAB</span>
            <span className="text-[11px]" style={{ color: "var(--ink-3)" }}>
              پروتوتایپ فرانت‌اند — همه‌ی داده‌ها و پخش‌ها Mock هستند؛ هیچ Backend، API یا پردازش صوتی در کار نیست.
            </span>
            <span className="ms-auto font-mono text-[9.5px] tracking-[0.18em] uppercase" style={{ color: "var(--ink-3)" }}>
              benchmark: ableton · logic · serato · rekordbox · moises
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}

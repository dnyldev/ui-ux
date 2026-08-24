import type { GroupId, Level, Pattern } from "./types";

/** ---- catalog groups (drive the browse taxonomy) ---- */
export const GROUPS: Record<GroupId, { en: string; fa: string }> = {
  control: { en: "CONTROL", fa: "کنترل پارامتر" },
  transport: { en: "TRANSPORT", fa: "پخش و زمان" },
  mix: { en: "MIX", fa: "میکس و تفکیک" },
  timeline: { en: "TIMELINE", fa: "تایم‌لاین و سینک" },
  edit: { en: "EDIT", fa: "ویرایش موج" },
  layout: { en: "LAYOUT", fa: "چیدمان و ساختار" },
  navigation: { en: "NAVIGATION", fa: "ناوبری و بازگشت" },
  motion: { en: "MOTION", fa: "حرکت و انیمیشن" },
  feedback: { en: "FEEDBACK", fa: "بازخورد و وضعیت" },
};

export const GROUP_ORDER: GroupId[] = [
  "control",
  "transport",
  "mix",
  "timeline",
  "edit",
  "layout",
  "navigation",
  "motion",
  "feedback",
];

export const LEVELS: { id: Level; en: string; fa: string; desc: string }[] = [
  {
    id: "atom",
    en: "ATOMS",
    fa: "اتم‌ها",
    desc: "کوچک‌ترین اجزا: دکمه‌ها، اسلایدرها، سوئیچ‌ها، آیکون‌ها و انیمیشن‌های پایه",
  },
  {
    id: "molecule",
    en: "MOLECULES",
    fa: "مولکول‌ها",
    desc: "ترکیب اتم‌ها به یک کارکرد: کنترل پخش، صدا، تمپو، ویوفرم، استم",
  },
  {
    id: "organism",
    en: "ORGANISMS",
    fa: "ارگانیسم‌ها",
    desc: "بخش‌های کامل صفحه: پلیر، تایم‌لاین، کارت کتابخانه",
  },
];

export const LEVEL_META: Record<Level, { color: string; bg: string }> = {
  atom: { color: "text-teal", bg: "bg-teal/10 border-teal/30" },
  molecule: { color: "text-violet", bg: "bg-violet/10 border-violet/30" },
  organism: { color: "text-accent", bg: "bg-accent/10 border-accent/30" },
};

/** ---- pattern registry: one entry per ui/** pattern ---- */
import { Button } from "../ui/atoms/button";
import { buttonMeta } from "../ui/atoms/button/meta";
import { BackButton } from "../ui/atoms/back-button";
import { backButtonMeta } from "../ui/atoms/back-button/meta";
import { IconButton } from "../ui/atoms/icon-button";
import { iconButtonMeta } from "../ui/atoms/icon-button/meta";
import { Slider } from "../ui/atoms/slider";
import { sliderMeta } from "../ui/atoms/slider/meta";
import { Switch } from "../ui/atoms/switch";
import { switchMeta } from "../ui/atoms/switch/meta";
import { Chip } from "../ui/atoms/chip";
import { chipMeta } from "../ui/atoms/chip/meta";
import { Knob } from "../ui/atoms/knob";
import { knobMeta } from "../ui/atoms/knob/meta";
import { Segmented } from "../ui/atoms/segmented";
import { segmentedMeta } from "../ui/atoms/segmented/meta";
import { Tooltip } from "../ui/atoms/tooltip";
import { tooltipMeta } from "../ui/atoms/tooltip/meta";
import { EqualizerBars } from "../ui/atoms/motion/equalizer";
import { equalizerMeta } from "../ui/atoms/motion/equalizer/meta";
import { PulseDot } from "../ui/atoms/motion/pulse-dot";
import { pulseDotMeta } from "../ui/atoms/motion/pulse-dot/meta";
import { PressScale } from "../ui/atoms/motion/press-scale";
import { pressScaleMeta } from "../ui/atoms/motion/press-scale/meta";
import { HoverLift } from "../ui/atoms/motion/hover-lift";
import { hoverLiftMeta } from "../ui/atoms/motion/hover-lift/meta";
import { TransportControls } from "../ui/molecules/transport-controls";
import { transportControlsMeta } from "../ui/molecules/transport-controls/meta";
import { VolumeControl } from "../ui/molecules/volume-control";
import { volumeControlMeta } from "../ui/molecules/volume-control/meta";
import { SeekBar } from "../ui/molecules/seek-bar";
import { seekBarMeta } from "../ui/molecules/seek-bar/meta";
import { TempoControl } from "../ui/molecules/tempo-control";
import { tempoControlMeta } from "../ui/molecules/tempo-control/meta";
import { Waveform } from "../ui/molecules/waveform";
import { waveformMeta } from "../ui/molecules/waveform/meta";
import { EqBands } from "../ui/molecules/eq-bands";
import { eqBandsMeta } from "../ui/molecules/eq-bands/meta";
import { StemRow } from "../ui/molecules/stem-row";
import { stemRowMeta } from "../ui/molecules/stem-row/meta";
import { PlayerBar } from "../ui/organisms/player-bar";
import { playerBarMeta } from "../ui/organisms/player-bar/meta";
import { Timeline } from "../ui/organisms/timeline";
import { timelineMeta } from "../ui/organisms/timeline/meta";
import { LibraryCard } from "../ui/organisms/library-card";
import { libraryCardMeta } from "../ui/organisms/library-card/meta";

export const PATTERNS: Pattern[] = [
  { ...buttonMeta, Component: Button },
  { ...backButtonMeta, Component: BackButton },
  { ...iconButtonMeta, Component: IconButton },
  { ...sliderMeta, Component: Slider },
  { ...switchMeta, Component: Switch },
  { ...chipMeta, Component: Chip },
  { ...knobMeta, Component: Knob },
  { ...segmentedMeta, Component: Segmented },
  { ...tooltipMeta, Component: Tooltip },
  { ...equalizerMeta, Component: EqualizerBars },
  { ...pulseDotMeta, Component: PulseDot },
  { ...pressScaleMeta, Component: PressScale },
  { ...hoverLiftMeta, Component: HoverLift },
  { ...transportControlsMeta, Component: TransportControls },
  { ...volumeControlMeta, Component: VolumeControl },
  { ...seekBarMeta, Component: SeekBar },
  { ...tempoControlMeta, Component: TempoControl },
  { ...waveformMeta, Component: Waveform },
  { ...eqBandsMeta, Component: EqBands },
  { ...stemRowMeta, Component: StemRow },
  { ...playerBarMeta, Component: PlayerBar },
  { ...timelineMeta, Component: Timeline },
  { ...libraryCardMeta, Component: LibraryCard },
];

export const TOTAL_VARIANTS = PATTERNS.reduce((sum, p) => sum + p.variants.length, 0);

export function patternsByLevel(level: Level | null): Pattern[] {
  return level ? PATTERNS.filter((p) => p.level === level) : PATTERNS;
}

export function patternsByGroup(group: GroupId): Pattern[] {
  return PATTERNS.filter((p) => p.groups.includes(group));
}

export function searchPatterns(query: string): Pattern[] {
  const q = query.trim().toLowerCase();
  if (!q) return PATTERNS;
  return PATTERNS.filter((p) => {
    const hay = [
      p.id,
      p.name,
      p.fa,
      p.description,
      p.tags.join(" "),
      p.groups.map((g) => GROUPS[g].en + " " + GROUPS[g].fa).join(" "),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

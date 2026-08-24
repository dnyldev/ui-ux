import type { ComponentType } from "react";
import TempoLab from "./TempoLab";
import VolumeLab from "./VolumeLab";
import PitchLab from "./PitchLab";
import PlaybackLab from "./PlaybackLab";
import LoopLab from "./LoopLab";
import StemMixerLab from "./StemMixerLab";
import VocalIsolationLab from "./VocalIsolationLab";
import EQLab from "./EQLab";
import WaveformLab from "./WaveformLab";
import BeatGridLab from "./BeatGridLab";
import ChordLab from "./ChordLab";
import LyricsLab from "./LyricsLab";
import SelectionLab from "./SelectionLab";
import FadeLab from "./FadeLab";
import MetronomeLab from "./MetronomeLab";

export type Category = {
  id: string;
  no: string;
  title: string;
  tag: string;
  tone: string;
  C: ComponentType;
};

export const CATEGORIES: Category[] = [
  { id: "tempo", no: "01", title: "Tempo", tag: "Set the pace, three ways", tone: "var(--color-accent)", C: TempoLab },
  { id: "volume", no: "02", title: "Volume", tag: "Level control models", tone: "var(--color-amber)", C: VolumeLab },
  { id: "pitch", no: "03", title: "Pitch", tag: "Transpose by semitone", tone: "var(--color-violet)", C: PitchLab },
  { id: "playback", no: "04", title: "Playback", tag: "Seek & scrub", tone: "var(--color-azure)", C: PlaybackLab },
  { id: "loop", no: "05", title: "Loop", tag: "Define an A–B region", tone: "var(--color-amber)", C: LoopLab },
  { id: "stems", no: "06", title: "Stem Mixer", tag: "Vocals · drums · bass · other", tone: "var(--color-accent)", C: StemMixerLab },
  { id: "vocal", no: "07", title: "Vocal Isolation", tag: "Separate voice from mix", tone: "var(--color-azure)", C: VocalIsolationLab },
  { id: "eq", no: "08", title: "EQ", tag: "Shape the spectrum", tone: "var(--color-violet)", C: EQLab },
  { id: "waveform", no: "09", title: "Waveform", tag: "Select · zoom · navigate", tone: "var(--color-azure)", C: WaveformLab },
  { id: "beatgrid", no: "10", title: "Beat Grid", tag: "Align the grid", tone: "var(--color-accent)", C: BeatGridLab },
  { id: "chord", no: "11", title: "Chord Timeline", tag: "Arrange harmony", tone: "var(--color-accent)", C: ChordLab },
  { id: "lyrics", no: "12", title: "Lyrics Sync", tag: "Anchor words to time", tone: "var(--color-accent)", C: LyricsLab },
  { id: "selection", no: "13", title: "Audio Selection", tag: "Mark a region", tone: "var(--color-amber)", C: SelectionLab },
  { id: "fade", no: "14", title: "Fade", tag: "In / out transitions", tone: "var(--color-azure)", C: FadeLab },
  { id: "metronome", no: "15", title: "Metronome", tag: "Tempo & accents", tone: "var(--color-accent)", C: MetronomeLab },
];

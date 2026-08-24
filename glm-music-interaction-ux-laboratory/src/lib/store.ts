import { create } from "zustand";

/**
 * Shared, front-end-only interaction state.
 * The global Tempo value lives here so the bottom Drawer and the
 * Tempo lab stay perfectly in sync — no backend, no persistence.
 */
export type LabState = {
  bpm: number;
  setBpm: (v: number) => void;
  category: string;
  setCategory: (c: string) => void;
  drawer: boolean;
  setDrawer: (b: boolean) => void;
};

export const useLab = create<LabState>((set) => ({
  bpm: 120,
  setBpm: (v) => set({ bpm: v }),
  category: "tempo",
  setCategory: (c) => set({ category: c }),
  drawer: false,
  setDrawer: (b) => set({ drawer: b }),
}));

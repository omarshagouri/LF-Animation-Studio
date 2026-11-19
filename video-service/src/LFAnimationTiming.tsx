import React, { createContext, useContext } from "react";
import { useCurrentFrame as useRawCurrentFrame, useVideoConfig } from "remotion";

/**
 * Long-form reveal choreography. Existing LF animations were authored with
 * entrance events mostly in the first ~60-100 frames; the containing chapter
 * beat often lasts several seconds. Move through those authored cue frames
 * until exactly one second before the assigned beat ends.
 *
 * These numbers are the original code's cue coordinates, NOT the animation's
 * scheduled finish time. The finish time is calculated from the Visual Plan's
 * real beat duration. New animations can define authoredEndFrame locally.
 */
export const LF_AUTHORED_END_FRAME: Readonly<Record<string, number>> = {
  "VA-LF-001": 68,
  "VA-LF-002": 72,
  "VA-LF-003": 73,
  "VA-LF-004": 86,
  "VA-LF-005": 76,
  "VA-LF-006": 79,
  "VA-LF-007": 88,
  "VA-LF-008": 60,
  "VA-LF-009": 75,
  "VA-LF-010": 75,
  "VA-LF-011": 75,
  "VA-LF-012": 83,
  "VA-LF-013": 65,
  // VA-LF-014 already uses the actual beat duration in Dashboard.tsx.
  "VA-LF-015": 110,
  "VA-LF-016": 110,
  "VA-LF-017": 110,
  "VA-LF-018": 110,
  "VA-LF-019": 110,
  "VA-LF-020": 110,
};

type Timing = { animationId: string; durationFrames: number; fps: number; authoredEndFrame?: number };
const Context = createContext<Timing | null>(null);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const LFAnimationTimingProvider: React.FC<{
  animationId: string;
  durationFrames: number;
  authoredEndFrame?: number;
  children: React.ReactNode;
}> = ({ animationId, durationFrames, authoredEndFrame, children }) => {
  const { fps } = useVideoConfig();
  return (
    <Context.Provider value={{ animationId, durationFrames, fps, authoredEndFrame }}>
      {children}
    </Context.Provider>
  );
};

export function getLFRevealProgress(frame: number, durationFrames: number, fps = 30): number {
  // Reveal through the Visual Agent-assigned beat duration minus one second.
  const finalRevealFrame = Math.max(1, durationFrames - fps);
  return clamp01(frame / finalRevealFrame);
}

export function getLFPacedFrame(
  frame: number,
  durationFrames: number,
  animationId: string,
  authoredEndFrame?: number,
  fps = 30,
): number {
  const target = authoredEndFrame ?? LF_AUTHORED_END_FRAME[animationId];
  if (!target || !Number.isFinite(durationFrames) || durationFrames < 2) return frame;
  return target * getLFRevealProgress(frame, durationFrames, fps);
}

/** Animated content uses an authored cue-clock stretched to the real beat. */
export function useLFPacedFrame(): number {
  const raw = useRawCurrentFrame();
  const context = useContext(Context);
  return context
    ? getLFPacedFrame(raw, context.durationFrames, context.animationId, context.authoredEndFrame, context.fps)
    : raw;
}

/** Use this only when continuous natural-speed looping matters independently. */
export function useLFRealFrame(): number {
  return useRawCurrentFrame();
}

/** From 0 to 1 by one second before the real beat ends. */
export function useLFRevealProgress(): number {
  const raw = useRawCurrentFrame();
  const context = useContext(Context);
  return context
    ? getLFRevealProgress(raw, context.durationFrames, context.fps)
    : 1;
}

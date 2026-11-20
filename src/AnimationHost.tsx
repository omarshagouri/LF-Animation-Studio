import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import type { AnimEntry } from "../shared_system/registry";
import { LFAnimationTimingProvider } from "../shared_system/Timing";
import { normalizeBoundedAnimationValues } from "./clampNumeric";
import { Frame } from "./Frame";

/**
 * One reusable stage for all animations.
 * The animation itself supplies its own visuals, settings and preview values.
 * Studio does not contact Google Cloud, Make, Drive or any production service.
 */
export const createAnimationHost = (id: string, entry: AnimEntry) => {
  const Animation = entry.component;

  const AnimationHost: React.FC<Record<string, unknown>> = (props) => {
    const { durationInFrames } = useVideoConfig();

    // Apply defaults from the animation's own Zod schema and clamp numeric inputs.
    const parsed = entry.schema.safeParse(props);
    const values = parsed.success
      ? parsed.data
      : normalizeBoundedAnimationValues(entry.schema, props);

    return (
      <AbsoluteFill>
        {/* Every animation uses the same reusable background and dim layer. */}
        <Frame background={entry.background} dim={entry.backgroundDim} />

        {/* The shared clock stretches authored entrance cues to the preview duration. */}
        <LFAnimationTimingProvider
          animationId={id}
          durationFrames={durationInFrames}
          authoredEndFrame={entry.authoredEndFrame}
        >
          {/* Everything visually unique lives in the matching VA_LF_###.tsx. */}
          <Animation {...values} __holdFrames={durationInFrames} />
        </LFAnimationTimingProvider>
      </AbsoluteFill>
    );
  };

  return AnimationHost;
};

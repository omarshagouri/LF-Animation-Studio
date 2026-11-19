import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";
import { LFAnimationTimingProvider } from "./LFAnimationTiming";

/** Everything specific to an animation lives beside its component. */
export type StudioAnimation = {
  id: string;
  component: React.ComponentType<Record<string, unknown>>;
  durationInFrames: number;
  fps?: number;
  width?: number;
  height?: number;
  defaultProps?: Record<string, unknown>;
  /** An image in video-service/public. Use bg.png for the shared background. */
  background?: string;
  /** 0 = original image, 1 = fully dark. */
  backgroundDim?: number;
  /** Optional authored endpoint for pacing a new long-form reveal. */
  revealLastFrame?: number;
};

/** One background and timing implementation for every animation. */
export const createAnimationHost = (animation: StudioAnimation) => {
  const Animation = animation.component;

  const AnimationHost: React.FC<Record<string, unknown>> = (props) => {
    const { durationInFrames } = useVideoConfig();
    const dim = Math.max(0, Math.min(1, animation.backgroundDim ?? 0));

    return (
      <AbsoluteFill style={{ backgroundColor: "#08121f" }}>
        {animation.background ? (
          <Img
            src={staticFile(animation.background)}
            style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : null}
        {dim > 0 ? <AbsoluteFill style={{ backgroundColor: `rgba(8,18,31,${dim})` }} /> : null}
        <LFAnimationTimingProvider
          animationId={animation.id}
          durationFrames={durationInFrames}
          revealLastFrame={animation.revealLastFrame}
        >
          <Animation {...props} />
        </LFAnimationTimingProvider>
      </AbsoluteFill>
    );
  };

  return AnimationHost;
};

import React from "react";
import { Composition } from "remotion";
import { animationRegistry } from "../shared_system/registry";
import { createAnimationHost } from "./AnimationHost";
import { clampNumeric } from "./clampNumeric";

/**
 * Auto-discover all VA_LF_### files via the shared registry.
 * To add or edit an animation, change only its file in Animations/.
 * Every animation gets its own named 1920×1080 Studio composition.
 */
const registered = Object.keys(animationRegistry)
  .filter((id) => /^VA_LF_\d{3}$/.test(id))
  .sort()
  .map((id) => ({ id, definition: animationRegistry[id] }));

const fps = 30;
const minDurationSec = 3;

export const StudioCompositions: React.FC = () => (
  <>
    {registered.map(({ id, definition }) => {
      const Host = createAnimationHost(id, definition);
      const maxDurationSec = definition.maxDurationSec;
      const durationSchema = maxDurationSec === undefined ? undefined : clampNumeric(minDurationSec, maxDurationSec);
      const defaultProps = definition.previewProps ?? {};
      return (
        <Composition
          key={id}
          id={id.replace(/_/g, "-")}
          component={Host}
          fps={fps}
          width={1920}
          height={1080}
          durationInFrames={Math.max(minDurationSec * fps, Math.round(definition.defaultDurationSec * fps))}
          defaultProps={durationSchema ? { ...defaultProps, durationSec: definition.defaultDurationSec } : defaultProps}
          calculateMetadata={durationSchema && (({ props }) => ({
            durationInFrames: Math.round(durationSchema.parse(props.durationSec) * fps),
          }))}
        />
      );
    })}
  </>
);

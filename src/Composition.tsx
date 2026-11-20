import React from "react";
import { Composition } from "remotion";
import { animationRegistry } from "../shared_system/registry";
import { createAnimationHost } from "./AnimationHost";

/**
 * Auto-discover all VA_LF_### files via the shared registry.
 * To add or edit an animation, change only its file in Animations/.
 * Every animation gets its own named 1920×1080 Studio composition.
 */
const registered = Object.keys(animationRegistry)
  .filter((id) => /^VA_LF_\d{3}$/.test(id))
  .sort()
  .map((id) => ({ id, definition: animationRegistry[id] }));

export const StudioCompositions: React.FC = () => (
  <>
    {registered.map(({ id, definition }) => {
      const Host = createAnimationHost(id, definition);
      return (
        <Composition
          key={id}
          id={id.replace(/_/g, "-")}
          component={Host}
          fps={30}
          width={1920}
          height={1080}
          durationInFrames={Math.max(90, Math.round(definition.defaultDurationSec * 30))}
          defaultProps={definition.previewProps ?? {}}
        />
      );
    })}
  </>
);

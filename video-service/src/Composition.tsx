import { Composition } from "remotion";
import { createAnimationHost, type StudioAnimation } from "./AnimationHost";

// Every .tsx file except internal helpers starting with _ appears automatically.
const files = import.meta.webpackContext("../Animations", {
  recursive: false,
  regExp: /^\.\/(?!_)[^/]+\.tsx$/,
});

const registered = files.keys().sort().map((filename) => {
  const module = files(filename) as { animation?: StudioAnimation };
  if (!module.animation) {
    throw new Error(`${filename} must export an 'animation' configuration.`);
  }
  const fps = module.animation.fps ?? 30;
  if (module.animation.durationInFrames < 3 * fps) {
    throw new Error(`${module.animation.id} must last at least 3 seconds (${3 * fps} frames at ${fps} fps).`);
  }
  return {
    definition: module.animation,
    component: createAnimationHost(module.animation),
  };
});

const ids = registered.map(({ definition }) => definition.id);
if (new Set(ids).size !== ids.length) {
  throw new Error("Duplicate animation IDs found in Animations/.");
}

export const MyComposition = () => (
  <>
    {registered.map(({ definition, component }) => (
      <Composition
        key={definition.id}
        id={definition.id}
        component={component}
        durationInFrames={definition.durationInFrames}
        fps={definition.fps ?? 30}
        width={definition.width ?? 1920}
        height={definition.height ?? 1080}
        defaultProps={definition.defaultProps ?? {}}
      />
    ))}
  </>
);

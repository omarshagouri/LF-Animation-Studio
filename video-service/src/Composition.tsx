import { Composition } from "remotion";
import { VA099test } from "./VA099test";

export const MyComposition = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComponent}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />

      <Composition
        id="Va099test"
        component={VA099test}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};

export const MyComponent = () => {
  return null;
};
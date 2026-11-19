import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import type { StudioAnimation } from "../src/AnimationHost";

export const VA099test: React.FC = () => {
  const frame = useCurrentFrame();

  const charge = interpolate(frame, [0, 180], [10, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        color: "#ffffff",
        fontFamily: "Arial",
        backgroundColor: "rgba(0, 0, 0, 0)"
      }}
    >
      {/* The shared host supplies the background and optional dark overlay. */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 style={{ fontSize: 65 }}>AMPCOREX</h1>
        <p style={{ fontSize: 30 }}>Lithium-ion Battery Charging</p>

        <div
          style={{
            width: 220,
            height: 440,
            border: "8px solid white",
            borderRadius: 25,
            padding: 10,
            display: "flex",
            alignItems: "flex-end",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              height: `${charge}%`,
              background: "linear-gradient(#00ffbb, #008866)",
              borderRadius: 12,
            }}
          />
        </div>

        <h2 style={{ fontSize: 120 }}>{Math.round(charge)}%</h2>

        <p style={{ fontSize: 26, color: "#00ffbb" }}>CHARGING</p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const animation = {
  id: "Va099test",
  component: VA099test,
  durationInFrames: 180,
  fps: 30,
  width: 1920,
  height: 1080,
  background: "bg.png",
  backgroundDim: 0.7,
} satisfies StudioAnimation;

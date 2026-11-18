import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

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
      {/* 1. BACKGROUND IMAGE LAYER */}
      <Img
        // If using local public folder: src={staticFile("bg.png")}
        // If using GitHub raw link, paste it directly as a string below:
        src={staticFile("bg.png")} 
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover", // Ensures the image covers the entire screen nicely
          position: "absolute",
        }}
      />

      {/* 2. OPTIONAL DARK OVERLAY (Dims the photo slightly for text readability) */}
      <AbsoluteFill style={{ backgroundColor: "rgba(8, 18, 31, 0.7)" }} />

      {/* 3. YOUR FOREGROUND CONTENT LAYER */}
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
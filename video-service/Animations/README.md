# AmpCoreX animation playground

**One file per animation. No registration or root edits.**

1. Copy an existing `.tsx` animation in this folder and rename the copy (for example, `VA-LF-021_My_New_Animation.tsx`).
2. Change the component and the exported `animation` configuration **in that file**. Give it a unique `id` (for example, `VA-LF-021`).
3. Save. Remotion Studio automatically discovers it. Run `npm run dev` in `video-service/`.

Each animation may set:

```tsx
export const animation = {
  id: "VA-LF-021",
  component: MyNewAnimation,
  durationInFrames: 180,
  fps: 30,
  width: 1920,
  height: 1080,
  defaultProps: {},
  background: "bg.png",
  backgroundDim: 0,
  revealLastFrame: 70, // Optional: authored reveal endpoint for LF pacing
} satisfies StudioAnimation;
```

- The default image is `video-service/public/bg.png`. For a unique image, add `video-service/public/VA-LF-021.png` and set `background: "VA-LF-021.png"` in that animation's configuration.
- Background, long-form timing, and composition registration are handled by shared files in `src/`.
- Long-form animations can use `useLFPacedFrame` from `../src/LFAnimationTiming` to preserve the production reveal pacing. The timing provider is automatic; for new animation IDs, set `revealLastFrame` in that animation's own configuration. Existing known endpoints match the current production source.
- **This is a separate learning playground.** Saving or previewing here does not deploy to the production video service.

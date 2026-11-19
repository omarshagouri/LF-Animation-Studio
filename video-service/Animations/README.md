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
  authoredEndFrame: 70, // Optional: original code's cue endpoint, NOT the finish time
} satisfies StudioAnimation;
```

- The default image is `video-service/public/bg.png`. For a unique image, add `video-service/public/VA-LF-021.png` and set `background: "VA-LF-021.png"` in that animation's configuration.
- Background, long-form timing, and composition registration are handled by shared files in `src/`.
- Animations using `useLFPacedFrame` or `useLFRevealProgress` reveal their final state **one second before their assigned duration ends**, regardless of the number of frames. The final second stays settled. For new animations with original frame-based choreography, set `authoredEndFrame` to the original cue endpoint; this is **not** the finish time.
- `durationInFrames` is the local Studio preview duration. The production Visual Agent assigns the real beat duration in the visual plan, constrained by the catalog's `Max_duration` for each ID; the standalone playground does not read that live plan automatically.
- **This is a separate learning playground.** Saving or previewing here does not deploy to the production video service.

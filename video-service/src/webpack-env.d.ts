/** Webpack discovers animation files automatically; no registry editing needed. */
interface ImportMeta {
  webpackContext(
    directory: string,
    options: { recursive: boolean; regExp: RegExp },
  ): {
    keys(): string[];
    (request: string): unknown;
  };
}

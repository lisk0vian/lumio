// Runs a callback once document fonts are ready. Font loading is
// best-effort layout input (indicator placement, capture): a rejection must
// never surface, so the swallow is named here instead of inline.
export function whenFontsReady(callback: () => void): void {
  document.fonts?.ready.then(callback).catch(() => {})
}

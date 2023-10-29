export function delay(timeMs: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), timeMs);
  });
}

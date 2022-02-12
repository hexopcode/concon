export function word(n: number): number[] {
  return [n >> 8 & 0xFF, n & 0xFF];
}